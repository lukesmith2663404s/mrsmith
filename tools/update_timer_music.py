#!/usr/bin/env python3
"""Build js/timer-music.js from audio files in assets/music."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import quote

AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a", ".aac"}
HURRY_SUFFIX = re.compile(r"^(?P<base>.+?)\s*\(Hurry Up!\)$", re.IGNORECASE)
TRANSITION_NAMES = {"hurry up!", "hurry up"}
FIXED_DURATION_OVERRIDES = {
    "countdown": 30,
}
LABEL_OVERRIDES = {
    "countdown": "Countdown",
}


def project_root() -> Path:
    return Path(__file__).resolve().parents[1]


def normalise_name(value: str) -> str:
    return " ".join(value.casefold().split())


def slugify(value: str) -> str:
    normalised = unicodedata.normalize("NFKD", value)
    ascii_value = normalised.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value.casefold()).strip("-")
    return slug or "track"


def browser_src(root: Path, path: Path) -> str:
    relative = path.relative_to(root).as_posix()
    return "../../" + quote(relative, safe="/")


def js_manifest(entries: list[dict[str, object]]) -> str:
    lines = [
        "/*",
        "  Generated timer music manifest.",
        "",
        "  Run update-timer-music.bat after adding or removing files in assets/music.",
        "  Files named \"Track Name (Hurry Up!).mp3\" are paired automatically with",
        "  \"Track Name.mp3\" and the shared \"Hurry Up!.mp3\" transition.",
        "*/",
        "",
        "globalThis.TIMER_MUSIC_OPTIONS = Object.freeze([",
    ]

    for index, entry in enumerate(entries):
        serialised = json.dumps(entry, ensure_ascii=False, indent=2)
        indented = "\n".join("  " + line for line in serialised.splitlines())
        comma = "," if index < len(entries) - 1 else ""
        lines.append(f"  Object.freeze({indented.strip()}){comma}")

    lines.extend([
        "]);",
        "",
    ])
    return "\n".join(lines)


def unique_id(base: str, used: set[str]) -> str:
    candidate = base
    number = 2

    while candidate in used:
        candidate = f"{base}-{number}"
        number += 1

    used.add(candidate)
    return candidate


def main() -> int:
    root = project_root()
    music_root = root / "assets" / "music"
    output_path = root / "js" / "timer-music.js"

    music_root.mkdir(parents=True, exist_ok=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    files = sorted(
        (
            path for path in music_root.rglob("*")
            if path.is_file() and path.suffix.casefold() in AUDIO_EXTENSIONS
        ),
        key=lambda path: path.relative_to(music_root).as_posix().casefold(),
    )

    transition_files = [
        path for path in files
        if normalise_name(path.stem) in TRANSITION_NAMES
    ]
    transition = transition_files[0] if transition_files else None

    by_stem: dict[str, list[Path]] = {}

    for path in files:
        by_stem.setdefault(normalise_name(path.stem), []).append(path)

    hurry_variants: list[tuple[Path, str]] = []

    for path in files:
        match = HURRY_SUFFIX.match(path.stem)
        if match:
            hurry_variants.append((path, match.group("base").strip()))

    consumed: set[Path] = set(transition_files)
    entries: list[dict[str, object]] = [
        {
            "id": "none",
            "label": "No music",
            "type": "none",
            "durationMode": "none",
            "durationSeconds": None,
            "src": None,
        }
    ]
    used_ids = {"none"}
    warnings: list[str] = []

    for hurry_path, base_label in hurry_variants:
        consumed.add(hurry_path)
        base_candidates = by_stem.get(normalise_name(base_label), [])
        same_folder = [
            path for path in base_candidates
            if path.parent == hurry_path.parent
        ]
        base_path = (same_folder or base_candidates or [None])[0]

        if base_path is not None:
            consumed.add(base_path)

        if transition is None:
            warnings.append(
                f"Skipped {hurry_path.name}: no shared Hurry Up!.mp3 was found."
            )
            continue

        if base_path is None:
            warnings.append(
                f"Skipped {hurry_path.name}: no matching {base_label}{hurry_path.suffix} was found."
            )
            continue

        entry_id = unique_id(
            slugify(f"{base_label}-hurry-up"),
            used_ids,
        )
        entries.append({
            "id": entry_id,
            "label": f"{base_label} — Hurry Up!",
            "type": "hurry-up",
            "durationMode": "minimum",
            "durationSeconds": None,
            "baseSrc": browser_src(root, base_path),
            "transitionSrc": browser_src(root, transition),
            "hurrySrc": browser_src(root, hurry_path),
        })

    for path in files:
        if path in consumed:
            continue

        raw_label = path.stem
        normalised_label = normalise_name(raw_label)
        label = LABEL_OVERRIDES.get(normalised_label, raw_label)
        entry_id = unique_id(slugify(label), used_ids)
        override = FIXED_DURATION_OVERRIDES.get(normalised_label)

        entries.append({
            "id": entry_id,
            "label": label,
            "type": "standard",
            "durationMode": "fixed",
            "durationSeconds": override,
            "src": browser_src(root, path),
        })

    output_path.write_text(js_manifest(entries), encoding="utf-8")

    print(f"Updated {output_path.relative_to(root)}")
    print(f"Found {len(files)} audio files.")
    print(f"Created {len(entries) - 1} selectable music options.")

    hurry_count = sum(1 for entry in entries if entry["type"] == "hurry-up")
    print(f"Created {hurry_count} Hurry Up! sequences.")

    if transition:
        print(
            "Shared transition: " +
            str(transition.relative_to(root))
        )

    for warning in warnings:
        print(f"WARNING: {warning}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
