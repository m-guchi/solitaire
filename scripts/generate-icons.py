#!/usr/bin/env python3
"""Rasterize assets/icon.svg to PNG (same renderer as typical browser SVG)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

try:
    import cairosvg
except ImportError:
    print('cairosvg is required: pip install cairosvg', file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / 'assets'
SVG = ICONS / 'icon.svg'

SIZES = [
    ('icon-512.png', 512),
    ('icon-192.png', 192),
    ('apple-touch-icon.png', 180),
    ('favicon-32.png', 32),
]


def main() -> None:
    if not SVG.is_file():
        print(f'missing {SVG}', file=sys.stderr)
        sys.exit(1)

    for name, size in SIZES:
        out = ICONS / name
        cairosvg.svg2png(
            url=str(SVG),
            write_to=str(out),
            output_width=size,
            output_height=size,
            background_color='#1a472a',
        )
        print(f'wrote assets/{name} ({size}x{size})')

    favicon = ICONS / 'favicon.ico'
    try:
        subprocess.run(
            [
                'convert',
                str(ICONS / 'favicon-32.png'),
                str(ICONS / 'icon-192.png'),
                '-colors', '256',
                str(favicon),
            ],
            check=True,
            capture_output=True,
        )
        print('wrote assets/favicon.ico')
    except (FileNotFoundError, subprocess.CalledProcessError):
        print('skipped favicon.ico (ImageMagick convert unavailable)')


if __name__ == '__main__':
    main()
