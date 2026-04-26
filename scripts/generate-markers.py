#!/usr/bin/env python3
"""Generate marker PNG images for MapLibre field-survey map."""
import os
import sys

try:
    import cairosvg
except ImportError:
    print("cairosvg not found. Run: pip install cairosvg")
    sys.exit(1)

OUT = os.path.join(os.path.dirname(__file__), "../assets/images/markers")
os.makedirs(OUT, exist_ok=True)

def svg2png(svg: str, filename: str):
    base = filename[:-4]  # strip .png
    # @3x — retina quality
    cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(OUT, f"{base}@3x.png"), scale=3)
    # @1x — Metro asset resolution baseline (React Native picks @3x on retina automatically)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=os.path.join(OUT, filename), scale=1)
    print(f"  ✓ {filename}")

# ── Pin teardrop (44×56 viewBox) ─────────────────────────────────────────────
PIN_PATH = "M22,2 C11.5,2 3,10.5 3,21 C3,34 22,54 22,54 C22,54 41,34 41,21 C41,10.5 32.5,2 22,2 Z"

def pin_svg(color: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
  <defs>
    <filter id="s" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="{PIN_PATH}" fill="{color}" filter="url(#s)"/>
  <circle cx="22" cy="21" r="7" fill="white" opacity="0.3"/>
</svg>"""

# ── Urgency badge circle (32×32 viewBox) ─────────────────────────────────────
def badge_warning_svg() -> str:
    return """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#FAB005" stroke="white" stroke-width="2"/>
  <circle cx="16" cy="16" r="8" fill="none" stroke="white" stroke-width="2"/>
  <line x1="16" y1="16" x2="16" y2="10" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <line x1="16" y1="16" x2="21" y2="19" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>"""

def badge_critical_svg() -> str:
    return """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#FD7E14" stroke="white" stroke-width="2"/>
  <line x1="16" y1="8" x2="16" y2="20" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="16" cy="25" r="2" fill="white"/>
</svg>"""

def badge_overdue_svg() -> str:
    return """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#FA5252" stroke="white" stroke-width="2"/>
  <line x1="9" y1="9" x2="23" y2="23" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <line x1="23" y1="9" x2="9" y2="23" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>"""

# ── Cluster count badge (22×22 circle / 28×22 pill for "10+") ────────────────
# SVG <text> = cairosvg가 시스템 폰트로 렌더링 → 글리프 서버 불필요
def count_badge_svg(label: str) -> str:
    is_pill = len(label) > 1
    w = 28 if is_pill else 22
    h = 22
    rx = h // 2
    cx = w / 2
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <rect x="1" y="1" width="{w-2}" height="{h-2}" rx="{rx}" fill="#2b2d42" stroke="white" stroke-width="1.5"/>
  <text x="{cx}" y="15.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-size="11" font-weight="bold" fill="white">{label}</text>
</svg>"""

# ─────────────────────────────────────────────────────────────────────────────

print("Generating pin images...")
pins = [
    ("pin-not-surveyed.png", "#4DABF7"),
    ("pin-draft.png",        "#FAB005"),
    ("pin-submitted.png",    "#20C997"),
    ("pin-approved.png",     "#51CF66"),
    ("pin-rejected.png",     "#FF6B6B"),
    ("pin-cluster.png",      "#2b2d42"),
]
for filename, color in pins:
    svg2png(pin_svg(color), filename)

print("Generating urgency badge images...")
svg2png(badge_warning_svg(), "badge-warning.png")
svg2png(badge_critical_svg(), "badge-critical.png")
svg2png(badge_overdue_svg(), "badge-overdue.png")

print("Generating cluster count background (dynamic text)...")
count_bg_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="28" height="22" viewBox="0 0 28 22">
  <rect x="1" y="1" width="26" height="20" rx="11" fill="#2b2d42" stroke="white" stroke-width="1.5"/>
</svg>"""
svg2png(count_bg_svg, "count-bg.png")

total = len(pins) + 3 + 1
print(f"\nDone — {total} images in assets/images/markers/")
