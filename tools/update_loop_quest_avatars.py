from __future__ import annotations

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

OUTPUT_FILE = PROJECT_ROOT / "js" / "loop-quest-avatar-parts.js"

FOLDERS = {
    "bodies": [
        PROJECT_ROOT / "assets" / "images" / "loop-quest" / "bodies",
        PROJECT_ROOT / "assets" / "images" / "loop-quest" / "body",
    ],
    "faces": [
        PROJECT_ROOT / "assets" / "images" / "loop-quest" / "faces",
        PROJECT_ROOT / "assets" / "images" / "loop-quest" / "face",
    ],
    "headwear": [
        PROJECT_ROOT / "assets" / "images" / "loop-quest" / "headwear",
        PROJECT_ROOT / "assets" / "images" / "loop-quest" / "hats",
    ],
}


def display_name(path: Path) -> str:
    name = path.stem.replace("_", " ").replace("-", " ")
    return " ".join(word.capitalize() for word in name.split())


def relative_web_path(path: Path) -> str:
    return path.relative_to(PROJECT_ROOT).as_posix()


def collect_parts(folders: list[Path]) -> list[dict[str, str]]:
    files: list[Path] = []

    for folder in folders:
        if folder.exists():
            files.extend(folder.glob("*.png"))

    unique_files = sorted(set(files), key=lambda item: item.name.lower())

    return [
        {
            "name": display_name(path),
            "src": relative_web_path(path),
        }
        for path in unique_files
    ]


def main() -> None:
    parts = {
        key: collect_parts(folders)
        for key, folders in FOLDERS.items()
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    js = (
        '"use strict";\n\n'
        "window.LOOP_QUEST_AVATAR_PARTS = Object.freeze("
        + json.dumps(parts, indent=2)
        + ");\n"
    )

    OUTPUT_FILE.write_text(js, encoding="utf-8")

    print("Updated", OUTPUT_FILE)
    for key, entries in parts.items():
        print(f"{key}: {len(entries)}")


if __name__ == "__main__":
    main()
