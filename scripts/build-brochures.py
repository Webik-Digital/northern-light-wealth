"""Turns NLW's brochure hand-off bundles into pages this site can serve.

    python scripts/build-brochures.py <folder of *-Web-Handoff bundles>

The bundles arrive from NLW as one zip per pathway, each a standalone page plus
its own copy of four fonts, three logos and a painting. Served as they arrive,
three brochures cost about 6 MB, most of it the same four font files sent three
times. This rewrites them into public/brochures/ with the shared parts shared:

  public/brochures/_assets/fonts   four faces, once, as woff2 (~70% smaller)
  public/brochures/_assets/logos   three SVGs, once
  public/brochures/<slug>/         the page, its stylesheet, its painting

Nothing about the design is touched. The HTML is NLW's, the CSS is NLW's, and
the only edits are to the paths they point at and the image format. Re-run it
whenever NLW sends a new bundle; it overwrites what is there.

Needs Pillow, and fonttools with brotli (pip install pillow fonttools brotli).
"""

import os
import re
import shutil
import sys

from PIL import Image
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(os.path.dirname(HERE), 'public', 'brochures')

# The folder name a bundle lands in is the site's own route for that pathway, so
# /estate-ready and /brochures/estate-ready stay recognisably the same thing.
SLUGS = {
    'estateready': 'estate-ready',
    'saleready': 'sale-ready',
    'harvestshare': 'harvest-share',
}

WEBP_QUALITY = 86  # paintings; visually indistinguishable, roughly a tenth the size


def find_bundles(root):
    """Every directory holding exactly one brochure .html."""
    out = []
    for d, _, files in os.walk(root):
        html = [f for f in files if f.endswith('.html')]
        if len(html) == 1:
            out.append((d, html[0]))
    return sorted(out)


def shared_fonts(bundles):
    """One woff2 per face. The TTFs are byte-identical across bundles."""
    dest = os.path.join(PUBLIC, '_assets', 'fonts')
    os.makedirs(dest, exist_ok=True)
    seen = {}
    for d, _ in bundles:
        fdir = os.path.join(d, 'assets', 'fonts')
        if not os.path.isdir(fdir):
            continue
        for name in sorted(os.listdir(fdir)):
            if not name.endswith('.ttf') or name in seen:
                continue
            out = os.path.join(dest, name[:-4] + '.woff2')
            f = TTFont(os.path.join(fdir, name))
            f.flavor = 'woff2'
            f.save(out)
            before = os.path.getsize(os.path.join(fdir, name))
            after = os.path.getsize(out)
            seen[name] = os.path.basename(out)
            print('  font  %-28s %6.0f KB -> %5.0f KB' % (name, before / 1024, after / 1024))
    return seen


def shared_logos(bundles):
    """One copy of each logo, under a name without spaces in it."""
    dest = os.path.join(PUBLIC, '_assets', 'logos')
    os.makedirs(dest, exist_ok=True)
    mapping = {}
    for d, _ in bundles:
        for sub in ('logos', 'images'):
            sdir = os.path.join(d, 'assets', sub)
            if not os.path.isdir(sdir):
                continue
            for name in sorted(os.listdir(sdir)):
                if not name.endswith('.svg'):
                    continue
                # The same three marks arrive under two naming schemes:
                # "nlw-logo-badge-wide.svg" from two bundles and
                # "Logo - Badge - Wide.svg" from SaleReady. Matching on the
                # words rather than the spelling keeps it to three files, and
                # drops the spaces, which are an escaping problem in a URL.
                words = set(re.findall(r'[a-z]+', name.lower()))
                if {'badge', 'wide'} <= words:
                    flat = 'nlw-logo-badge-wide.svg'
                elif 'condensed' in words:
                    flat = 'nlw-logo-primary-condensed.svg'
                elif 'stacked' in words:
                    flat = 'nlw-logo-primary-stacked.svg'
                else:
                    flat = re.sub(r'[^a-z0-9.]+', '-', name.lower()).strip('-')
                target = os.path.join(dest, flat)
                if not os.path.exists(target):
                    shutil.copy2(os.path.join(sdir, name), target)
                mapping['assets/%s/%s' % (sub, name)] = '../_assets/logos/' + flat
    return mapping


# The site's own routes. Two of the bundles link to addresses that have never
# existed here — nlwealth.ca/saleready, nlwealth.ca/harvestshare — which the SPA
# answers with its not-found page.
SITE_LINKS = {
    'https://nlwealth.ca/estateready': 'https://www.nlwealth.ca/estate-ready',
    'https://nlwealth.ca/saleready': 'https://www.nlwealth.ca/sale-ready',
    'https://nlwealth.ca/harvestshare': 'https://www.nlwealth.ca/harvest-share',
}


def apply_rewrites(text, table):
    """One pass, longest key first.

    Replacing key by key re-reads what was just written: once
    assets/images/x.svg has become ../_assets/logos/x.svg, the later key
    assets/logos/x.svg matches inside that result and rewrites it again, giving
    ../_../_assets/logos/x.svg. A single alternation cannot overlap itself.
    """
    if not table:
        return text
    keys = sorted(table, key=len, reverse=True)
    pattern = re.compile('|'.join(re.escape(k) for k in keys))
    return pattern.sub(lambda m: table[m.group(0)], text)


