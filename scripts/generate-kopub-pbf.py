#!/opt/homebrew/opt/python@3.14/bin/python3.14
"""
Generate MapLibre SDF glyph PBF files for KoPub Dotum Medium.
Follows MapLibre/fontnik glyph PBF convention:
  - width/height = CONTENT dimensions (excluding border)
  - bitmap = (width + 2*BORDER) x (height + 2*BORDER) bytes
  - BORDER = 3 (GLYPH_PBF_BORDER hardcoded in MapLibre)

Usage: python3 scripts/generate-kopub-pbf.py
"""

import os, sys, time
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt
from fontTools.ttLib import TTFont

ROOT     = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT_DIR  = os.path.join(ROOT, "assets/fonts/maplibre/KoPub_Dotum_Medium")
FONT_SRC = "/Users/dev/Downloads/KOPUB2.0_TTF_FONTS/KoPub Dotum Medium.ttf"

os.makedirs(OUT_DIR, exist_ok=True)

RANGES: list[tuple[int, int]] = []
for s in range(0, 1024, 256):
    RANGES.append((s, s + 255))
for s in range(0xAC00, 0xD800, 256):
    RANGES.append((s, min(s + 255, 0xD7FF)))
RANGES.append((0x1100, 0x11FF))
RANGES.append((0x3000, 0x303F))
RANGES = sorted(set(RANGES))

FONT_SCALE = 24       # render size (pt) — matches MapLibre expectation
BORDER     = 3        # GLYPH_PBF_BORDER (fixed in MapLibre source)
SDF_PAD    = 8        # internal SDF computation radius (>= BORDER for accuracy)


# ─── Protobuf ────────────────────────────────────────────────────────────────

def _vi(v):
    out = []
    while True:
        b = v & 0x7F; v >>= 7
        out.append(b | (0x80 if v else 0))
        if not v: break
    return bytes(out)

def _zz(v): return _vi((v << 1) ^ (v >> 31))
def _tag(f, w): return _vi((f << 3) | w)
def _str(f, s): b = s.encode(); return _tag(f, 2) + _vi(len(b)) + b
def _byt(f, b): return _tag(f, 2) + _vi(len(b)) + b
def _u32(f, v): return _tag(f, 0) + _vi(v)
def _s32(f, v): return _tag(f, 0) + _zz(v)

def encode_glyph(g):
    d  = _u32(1, g["id"])
    if g["bitmap"]: d += _byt(2, g["bitmap"])
    d += _u32(3, g["width"]); d += _u32(4, g["height"])
    d += _s32(5, g["left"]);  d += _s32(6, g["top"])
    d += _u32(7, g["advance"])
    return d

def encode_pbf(name, range_str, glyphs):
    stack = _str(1, name) + _str(2, range_str)
    for g in glyphs:
        stack += _byt(3, encode_glyph(g))
    return _byt(1, stack)


# ─── SDF rendering ───────────────────────────────────────────────────────────

def compute_sdf_raw(bitmap: np.ndarray) -> np.ndarray:
    """Return raw signed distance field (positive=inside, negative=outside)."""
    fg    = bitmap > 128
    d_in  = distance_transform_edt(fg)
    d_out = distance_transform_edt(~fg)
    return np.where(fg, d_in, -d_out).astype(np.float32)


