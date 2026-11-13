#!/usr/bin/env python3
"""Build the single shareable index.html from src/.

src/template.html holds the page; each line that is exactly a marker is replaced:
  @@css@@                 src/styles.css, inside <style>
  @@shader NAME TYPE@@    src/shaders/NAME.glsl, inside <script id="NAME" type="x-shader/x-TYPE">
  @@js@@                  every src/js/*.js in file-name order, joined (they share one scope)
  @@textures@@            src/tex/*.jpg as data URIs in a JSON <script id="textures">
Run: python3 build.py   (writes index.html next to this script)
"""
import base64
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "index.html"
TEXTURES = ["spruce", "spruce_n", "press", "press_n", "hard", "hard_n"]   # names the page's TEX_LAYERS expect


def read(path):
    if not path.exists():
        sys.exit(f"build.py: missing {path.relative_to(ROOT)}; the template refers to it")
    return path.read_text()


def textures_block():
    data = {name: "data:image/jpeg;base64," + base64.b64encode((SRC / "tex" / f"{name}.jpg").read_bytes()).decode()
            for name in TEXTURES}
    return '<script id="textures" type="application/json">' + json.dumps(data) + "</script>\n"


def expand(line):
    marker = line.strip()
    if marker == "@@css@@":
        return "<style>\n" + read(SRC / "styles.css") + "</style>\n"
    if m := re.fullmatch(r"@@shader (\S+) (vertex|fragment)@@", marker):
        name, kind = m.groups()
        return f'<script id="{name}" type="x-shader/x-{kind}">' + read(SRC / "shaders" / f"{name}.glsl") + "</script>\n"
    if marker == "@@js@@":
        parts = sorted((SRC / "js").glob("*.js"))
        if not parts:
            sys.exit("build.py: src/js/ has no .js files")
        return "".join(p.read_text() for p in parts)
    if marker == "@@textures@@":
        return textures_block()
    if marker.startswith("@@"):
        sys.exit(f"build.py: unknown marker {marker!r} in src/template.html")
    return line


def main():
    html = "".join(expand(line) for line in read(SRC / "template.html").splitlines(keepends=True))
    OUT.write_text(html)
    print(f"build.py: wrote {OUT.name}, {len(html.encode()) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