def build(d, html_name, logo_map, font_map):
    stem = html_name[:-5].lower().replace('-', '').replace('_', '')
    slug = SLUGS.get(stem)
    if not slug:
        print('  !! no slug for %s, skipped' % html_name)
        return None
    out = os.path.join(PUBLIC, slug)
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(os.path.join(out, 'assets'), exist_ok=True)

    rewrites = dict(logo_map)

    # paintings: PNG at a tenth the weight, same pixels
    idir = os.path.join(d, 'assets', 'images')
    if os.path.isdir(idir):
        for name in sorted(os.listdir(idir)):
            if not name.lower().endswith('.png'):
                continue
            src = os.path.join(idir, name)
            im = Image.open(src)
            if im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] == 255:
                im = im.convert('RGB')
            new = name[:-4] + '.webp'
            im.save(os.path.join(out, 'assets', new), 'WEBP', quality=WEBP_QUALITY, method=6)
            after = os.path.getsize(os.path.join(out, 'assets', new))
            print('  image %-28s %6.0f KB -> %5.0f KB' % (name, os.path.getsize(src) / 1024, after / 1024))
            rewrites['assets/images/' + name] = 'assets/' + new

    # fonts, and the preload links in the HTML that point at the same files
    for ttf, woff2 in font_map.items():
        rewrites['assets/fonts/' + ttf] = '../_assets/fonts/' + woff2
    rewrites['format("truetype")'] = 'format("woff2")'
    rewrites.update(SITE_LINKS)

    # The HTML percent-encodes the spaces in SaleReady's logo names, so the
    # literal path never appears there and the plain key never matches.
    for key, val in list(rewrites.items()):
        if ' ' in key:
            rewrites[key.replace(' ', '%20')] = val

    for name in os.listdir(d):
        if name.endswith('.css'):
            text = apply_rewrites(open(os.path.join(d, name), encoding='utf-8').read(), rewrites)
            open(os.path.join(out, 'brochure.css'), 'w', encoding='utf-8', newline='\n').write(text)
        elif name.endswith('.js'):
            shutil.copy2(os.path.join(d, name), os.path.join(out, 'brochure.js'))

    text = apply_rewrites(open(os.path.join(d, html_name), encoding='utf-8').read(), rewrites)
    text = re.sub(r'href="[^"]+\.css"', 'href="brochure.css"', text)
    text = re.sub(r'src="[^"]+\.js"', 'src="brochure.js"', text)
    # a woff2 preload must say so, and must be anonymous-CORS like any font fetch
    text = re.sub(
        r'<link([^>]*?)rel="preload"([^>]*?)\.woff2"([^>]*?)>',
        lambda m: '<link%srel="preload"%s.woff2"%s type="font/woff2" crossorigin>'
        % (m.group(1), m.group(2), m.group(3).replace(' type="font/ttf"', '').replace(' crossorigin', '')),
        text,
    )

    # A reader can arrive here straight from a search result with no way back to
    # the site and no way to get the printable copy. Appended after NLW's own
    # content; it changes nothing above it.
    foot = (
        '\n<footer class="nlw-brochure-foot">\n'
        '  <a href="/brochures/%s.pdf" download>Download the PDF</a>\n'
        '  <a href="https://www.nlwealth.ca/%s">Back to %s</a>\n'
        '</footer>\n'
        '<style>\n'
        '.nlw-brochure-foot{display:flex;gap:28px;flex-wrap:wrap;justify-content:center;\n'
        '  padding:34px 20px 46px;font-family:"Source Sans 3",system-ui,sans-serif;font-size:15px}\n'
        '.nlw-brochure-foot a{color:#1B5B6E;text-decoration:none;border-bottom:1px solid rgba(27,91,110,.3);\n'
        '  padding-bottom:2px}\n'
        '.nlw-brochure-foot a:hover{border-bottom-color:#1B5B6E}\n'
        '@media print{.nlw-brochure-foot{display:none}}\n'
        '</style>\n'
    ) % (slug, slug, slug.replace('-', ' ').title().replace(' ', ''))

    text = text.replace('</body>', foot + '</body>')
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8', newline='\n').write(text)
    return slug


def main():
    if len(sys.argv) < 2 or not os.path.isdir(sys.argv[1]):
        print(__doc__)
        sys.exit(1)
    root = sys.argv[1]
    bundles = find_bundles(root)
    if not bundles:
        print('No bundle found under %s' % root)
        sys.exit(1)
    print('Found %d bundle(s)' % len(bundles))
    font_map = shared_fonts(bundles)
    logo_map = shared_logos(bundles)
    built = [build(d, h, logo_map, font_map) for d, h in bundles]
    print('\nBuilt: %s' % ', '.join(b for b in built if b))


if __name__ == '__main__':
    main()
