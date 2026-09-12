import os
import re
import sys
import json
from PIL import Image

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# 1. Verify Assets
print("--- Checking Favicon and PWA Assets ---")
ico_path = os.path.join(REPO, "favicon.ico")
svg_path = os.path.join(REPO, "favicon.svg")
apple_icon = os.path.join(REPO, "apple-touch-icon.png")
icon192 = os.path.join(REPO, "icon-192.png")
icon512 = os.path.join(REPO, "icon-512.png")
manifest_path = os.path.join(REPO, "site.webmanifest")

for p in [ico_path, svg_path, apple_icon, icon192, icon512, manifest_path]:
    assert os.path.exists(p), f"Missing required asset: {p}"

with Image.open(apple_icon) as im:
    assert im.size == (180, 180), f"apple-touch-icon size is {im.size}"
with Image.open(icon192) as im:
    assert im.size == (192, 192), f"icon-192 size is {im.size}"
with Image.open(icon512) as im:
    assert im.size == (512, 512), f"icon-512 size is {im.size}"
with Image.open(ico_path) as im:
    assert (32, 32) in im.ico.sizes(), "favicon.ico missing 32x32 size"

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)
    assert manifest.get("name"), "manifest missing name"
    assert len(manifest.get("icons", [])) >= 4, "manifest must have at least 4 icons"
print("✓ Favicon, Touch Icons, and PWA Web Manifest fully verified!")

# 2. Verify HTML pages
html_files = sorted([f for f in os.listdir(REPO) if f.endswith(".html")])
print(f"Testing {len(html_files)} HTML pages in aegis-antidetect-browser...")

for f in html_files:
    path = os.path.join(REPO, f)
    with open(path, "r", encoding="utf-8") as fp:
        html = fp.read()
    
    # Check metadata
    assert '<meta charset="UTF-8">' in html, f"Missing charset in {f}"
    assert '<meta name="viewport" content="width=device-width, initial-scale=1.0">' in html, f"Missing viewport in {f}"
    assert '<title>' in html, f"Missing title in {f}"
    assert '<meta name="description"' in html, f"Missing description in {f}"
    assert '<meta name="keywords"' in html, f"Missing keywords in {f}"
    assert '<link rel="canonical"' in html, f"Missing canonical link in {f}"
    assert '<meta name="theme-color"' in html, f"Missing theme-color in {f}"
    assert '<link rel="icon" href="favicon.ico"' in html, f"Missing favicon.ico in {f}"
    assert '<link rel="icon" href="favicon.svg"' in html, f"Missing favicon.svg in {f}"
    assert '<link rel="apple-touch-icon"' in html, f"Missing apple-touch-icon in {f}"
    assert '<link rel="manifest"' in html, f"Missing webmanifest in {f}"
    
    # Check Open Graph and Twitter
    assert 'property="og:title"' in html, f"Missing og:title in {f}"
    assert 'property="og:description"' in html, f"Missing og:description in {f}"
    assert 'property="og:url"' in html, f"Missing og:url in {f}"
    assert 'name="twitter:card"' in html, f"Missing twitter:card in {f}"
    
    # Check Schema.org JSON-LD
    assert '<script type="application/ld+json">' in html, f"Missing JSON-LD in {f}"
    m = re.search(r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>', html, re.DOTALL)
    assert m, f"Could not extract JSON-LD in {f}"
    ld_data = json.loads(m.group(1))
    assert "@context" in ld_data, f"JSON-LD missing @context in {f}"
    assert ld_data.get("@type") == "SoftwareApplication", f"Expected SoftwareApplication schema in {f}"
    
    # Check Accessibility
    assert '<a href="#main-content" class="skip-link">' in html, f"Missing skip link in {f}"
    assert '<main id="main-content">' in html, f"Missing main tag in {f}"
    
    # Check anti-slop punctuation
    assert "—" not in html, f"Found em-dash in {f}"
    assert "–" not in html, f"Found en-dash in {f}"
    
    # Verify inlined SVG sprite exists
    assert '<symbol id="icon-' in html, f"Inlined SVG sprite missing in {f}"

    print(f"✓ {f}: verified with full metadata, SoftwareApplication schema & icons!")

print("ALL AEGIS ANTIDETECT BROWSER PAGES FULLY VERIFIED!")
