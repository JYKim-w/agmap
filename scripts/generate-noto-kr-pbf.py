#!/opt/homebrew/opt/python@3.14/bin/python3.14
"""
Generate MapLibre SDF glyph PBF files for Noto Sans KR Regular + Medium.
Pure Python — no native Node modules required.
Requires: fonttools, Pillow, numpy, scipy

Usage: python3 scripts/generate-noto-kr-pbf.py
"""

import os
import sys
import subprocess
import time
import urllib.request

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print("Missing deps. Run: pip3 install fonttools pillow numpy scipy --break-system-packages")
    sys.exit(1)

try:
    from PIL import Image, ImageDraw
    import numpy as np
    from scipy.ndimage import distance_transform_edt
except ImportError:
    print("Missing deps. Run: pip3 install pillow numpy scipy --break-system-packages")
    sys.exit(1)

ROOT     = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT_BASE = os.path.join(ROOT, "assets/fonts/maplibre")
TMP_DIR  = os.path.join(ROOT, ".font-tmp")
os.makedirs(TMP_DIR, exist_ok=True)

FONTS = [
    {"name": "Noto Sans KR Regular", "dir": "Noto_Sans_KR_Regular", "wght": 400},
    {"name": "Noto Sans KR Medium",  "dir": "Noto_Sans_KR_Medium",  "wght": 500},
]

FONT_URL = "https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf"
FONT_SRC = os.path.join(TMP_DIR, "NotoSansKR-VF.ttf")

RANGES: list[tuple[int, int]] = []
for s in range(0, 1024, 256):
    RANGES.append((s, s + 255))
for s in range(0xAC00, 0xD800, 256):
    RANGES.append((s, min(s + 255, 0xD7FF)))
RANGES.append((0x1100, 0x11FF))
RANGES.append((0x3000, 0x303F))
RANGES = sorted(set(RANGES))

FONT_SCALE  = 24
SDF_RADIUS  = 8
BUFFER      = 3


# ─── Protobuf encoding ───────────────────────────────────────────────────────

def _varint(v: int) -> bytes:
    out = []
    while True:
        b = v & 0x7F; v >>= 7
        out.append(b | (0x80 if v else 0))
        if not v: break
    return bytes(out)

def _zigzag(v: int) -> bytes: return _varint((v << 1) ^ (v >> 31))
def _tag(f: int, w: int) -> bytes: return _varint((f << 3) | w)
def _str(f: int, s: str) -> bytes:
    b = s.encode(); return _tag(f, 2) + _varint(len(b)) + b
def _bytes(f: int, b: bytes) -> bytes:
    return _tag(f, 2) + _varint(len(b)) + b
def _u32(f: int, v: int) -> bytes: return _tag(f, 0) + _varint(v)
def _s32(f: int, v: int) -> bytes: return _tag(f, 0) + _zigzag(v)

def encode_glyph(g: dict) -> bytes:
    d  = _u32(1, g["id"])
    if g["bitmap"]: d += _bytes(2, g["bitmap"])
    d += _u32(3, g["width"])
    d += _u32(4, g["height"])
    d += _s32(5, g["left"])
    d += _s32(6, g["top"])
    d += _u32(7, g["advance"])
    return d

def encode_pbf(name: str, range_str: str, glyphs: list[dict]) -> bytes:
    stack  = _str(1, name) + _str(2, range_str)
    for g in glyphs:
        stack += _bytes(3, encode_glyph(g))
    return _bytes(1, stack)


# ─── SDF glyph rendering ─────────────────────────────────────────────────────

def compute_sdf(bitmap: np.ndarray) -> np.ndarray:
    fg = bitmap > 128
    bg = ~fg
    d_in  = distance_transform_edt(fg)   # dist from inside to edge
    d_out = distance_transform_edt(bg)   # dist from outside to edge
    sdf = np.where(fg, d_in, -d_out).astype(np.float32)
    norm = np.clip((sdf / SDF_RADIUS) * 127 + 128, 0, 255).astype(np.uint8)
    return norm


