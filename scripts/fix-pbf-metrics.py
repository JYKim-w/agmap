#!/opt/homebrew/opt/python@3.14/bin/python3.14
"""
KoPubDotum Bold PBF 메트릭 조정 스크립트.
Korean 글리프의 top 값을 Latin과 맞추기 위해 조정.

분석:
  - Latin '1': top=-8, '2': top=-8  (기준)
  - Korean '산': top=-7             (1px 낮음 → -1 조정 필요)

Usage: python3 scripts/fix-pbf-metrics.py [--analyze] [--apply TOP_ADJUST]
  python3 scripts/fix-pbf-metrics.py --analyze
  python3 scripts/fix-pbf-metrics.py --apply -1
"""

import os, sys, struct

PBF_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                       "assets/fonts/maplibre/KoPubDotum_Bold")

# 한글 범위 (이 범위의 글리프만 top 조정)
KOREAN_RANGES = [
    (0x1100, 0x11FF),   # Hangul Jamo
    (0x3000, 0x303F),   # CJK Symbols
    (0xAC00, 0xD7FF),   # Hangul Syllables
]

def is_korean(cp):
    return any(lo <= cp <= hi for lo, hi in KOREAN_RANGES)


# ─── Protobuf read/write ─────────────────────────────────────────────────────

def read_varint(data, pos):
    result = 0; shift = 0
    while True:
        b = data[pos]; pos += 1
        result |= (b & 0x7F) << shift; shift += 7
        if not (b & 0x80): break
    return result, pos

def zigzag_decode(v): return (v >> 1) ^ -(v & 1)
def zigzag_encode(v): return (v << 1) ^ (v >> 63)

def write_varint(v):
    out = []
    while True:
        b = v & 0x7F; v >>= 7
        out.append(b | (0x80 if v else 0))
        if not v: break
    return bytes(out)

def tag_wire(field, wire): return write_varint((field << 3) | wire)
def encode_len(field, data): return tag_wire(field, 2) + write_varint(len(data)) + data
def encode_uint(field, v):   return tag_wire(field, 0) + write_varint(v)
def encode_sint(field, v):   return tag_wire(field, 0) + write_varint(zigzag_encode(v))


# ─── Parse ──────────────────────────────────────────────────────────────────

def parse_glyphs_from_stack(data):
    """Parse stack bytes → (name, range_str, [glyph_dict])"""
    pos = 0; name = ""; range_str = ""; glyphs = []
    while pos < len(data):
        tag, pos = read_varint(data, pos)
        wire = tag & 7; field = tag >> 3
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
    pos = 0
    g = {"id":0,"bitmap":b"","width":0,"height":0,"left":0,"top":0,"advance":0}
    while pos < len(data):
        tag, pos = read_varint(data, pos)
        wire = tag & 7; field = tag >> 3
        if wire == 2:
            ln, pos = read_varint(data, pos)
            chunk = data[pos:pos+ln]; pos += ln
            if field == 2: g["bitmap"] = chunk
        elif wire == 0:
            v, pos = read_varint(data, pos)
            if field in (1,3,4,7):
                if field == 1: g["id"] = v
                elif field == 3: g["width"] = v
                elif field == 4: g["height"] = v
                elif field == 7: g["advance"] = v
            else:
                sv = zigzag_decode(v)
                if field == 5: g["left"] = sv
                elif field == 6: g["top"] = sv
        else: break
    return g

def parse_pbf(data):
    pos = 0; stacks = []
    while pos < len(data):
        tag, pos = read_varint(data, pos)
        wire = tag & 7; field = tag >> 3
        if wire == 2:
            ln, pos = read_varint(data, pos)
            chunk = data[pos:pos+ln]; pos += ln
            if field == 1:
                stacks.append(parse_glyphs_from_stack(chunk))
        elif wire == 0: _, pos = read_varint(data, pos)
        else: break
    return stacks


# ─── Encode ─────────────────────────────────────────────────────────────────

def encode_glyph(g):
    d = encode_uint(1, g["id"])
    if g["bitmap"]: d += encode_len(2, g["bitmap"])
    d += encode_uint(3, g["width"])
    d += encode_uint(4, g["height"])
    d += encode_sint(5, g["left"])
    d += encode_sint(6, g["top"])
    d += encode_uint(7, g["advance"])
    return d

def encode_stack(name, range_str, glyphs):
    d = encode_len(1, name.encode())
    d += encode_len(2, range_str.encode())
    for g in glyphs:
        d += encode_len(3, encode_glyph(g))
    return d

def encode_pbf(stacks):
    out = b""
    for name, range_str, glyphs in stacks:
        out += encode_len(1, encode_stack(name, range_str, glyphs))
    return out


# ─── Main ────────────────────────────────────────────────────────────────────

def analyze():
    """각 범위 파일의 top 값 분포 출력"""
    korean_tops = []; latin_tops = []
    for fname in sorted(os.listdir(PBF_DIR)):
        if not fname.endswith(".pbf"): continue
        with open(os.path.join(PBF_DIR, fname), "rb") as f:
            data = f.read()
        stacks = parse_pbf(data)
        for _, _, glyphs in stacks:
            for g in glyphs:
                if g["bitmap"] and g["width"] > 0:
                    if is_korean(g["id"]):
                        korean_tops.append(g["top"])
                    else:
                        latin_tops.append(g["top"])

    if latin_tops:
        print(f"Latin top  — min:{min(latin_tops)} max:{max(latin_tops)} "
              f"mean:{sum(latin_tops)/len(latin_tops):.2f} count:{len(latin_tops)}")
    if korean_tops:
        print(f"Korean top — min:{min(korean_tops)} max:{max(korean_tops)} "
              f"mean:{sum(korean_tops)/len(korean_tops):.2f} count:{len(korean_tops)}")
    if latin_tops and korean_tops:
        diff = sum(latin_tops)/len(latin_tops) - sum(korean_tops)/len(korean_tops)
        print(f"\n→ Korean is {abs(diff):.2f}px {'lower' if diff < 0 else 'higher'} than Latin on average")
        print(f"→ Recommended top_adjust: {round(diff)}")


def apply_fix(top_adjust: int):
    """Korean 글리프의 top 값을 top_adjust 만큼 조정하여 PBF 파일 덮어쓰기"""
    files = sorted(f for f in os.listdir(PBF_DIR) if f.endswith(".pbf"))
    modified = 0; total_glyphs = 0

    for fname in files:
        path = os.path.join(PBF_DIR, fname)
        with open(path, "rb") as f:
            data = f.read()

        stacks = parse_pbf(data)
        changed = False
        for _, _, glyphs in stacks:
            for g in glyphs:
                if is_korean(g["id"]) and g["bitmap"] and g["width"] > 0:
                    g["top"] += top_adjust
                    changed = True; total_glyphs += 1

        if changed:
            new_data = encode_pbf(stacks)
            with open(path, "wb") as f:
                f.write(new_data)
            modified += 1
            print(f"  ✓ {fname}")

    print(f"\nDone — {modified} files, {total_glyphs} glyphs adjusted (top {top_adjust:+d})")


if __name__ == "__main__":
    if "--analyze" in sys.argv:
        print("=== Analyzing PBF metrics ===")
        analyze()
    elif "--apply" in sys.argv:
        idx = sys.argv.index("--apply")
        adj = int(sys.argv[idx + 1])
        print(f"=== Applying top adjustment: {adj:+d} to Korean glyphs ===")
        apply_fix(adj)
    else:
        print(__doc__)
        print("\nRunning analysis first...")
        analyze()