def render_glyph(tt, cmap, glyf, hmtx, upm, codepoint):
    if codepoint not in cmap:
        return None

    glyph_name = cmap[codepoint]
    g = glyf[glyph_name]
    if not hasattr(g, "numberOfContours"):
        return None

    metrics = hmtx.metrics.get(glyph_name, (0, 0))
    advance_width, lsb = metrics
    scale = FONT_SCALE / upm

    if g.numberOfContours == 0 or not hasattr(g, "xMin"):
        return {"id": codepoint, "bitmap": b"", "width": 0, "height": 0,
                "left": 0, "top": 0, "advance": round(advance_width * scale)}

    x_min, y_min, x_max, y_max = g.xMin, g.yMin, g.xMax, g.yMax

    # Content dimensions (EXCLUDING border)
    content_w = max(1, round((x_max - x_min) * scale))
    content_h = max(1, round((y_max - y_min) * scale))

    # Internal render canvas: content + SDF_PAD on each side
    render_w = content_w + 2 * SDF_PAD
    render_h = content_h + 2 * SDF_PAD

    img  = Image.new("L", (render_w, render_h), 0)
    draw = ImageDraw.Draw(img)

    try:
        coords, end_pts, flags = g.getCoordinates(glyf)
        coords = np.array(coords, dtype=np.float32)
        coords[:, 0] = (coords[:, 0] - x_min) * scale + SDF_PAD
        coords[:, 1] = (y_max - coords[:, 1]) * scale + SDF_PAD

        # Build contour polygons with bezier approximation
        contours: list[tuple[list, float]] = []
        start = 0
        for end in end_pts:
            pts = coords[start:end + 1]
            fl  = flags[start:end + 1]
            poly = []
            n = len(pts)
            for i in range(n):
                p0 = pts[i]; p1 = pts[(i + 1) % n]
                poly.append((float(p0[0]), float(p0[1])))
                if not ((fl[i] & 1) and (fl[(i + 1) % n] & 1)):
                    poly.append(((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2))
            if len(poly) >= 3:
                # Signed area: positive = CCW (exterior), negative = CW (hole)
                area = sum(
                    poly[i][0] * poly[(i + 1) % len(poly)][1] -
                    poly[(i + 1) % len(poly)][0] * poly[i][1]
                    for i in range(len(poly))
                ) / 2
                contours.append((poly, area))
            start = end + 1

        # Draw exterior contours first (fill=255), then holes (fill=0)
        for poly, area in sorted(contours, key=lambda c: c[1], reverse=True):
            fill = 255 if area > 0 else 0
            draw.polygon(poly, fill=fill)
    except Exception:
        return None

    # Compute SDF on full internal canvas
    sdf_raw = compute_sdf_raw(np.array(img))

    # Crop to BORDER=3 region (trim SDF_PAD - BORDER pixels from each edge)
    trim = SDF_PAD - BORDER
    cropped = sdf_raw[trim:trim + content_h + 2 * BORDER,
                      trim:trim + content_w + 2 * BORDER]

    # Normalize relative to BORDER distance (MapLibre expects this scale)
    normalized = np.clip((cropped / BORDER) * 127 + 128, 0, 255).astype(np.uint8)

    return {
        "id":      codepoint,
        "bitmap":  normalized.tobytes(),
        "width":   content_w,              # content only, NO border
        "height":  content_h,              # content only, NO border
        "left":    round(lsb * scale) - BORDER,
        "top":     round(y_max * scale) + BORDER,
        "advance": round(advance_width * scale),
    }


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("=== KoPub Dotum Medium PBF Generator ===")
    print(f"  Ranges: {len(RANGES)}, BORDER={BORDER}, SDF_PAD={SDF_PAD}\n")

    tt   = TTFont(FONT_SRC)
    cmap = tt.getBestCmap()
    glyf = tt.get("glyf")
    hmtx = tt["hmtx"]
    upm  = tt["head"].unitsPerEm

    existing = {f for f in os.listdir(OUT_DIR) if f.endswith(".pbf")}
    needed   = [(s, e) for s, e in RANGES if f"{s}-{e}.pbf" not in existing]

    if not needed:
        print(f"✓ All {len(RANGES)} PBF files already exist"); return

    print(f"Generating {len(needed)} ranges ({len(existing)} cached)...")
    t0 = time.time()

    for i, (start, end) in enumerate(needed):
        glyphs = [g for cp in range(start, end + 1)
                  if (g := render_glyph(tt, cmap, glyf, hmtx, upm, cp)) is not None]
        pbf = encode_pbf("KoPub Dotum Medium", f"{start}-{end}", glyphs)
        with open(os.path.join(OUT_DIR, f"{start}-{end}.pbf"), "wb") as f:
            f.write(pbf)
        if (i + 1) % 5 == 0 or (i + 1) == len(needed):
            elapsed = time.time() - t0
            eta = (elapsed / (i + 1)) * (len(needed) - i - 1)
            print(f"  {i+1}/{len(needed)}  ({elapsed:.0f}s, ~{eta:.0f}s left)  ", end="\r")

    total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, f))
                   for f in os.listdir(OUT_DIR) if f.endswith(".pbf")) // 1024
    print(f"\n✓ Done — {len(RANGES)} files, ~{total_kb} KB")


if __name__ == "__main__":
    main()