def render_glyph(tt: TTFont, codepoint: int) -> dict | None:
    cmap = tt.getBestCmap()
    if cmap is None or codepoint not in cmap:
        return None

    glyph_name = cmap[codepoint]
    glyf = tt.get("glyf")
    if glyf is None:
        return None

    hmtx = tt["hmtx"]
    metrics = hmtx.metrics.get(glyph_name, (0, 0))
    advance_width, lsb = metrics[0], metrics[1]
    scale = FONT_SCALE / tt["head"].unitsPerEm

    g = glyf[glyph_name]
    if not hasattr(g, "numberOfContours"):
        return None

    if g.numberOfContours == 0 or not hasattr(g, "xMin"):
        return {"id": codepoint, "bitmap": b"", "width": 0, "height": 0,
                "left": 0, "top": 0, "advance": round(advance_width * scale)}

    x_min, y_min, x_max, y_max = g.xMin, g.yMin, g.xMax, g.yMax
    w = max(1, round((x_max - x_min) * scale) + BUFFER * 2)
    h = max(1, round((y_max - y_min) * scale) + BUFFER * 2)
    pad = SDF_RADIUS

    img = Image.new("L", (w + pad * 2, h + pad * 2), 0)
    draw = ImageDraw.Draw(img)

    try:
        coords, flags, end_pts = g.getCoordinates(glyf)
        coords = np.array(coords, dtype=np.float32)
        coords[:, 0] = (coords[:, 0] - x_min) * scale + BUFFER + pad
        coords[:, 1] = (y_max - coords[:, 1]) * scale + BUFFER + pad

        start = 0
        for end in end_pts:
            pts = coords[start:end + 1]
            fl  = flags[start:end + 1]
            poly = []
            n = len(pts)
            for i in range(n):
                p0 = pts[i]; p1 = pts[(i + 1) % n]
                f0 = fl[i] & 1; f1 = fl[(i + 1) % n] & 1
                poly.append((float(p0[0]), float(p0[1])))
                if not (f0 and f1):
                    poly.append(((p0[0]+p1[0])/2, (p0[1]+p1[1])/2))
            if len(poly) >= 3:
                draw.polygon(poly, fill=255)
            start = end + 1
    except Exception:
        return None

    sdf = compute_sdf(np.array(img))
    return {
        "id":      codepoint,
        "bitmap":  sdf.tobytes(),
        "width":   sdf.shape[1],
        "height":  sdf.shape[0],
        "left":    round(lsb * scale),
        "top":     round(y_max * scale),
        "advance": round(advance_width * scale),
    }


# ─── Pipeline ────────────────────────────────────────────────────────────────

def download_font():
    if os.path.exists(FONT_SRC):
        print("  (cached) NotoSansKR-VF.ttf"); return
    print("  Downloading Noto Sans KR variable font (~10MB)...")
    req = urllib.request.Request(FONT_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(FONT_SRC, "wb") as f:
        f.write(r.read())
    print("  ✓ Downloaded")


def instantiate_weight(wght: int, dest: str):
    if os.path.exists(dest): return
    print(f"  Instantiating wght={wght}...")
    script = (
        f"from fontTools.varLib.instancer import instantiateVariableFont\n"
        f"from fontTools.ttLib import TTFont\n"
        f"tt = TTFont(r'{FONT_SRC}')\n"
        f"instantiateVariableFont(tt, {{'wght': {wght}}})\n"
        f"tt.save(r'{dest}')\n"
    )
    subprocess.run([sys.executable, "-c", script], check=True)
    print(f"  ✓ wght={wght} saved")


def generate_pbfs(tt: TTFont, font_name: str, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    existing = {f for f in os.listdir(out_dir) if f.endswith(".pbf")}
    needed   = [(s, e) for s, e in RANGES if f"{s}-{e}.pbf" not in existing]

    if not needed:
        print(f"  ✓ All {len(RANGES)} PBF files already exist"); return

    print(f"  Generating {len(needed)} ranges ({len(existing)} cached)...")
    t0 = time.time()

    for i, (start, end) in enumerate(needed):
        glyphs = []
        for cp in range(start, end + 1):
            g = render_glyph(tt, cp)
            if g:
                glyphs.append(g)

        pbf = encode_pbf(font_name, f"{start}-{end}", glyphs)
        with open(os.path.join(out_dir, f"{start}-{end}.pbf"), "wb") as f:
            f.write(pbf)

        if (i + 1) % 5 == 0 or (i + 1) == len(needed):
            elapsed = time.time() - t0
            eta = (elapsed / (i + 1)) * (len(needed) - i - 1)
            print(f"  {i+1}/{len(needed)} ranges  ({elapsed:.0f}s elapsed, ~{eta:.0f}s remaining)  ", end="\r")

    count = len([f for f in os.listdir(out_dir) if f.endswith(".pbf")])
    print(f"\n  ✓ {count} PBFs generated in {time.time()-t0:.0f}s")


def main():
    print("=== Noto Sans KR PBF Generator ===")
    print(f"  Ranges: {len(RANGES)} ({sum(e-s+1 for s,e in RANGES):,} codepoints)\n")

    download_font()

    for font in FONTS:
        print(f"\n── {font['name']} ──")
        weight_path = os.path.join(TMP_DIR, f"NotoSansKR-{font['wght']}.ttf")
        out_dir = os.path.join(OUT_BASE, font["dir"])

        instantiate_weight(font["wght"], weight_path)

        print("  Loading font...")
        tt = TTFont(weight_path)
        generate_pbfs(tt, font["name"], out_dir)

        size_kb = sum(
            os.path.getsize(os.path.join(out_dir, f))
            for f in os.listdir(out_dir) if f.endswith(".pbf")
        ) // 1024
        print(f"  Total size: ~{size_kb} KB")

    print("\n=== Done ===")
    print("Korean text will now render on the map.")
    print("Update SurveyStatusLayer.tsx: textFont: ['Noto Sans KR Medium']")


if __name__ == "__main__":
    main()
