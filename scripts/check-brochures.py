"""Checks every local reference in public/brochures/ resolves to a real file.

    python scripts/check-brochures.py

The brochures are plain static files, so nothing in the build fails loudly when
a path is wrong — the page just renders without its painting, or falls back to a
system font. This is the check that would have caught that.
"""

import os
import re
import sys
import urllib.parse

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')
BROCHURES = os.path.join(ROOT, 'brochures')

REF = re.compile(r'(?:src|href)="([^"]+)"|url\("?([^")]+?)"?\)')

bad = 0
checked = 0
for slug in sorted(os.listdir(BROCHURES)):
    d = os.path.join(BROCHURES, slug)
    if not os.path.isdir(d) or slug.startswith('_'):
        continue
    for name in sorted(os.listdir(d)):
        if not name.endswith(('.html', '.css')):
            continue
        path = os.path.join(d, name)
        text = open(path, encoding='utf-8').read()
        for m in REF.finditer(text):
            ref = m.group(1) or m.group(2)
            if not ref or ref.startswith(('http', '#', 'data:', 'mailto:')):
                continue
            checked += 1
            target = urllib.parse.unquote(ref.split('?')[0].split('#')[0])
            full = os.path.join(ROOT, target.lstrip('/')) if target.startswith('/') \
                else os.path.join(d, target)
            if not os.path.exists(full):
                print('  MISSING  %s/%s -> %s' % (slug, name, ref))
                bad += 1

print('%d references checked, %d missing' % (checked, bad))
sys.exit(1 if bad else 0)
