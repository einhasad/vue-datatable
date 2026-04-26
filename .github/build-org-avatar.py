"""
Generate .github/org-avatar.png from the Einhasad Cross source.

Source symbol © NCSOFT (Lineage 2 / Echoes of Darkness wiki). Used here
as the basis for the einhasad organization mark — same namesake deity.

Run from repo root:
    python3 .github/build-org-avatar.py

Output: .github/org-avatar.png  (1000x1000, ready to upload as the org's
profile picture at https://github.com/organizations/einhasad/settings/profile).
"""
from pathlib import Path
from urllib.request import urlretrieve

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SOURCE_URL = (
    "https://static.wikia.nocookie.net/echoesofdarkness/images/f/f3/"
    "Einhasad_Cross.png/revision/latest?cb=20140302214325"
)
SOURCE_CACHE = HERE / "einhasad-cross-source.png"
OUTPUT = HERE / "org-avatar.png"

CANVAS = 1000
RADIUS = 220
INK = (26, 21, 5, 255)         # --ink
PAPER_YELLOW = (255, 200, 51, 255)  # --accent

if not SOURCE_CACHE.exists():
    urlretrieve(SOURCE_URL, SOURCE_CACHE)

# Yellow rounded square background
bg = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
ImageDraw.Draw(bg).rounded_rectangle(
    (0, 0, CANVAS - 1, CANVAS - 1), radius=RADIUS, fill=PAPER_YELLOW
)

# Recolor the source to deep ink, masked by its own alpha
ref = Image.open(SOURCE_CACHE).convert("RGBA")
ink_layer = Image.new("RGBA", ref.size, INK)
masked = Image.new("RGBA", ref.size, (0, 0, 0, 0))
masked.paste(ink_layer, (0, 0), mask=ref.split()[3])

# Scale to ~78% of canvas height, keep aspect, center
target_h = int(CANVAS * 0.78)
ratio = target_h / masked.height
target_w = int(masked.width * ratio)
masked = masked.resize((target_w, target_h), Image.LANCZOS)

x = (CANVAS - target_w) // 2
y = (CANVAS - target_h) // 2
bg.alpha_composite(masked, (x, y))

bg.save(OUTPUT, "PNG")
print(f"wrote {OUTPUT.relative_to(HERE.parent)} ({CANVAS}x{CANVAS})")
