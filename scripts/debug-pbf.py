#!/opt/homebrew/opt/python@3.14/bin/python3.14
"""
PBF glyph decoder + PNG visualizer.
Decodes a MapLibre glyph PBF and saves each glyph bitmap as PNG.

Usage: python3 scripts/debug-pbf.py <pbf_file> [codepoint...]
  python3 scripts/debug-pbf.py assets/fonts/maplibre/Noto_Sans_KR_Bold/0-255.pbf 65 49 48 57
"""

import sys, os
import struct
from PIL import Image

def read_varint(data, pos):
    result = 0; shift = 0
    while True:
        b = data[pos]; pos += 1
        result |= (b & 0x7F) << shift; shift += 7
        if not (b & 0x80): break
    return result, pos

def read_zigzag(data, pos):
    v, pos = read_varint(data, pos)
    return ((v >> 1) ^ -(v & 1)), pos

def parse_pbf(data):
    pos = 0; glyphs = []; stack_name = ""; stack_range = ""
    # top-level: field 1 = glyph_stack (LEN)
    while pos < len(data):
        tag, pos = read_varint(data, pos)
        wire = tag & 0x7
        field = tag >> 3
        if wire == 2:
            ln, pos = read_varint(data, pos)
            chunk = data[pos:pos+ln]; pos += ln
            if field == 1:  # glyph_stack
                stack_name, stack_range, glyphs = parse_stack(chunk)
        elif wire == 0:
            _, pos = read_varint(data, pos)
        else:
            break
    return stack_name, stack_range, glyphs

def parse_stack(data):
    pos = 0; name = ""; range_str = ""; glyphs = []
    while pos < len(data):
        tag, pos = read_varint(data, pos)
        wire = tag & 0x7; field = tag >> 3
        if wire == 2:
            ln, pos = read_varint(data, pos)
            chunk = data[pos:pos+ln]; pos += ln
            if field == 1: name = chunk.decode()
            elif field == 2: range_str = chunk.decode()
            elif field == 3: glyphs.append(parse_glyph(chunk))
        elif wire == 0: _, pos = read_varint(data, pos)
        else: break
    return name, range_str, glyphs

def parse_glyph(data):
    pos = 0; g = {"id":0,"bitmap":b"","width":0,"height":0,"left":0,"top":0,"advance":0}
    while pos < len(data):
        tag, pos = read_varint(data, pos)
        wire = tag & 0x7; field = tag >> 3
        if wire == 2:
            ln, pos = read_varint(data, pos)
            chunk = data[pos:pos+ln]; pos += ln
            if field == 2: g["bitmap"] = chunk
        elif wire == 0:
            if field in (1,3,4,7):
                v, pos = read_varint(data, pos)
                if field == 1: g["id"] = v
                elif field == 3: g["width"] = v
                elif field == 4: g["height"] = v
                elif field == 7: g["advance"] = v
            else:  # fields 5,6 = signed (zigzag)
                v, pos = read_zigzag(data, pos)
                if field == 5: g["left"] = v
                elif field == 6: g["top"] = v
        else: break
    return g

def visualize_glyph(g, out_path):
    w = g["width"]; h = g["height"]
    if not g["bitmap"] or w == 0 or h == 0:
        print(f"  (empty bitmap, w={w} h={h})")
        return
    # bitmap = (h+6) x (w+6) bytes (BORDER=3 on each side)
    bw = w + 6; bh = h + 6
    expected = bw * bh
    actual = len(g["bitmap"])
    print(f"  content {w}x{h}, bitmap expected {bw}x{bh}={expected}B, actual {actual}B")

    if actual != expected:
        print(f"  !! MISMATCH — bitmap size wrong")
        # Try to show whatever we have
        bw = bh = int(actual**0.5) + 1

    try:
        img = Image.frombytes("L", (bw, bh), g["bitmap"][:bw*bh])
        img_big = img.resize((bw*8, bh*8), Image.NEAREST)
        img_big.save(out_path)
        print(f"  Saved: {out_path}")

        # Print min/max/edge values
        import numpy as np
        arr = np.frombuffer(g["bitmap"][:bw*bh], dtype=np.uint8).reshape(bh, bw)
        print(f"  SDF value range: min={arr.min()} max={arr.max()} mean={arr.mean():.1f}")
        print(f"  Edge row (row 3, content start): {arr[3].tolist()}")
    except Exception as e:
        print(f"  Error rendering: {e}")

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)

    pbf_path = sys.argv[1]
    target_cps = [int(x) for x in sys.argv[2:]] if len(sys.argv) > 2 else None

    with open(pbf_path, "rb") as f:
        data = f.read()

    name, range_str, glyphs = parse_pbf(data)
    print(f"Font: {name}, Range: {range_str}, Glyphs: {len(glyphs)}")

    out_dir = os.path.join(os.path.dirname(pbf_path), "debug")
    os.makedirs(out_dir, exist_ok=True)

    for g in glyphs:
        if target_cps and g["id"] not in target_cps:
            continue
        cp = g["id"]
        char = chr(cp) if cp < 128 else f"U+{cp:04X}"
        print(f"\nGlyph '{char}' (cp={cp}): w={g['width']} h={g['height']} "
              f"left={g['left']} top={g['top']} advance={g['advance']}")
        out = os.path.join(out_dir, f"glyph_{cp:05d}_{char if cp<128 else ''}.png")
        visualize_glyph(g, out)

if __name__ == "__main__":
    main()
