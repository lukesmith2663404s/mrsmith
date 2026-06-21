#!/usr/bin/env python3
"""
Download approved fictional-character images from exact Fandom communities.

The script:
1. Reads data/characters.csv.
2. Opens each specified Fandom page (or searches only within that wiki).
3. Extracts the main portable-infobox image.
4. Saves a local WebP copy.
5. Generates a review page and reports.
6. Generates js/generated-character-items.js.
7. Inserts successful character records into js/clue-item-generator.js.

Python 3.8+ compatible.
"""

import argparse
import csv
import difflib
import html as html_module
import io
import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Set, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageOps, UnidentifiedImageError


USER_AGENT = (
    "MathsMiniGamesCharacterDownloader/1.0 "
    "(personal classroom project; contact via local project owner)"
)
REQUEST_TIMEOUT = 25
MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024
MAX_IMAGE_SIZE = (1200, 1200)
MIN_IMAGE_SIDE = 120
DEFAULT_WORKERS = 2

MARKER_START = "// FANDOM_CHARACTER_ITEMS_START"
MARKER_END = "// FANDOM_CHARACTER_ITEMS_END"

REQUIRED_COLUMNS = [
    "id",
    "label",
    "subcategory",
    "franchise",
    "fandom_wiki",
    "fandom_page",
    "search_term",
    "recognisability",
    "enabled",
    "approved",
    "image_override_file",
    "image_override_url",
    "notes",
]


def parse_bool(value: object, default: bool = False) -> bool:
    text = str(value or "").strip().lower()
    if text in {"1", "true", "yes", "y", "on"}:
        return True
    if text in {"0", "false", "no", "n", "off"}:
        return False
    return default


def normalise_text(value: str) -> str:
    value = re.sub(r"\([^)]*\)", " ", str(value or ""))
    value = value.replace("_", " ").lower()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def safe_filename(value: str) -> str:
    value = normalise_text(value).replace(" ", "-")
    return value or "character"


def clean_html_text(value: str) -> str:
    return BeautifulSoup(str(value or ""), "html.parser").get_text(" ", strip=True)


def load_manifest(path: Path) -> List[Dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        missing = [column for column in REQUIRED_COLUMNS if column not in (reader.fieldnames or [])]
        if missing:
            raise ValueError(
                "Manifest is missing columns: " + ", ".join(missing)
            )
        rows = []
        seen_ids: Set[str] = set()
        for line_number, row in enumerate(reader, start=2):
            item_id = str(row.get("id", "")).strip()
            if not item_id:
                raise ValueError("Blank id on manifest line {}".format(line_number))
            if item_id in seen_ids:
                raise ValueError("Duplicate id in manifest: {}".format(item_id))
            seen_ids.add(item_id)
            rows.append({key: str(value or "").strip() for key, value in row.items()})
        return rows


def write_manifest(path: Path, rows: Sequence[Dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=REQUIRED_COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in REQUIRED_COLUMNS})


def read_id_file(path: Optional[Path]) -> Set[str]:
    if not path:
        return set()
    values: Set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        item_id = line.strip()
        if item_id and not item_id.startswith("#"):
            values.add(item_id)
    return values


class FandomClient:
    def __init__(self, pause_seconds: float = 0.15) -> None:
        self.pause_seconds = max(0.0, pause_seconds)
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "application/json,text/html,image/*,*/*;q=0.8",
        })

    def api_url(self, wiki: str) -> str:
        wiki = wiki.strip()
        if not wiki:
            raise ValueError("No Fandom wiki was supplied.")
        if "." in wiki:
            host = wiki
            if host.startswith("http://") or host.startswith("https://"):
                parsed = urlparse(host)
                host = parsed.netloc
        else:
            host = "{}.fandom.com".format(wiki)
        return "https://{}/api.php".format(host)

    def page_url(self, wiki: str, title: str) -> str:
        host = urlparse(self.api_url(wiki)).netloc
        title_path = requests.utils.quote(title.replace(" ", "_"), safe="/:()'!,.-")
        return "https://{}/wiki/{}".format(host, title_path)

    def api_get(self, wiki: str, params: Dict[str, str]) -> Dict[str, object]:
        merged = {
            "format": "json",
            "formatversion": "2",
        }
        merged.update(params)
        last_error: Optional[Exception] = None
        for attempt in range(3):
            try:
                response = self.session.get(
                    self.api_url(wiki),
                    params=merged,
                    timeout=REQUEST_TIMEOUT,
                )
                response.raise_for_status()
                data = response.json()
                if "error" in data:
                    error = data["error"]
                    raise RuntimeError(
                        "{}: {}".format(
                            error.get("code", "api-error"),
                            error.get("info", "Unknown API error"),
                        )
                    )
                if self.pause_seconds:
                    time.sleep(self.pause_seconds)
                return data
            except Exception as error:
                last_error = error
                if attempt < 2:
                    time.sleep(1.0 + attempt)
        raise RuntimeError("Fandom API request failed: {}".format(last_error))

    def search_titles(self, wiki: str, search_term: str, limit: int = 8) -> List[str]:
        data = self.api_get(wiki, {
            "action": "query",
            "list": "search",
            "srsearch": search_term,
            "srnamespace": "0",
            "srlimit": str(limit),
        })
        results = data.get("query", {}).get("search", [])
        return [str(item.get("title", "")).strip() for item in results if item.get("title")]

    def parse_page(self, wiki: str, title: str) -> Tuple[str, str, str]:
        data = self.api_get(wiki, {
            "action": "parse",
            "page": title,
            "prop": "text|displaytitle",
            "redirects": "1",
        })
        parsed = data.get("parse")
        if not parsed:
            raise RuntimeError("Page could not be parsed: {}".format(title))
        resolved_title = str(parsed.get("title") or title)
        display_title = clean_html_text(parsed.get("displaytitle") or resolved_title)
        page_html = parsed.get("text") or ""
        if isinstance(page_html, dict):
            page_html = page_html.get("*", "")
        return resolved_title, display_title, str(page_html)

    def file_info(self, wiki: str, file_name: str) -> Dict[str, str]:
        file_name = str(file_name or "").strip()
        if not file_name:
            raise RuntimeError("The image file name was blank.")
        if not file_name.lower().startswith(("file:", "image:")):
            file_name = "File:" + file_name
        data = self.api_get(wiki, {
            "action": "query",
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": "1200",
            "titles": file_name,
        })
        pages = data.get("query", {}).get("pages", [])
        if not pages:
            raise RuntimeError("Image file was not found: {}".format(file_name))
        page = pages[0]
        info_list = page.get("imageinfo") or []
        if not info_list:
            raise RuntimeError("No image information was returned for {}".format(file_name))
        info = info_list[0]
        return {
            "file_name": str(page.get("title") or file_name),
            "url": str(info.get("thumburl") or info.get("url") or ""),
            "original_url": str(info.get("url") or ""),
            "mime": str(info.get("mime") or ""),
        }

    def choose_page_title(
        self,
        wiki: str,
        exact_page: str,
        search_term: str,
        label: str,
    ) -> List[str]:
        candidates: List[str] = []
        if exact_page:
            candidates.append(exact_page)

        query = search_term or label
        try:
            search_results = self.search_titles(wiki, query)
        except Exception:
            search_results = []

        target = normalise_text(label)
        scored: List[Tuple[float, str]] = []
        for title in search_results:
            normalised = normalise_text(title)
            score = difflib.SequenceMatcher(None, target, normalised).ratio()
            if normalised == target:
                score += 2.0
            elif normalised.startswith(target) or target.startswith(normalised):
                score += 0.7
            if any(bad in title.lower() for bad in [
                "/gallery",
                "gallery:",
                "category:",
                "list of ",
                "disambiguation",
            ]):
                score -= 1.5
            scored.append((score, title))

        for _, title in sorted(scored, reverse=True):
            if title not in candidates:
                candidates.append(title)
        return candidates

    def extract_main_image(
        self,
        wiki: str,
        page_html: str,
    ) -> Dict[str, str]:
        soup = BeautifulSoup(page_html, "html.parser")
        selectors = [
            '.portable-infobox figure[data-source="image"] img.pi-image-thumbnail',
            '.portable-infobox figure.pi-image img.pi-image-thumbnail',
            '.portable-infobox .pi-image img.pi-image-thumbnail',
            'aside.portable-infobox img.pi-image-thumbnail',
            '.portable-infobox img',
            'table.infobox img',
            '.infobox img',
        ]

        images = []
        for selector in selectors:
            images = soup.select(selector)
            if images:
                break

        if not images:
            raise RuntimeError("No main portable-infobox image was found.")

        errors: List[str] = []
        for image in images:
            file_name = (
                image.get("data-image-key")
                or image.get("data-image-name")
            )
            if not file_name and image.parent:
                file_name = (
                    image.parent.get("data-image-key")
                    or image.parent.get("data-image-name")
                )
            if file_name:
                try:
                    info = self.file_info(wiki, str(file_name))
                    if info.get("url"):
                        return info
                except Exception as error:
                    errors.append(str(error))

            source = (
                image.get("data-src")
                or image.get("data-lazy-src")
                or image.get("src")
            )
            if not source:
                srcset = image.get("srcset") or image.get("data-srcset")
                if srcset:
                    source = srcset.split(",")[-1].strip().split(" ")[0]
            if source:
                source = html_module.unescape(str(source))
                if source.startswith("//"):
                    source = "https:" + source
                return {
                    "file_name": str(file_name or ""),
                    "url": source,
                    "original_url": source,
                    "mime": "",
                }

        raise RuntimeError(
            "The infobox image was found, but no downloadable URL was available. "
            + " ".join(errors)
        )

    def resolve_character_image(self, row: Dict[str, str]) -> Dict[str, str]:
        wiki = row["fandom_wiki"]
        override_url = row.get("image_override_url", "").strip()
        override_file = row.get("image_override_file", "").strip()

        if override_url:
            return {
                "resolved_page": row.get("fandom_page") or row.get("search_term") or row["label"],
                "display_title": row["label"],
                "source_page": self.page_url(
                    wiki,
                    row.get("fandom_page") or row.get("search_term") or row["label"],
                ),
                "image_url": override_url,
                "image_file": "",
                "resolution_method": "override-url",
            }

        page_candidates = self.choose_page_title(
            wiki,
            row.get("fandom_page", ""),
            row.get("search_term", ""),
            row["label"],
        )
        if not page_candidates:
            raise RuntimeError("No candidate Fandom page could be found.")

        page_errors: List[str] = []
        for title in page_candidates:
            try:
                resolved_title, display_title, page_html = self.parse_page(wiki, title)
                if override_file:
                    image_info = self.file_info(wiki, override_file)
                    method = "override-file"
                else:
                    image_info = self.extract_main_image(wiki, page_html)
                    method = "portable-infobox"

                return {
                    "resolved_page": resolved_title,
                    "display_title": display_title,
                    "source_page": self.page_url(wiki, resolved_title),
                    "image_url": image_info["url"],
                    "image_file": image_info.get("file_name", ""),
                    "resolution_method": method,
                }
            except Exception as error:
                page_errors.append("{}: {}".format(title, error))

        raise RuntimeError(
            "No usable infobox image was found. " + " | ".join(page_errors)
        )

    def download_image(self, url: str, destination: Path) -> Dict[str, object]:
        response = self.session.get(url, timeout=REQUEST_TIMEOUT, stream=True)
        response.raise_for_status()

        chunks: List[bytes] = []
        total = 0
        for chunk in response.iter_content(chunk_size=65536):
            if not chunk:
                continue
            total += len(chunk)
            if total > MAX_DOWNLOAD_BYTES:
                raise RuntimeError("Image exceeded the 25 MB download limit.")
            chunks.append(chunk)

        raw = b"".join(chunks)
        try:
            with Image.open(io.BytesIO(raw)) as original:
                try:
                    original.seek(0)
                except EOFError:
                    pass
                image = ImageOps.exif_transpose(original)
                image.load()
                width, height = image.size
                if min(width, height) < MIN_IMAGE_SIDE:
                    raise RuntimeError(
                        "Image is too small ({}×{}).".format(width, height)
                    )

                image.thumbnail(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS)

                has_alpha = (
                    image.mode in {"RGBA", "LA"}
                    or (
                        image.mode == "P"
                        and "transparency" in image.info
                    )
                )
                image = image.convert("RGBA" if has_alpha else "RGB")

                destination.parent.mkdir(parents=True, exist_ok=True)
                image.save(destination, "WEBP", quality=90, method=6)
                return {
                    "original_width": width,
                    "original_height": height,
                    "saved_width": image.size[0],
                    "saved_height": image.size[1],
                    "bytes": destination.stat().st_size,
                    "content_type": response.headers.get("Content-Type", ""),
                }
        except UnidentifiedImageError:
            raise RuntimeError("The downloaded file was not a readable image.")


def metadata_path_for(image_path: Path) -> Path:
    return image_path.with_suffix(".json")


def load_existing_metadata(image_path: Path) -> Optional[Dict[str, object]]:
    metadata_path = metadata_path_for(image_path)
    if not image_path.exists() or not metadata_path.exists():
        return None
    try:
        return json.loads(metadata_path.read_text(encoding="utf-8"))
    except Exception:
        return None


def process_row(
    row: Dict[str, str],
    client: FandomClient,
    asset_root: Path,
    force: bool,
) -> Dict[str, object]:
    record: Dict[str, object] = {
        "id": row["id"],
        "label": row["label"],
        "subcategory": row["subcategory"],
        "franchise": row["franchise"],
        "fandom_wiki": row["fandom_wiki"],
        "requested_page": row["fandom_page"],
        "recognisability": row["recognisability"] or "high",
        "enabled": parse_bool(row["enabled"], True),
        "approved": parse_bool(row["approved"], True),
        "notes": row.get("notes", ""),
        "status": "pending",
        "error": "",
    }

    relative_folder = Path(row["subcategory"])
    image_path = asset_root / relative_folder / "{}.webp".format(safe_filename(row["id"]))
    record["local_path"] = image_path.as_posix()

    if not record["enabled"]:
        record["status"] = "disabled"
        return record

    if not row["fandom_wiki"]:
        record["status"] = "failed"
        record["error"] = "No Fandom wiki was specified."
        return record

    if not force:
        existing = load_existing_metadata(image_path)
        if existing:
            existing.update(record)
            existing["status"] = "existing"
            existing["local_path"] = image_path.as_posix()
            return existing

    try:
        resolved = client.resolve_character_image(row)
        download_info = client.download_image(resolved["image_url"], image_path)
        record.update(resolved)
        record.update(download_info)
        record["status"] = "downloaded"
        metadata_path_for(image_path).write_text(
            json.dumps(record, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception as error:
        record["status"] = "failed"
        record["error"] = str(error)

    return record


def project_relative_web_path(project_root: Path, absolute_path: Path) -> str:
    relative = absolute_path.resolve().relative_to(project_root.resolve())
    return "../../" + relative.as_posix()


def build_character_items(
    rows_by_id: Dict[str, Dict[str, str]],
    records: Sequence[Dict[str, object]],
    project_root: Path,
) -> List[Dict[str, object]]:
    items: List[Dict[str, object]] = []
    for record in records:
        if record.get("status") not in {"downloaded", "existing"}:
            continue
        row = rows_by_id[str(record["id"])]
        if not parse_bool(row.get("enabled"), True):
            continue
        if not parse_bool(row.get("approved"), True):
            continue

        absolute_path = Path(str(record["local_path"]))
        if not absolute_path.is_absolute():
            absolute_path = project_root / absolute_path
        if not absolute_path.exists():
            continue

        items.append({
            "id": row["id"],
            "label": row["label"],
            "spokenName": row["label"],
            "subcategoryId": row["subcategory"],
            "imagePath": project_relative_web_path(project_root, absolute_path),
            "sourcePage": str(record.get("source_page") or ""),
            "imageSource": "local-fandom-download",
            "franchise": row["franchise"],
            "fandomWiki": row["fandom_wiki"],
            "fandomPage": str(record.get("resolved_page") or row["fandom_page"]),
            "recognisability": row["recognisability"] or "high",
            "familyId": "franchise:{}".format(
                safe_filename(row["franchise"] or row["id"])
            ),
            "tags": [
                "character",
                row["subcategory"],
                "fandom-local",
            ],
        })
    return items


def json_for_javascript(value: object, indent: int = 2) -> str:
    return json.dumps(value, ensure_ascii=False, indent=indent)


def write_generated_js(path: Path, items: Sequence[Dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = (
        "/* Generated by download_character_images.py. */\n"
        "globalThis.GENERATED_CHARACTER_ITEMS = "
        + json_for_javascript(list(items), 2)
        + ";\n"
    )
    path.write_text(content, encoding="utf-8")


def patch_generator(path: Path, items: Sequence[Dict[str, object]]) -> None:
    source = path.read_text(encoding="utf-8")
    start_index = source.find(MARKER_START)
    end_index = source.find(MARKER_END)
    if start_index < 0 or end_index < 0 or end_index <= start_index:
        raise RuntimeError(
            "The generator does not contain the character marker comments."
        )

    line_start = source.rfind("\n", 0, start_index) + 1
    indentation = re.match(r"\s*", source[line_start:start_index]).group(0)
    generated = json_for_javascript(list(items), 2)
    inner = generated[1:-1].strip()

    replacement_lines = [MARKER_START]
    if inner:
        for line in inner.splitlines():
            replacement_lines.append(indentation + "  " + line)
    replacement_lines.append(indentation + MARKER_END)
    replacement = "\n".join(replacement_lines)

    patched = source[:start_index] + replacement + source[end_index + len(MARKER_END):]
    path.write_text(patched, encoding="utf-8")


def write_reports(
    report_json_path: Path,
    report_csv_path: Path,
    records: Sequence[Dict[str, object]],
) -> None:
    report_json_path.parent.mkdir(parents=True, exist_ok=True)
    report_json_path.write_text(
        json.dumps(list(records), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    fieldnames = [
        "id",
        "label",
        "subcategory",
        "franchise",
        "fandom_wiki",
        "requested_page",
        "resolved_page",
        "status",
        "source_page",
        "image_file",
        "local_path",
        "resolution_method",
        "original_width",
        "original_height",
        "saved_width",
        "saved_height",
        "error",
        "notes",
    ]
    with report_csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for record in records:
            writer.writerow(record)


def review_html(records: Sequence[Dict[str, object]], project_root: Path, review_path: Path) -> str:
    serialisable = []
    for record in records:
        copy = dict(record)
        local_path = copy.get("local_path")
        if local_path and copy.get("status") in {"downloaded", "existing"}:
            absolute = Path(str(local_path))
            if not absolute.is_absolute():
                absolute = project_root / absolute
            copy["review_image"] = os.path.relpath(
                absolute,
                review_path.parent,
            ).replace(os.sep, "/")
        else:
            copy["review_image"] = ""
        serialisable.append(copy)

    data_json = json.dumps(serialisable, ensure_ascii=False).replace("</", "<\\/")
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Character Image Review</title>
  <style>
    :root {{ color-scheme: dark; }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: Arial, sans-serif;
      color: #f7f7f7;
      background: #161616;
    }}
    header {{
      position: sticky;
      top: 0;
      z-index: 3;
      padding: 1rem;
      background: rgba(20,20,20,.96);
      border-bottom: 1px solid #555;
    }}
    h1 {{ margin: 0 0 .7rem; }}
    .controls {{
      display: flex;
      flex-wrap: wrap;
      gap: .6rem;
      align-items: center;
    }}
    button, select, input {{
      font: inherit;
    }}
    button, select {{
      padding: .55rem .8rem;
      color: #fff;
      background: #333;
      border: 1px solid #777;
      border-radius: .45rem;
    }}
    .summary {{ margin-left: auto; }}
    main {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }}
    article {{
      display: grid;
      grid-template-rows: 220px auto;
      overflow: hidden;
      background: #242424;
      border: 2px solid #555;
      border-radius: .75rem;
    }}
    article.failed {{ border-color: #c84b4b; }}
    article.disabled {{ opacity: .55; }}
    .image {{
      display: grid;
      place-items: center;
      overflow: hidden;
      background: #0c0c0c;
    }}
    .image img {{
      width: 100%;
      height: 100%;
      object-fit: contain;
    }}
    .unavailable {{
      padding: 1rem;
      color: #ffb0b0;
      text-align: center;
    }}
    .details {{ padding: .8rem; }}
    .details h2 {{ margin: 0 0 .4rem; font-size: 1.1rem; }}
    .details p {{ margin: .25rem 0; font-size: .88rem; overflow-wrap: anywhere; }}
    .details a {{ color: #86cfff; }}
    label.disable {{
      display: flex;
      gap: .45rem;
      align-items: center;
      margin-top: .7rem;
      font-weight: 700;
    }}
  </style>
</head>
<body>
<header>
  <h1>Character Image Review</h1>
  <div class="controls">
    <label>Status
      <select id="statusFilter">
        <option value="all">All</option>
        <option value="downloaded">Downloaded/existing</option>
        <option value="failed">Failed</option>
        <option value="disabled">Disabled</option>
      </select>
    </label>
    <label>Search <input id="searchInput" type="search"></label>
    <button id="downloadDisabled" type="button">Download disable list</button>
    <span id="summary" class="summary"></span>
  </div>
</header>
<main id="grid"></main>
<script>
const records = {data};
const grid = document.querySelector("#grid");
const statusFilter = document.querySelector("#statusFilter");
const searchInput = document.querySelector("#searchInput");
const summary = document.querySelector("#summary");
const disabledIds = new Set();

function render() {{
  const status = statusFilter.value;
  const search = searchInput.value.trim().toLowerCase();
  grid.innerHTML = "";
  const shown = records.filter((record) => {{
    const success = ["downloaded", "existing"].includes(record.status);
    const matchesStatus =
      status === "all" ||
      (status === "downloaded" && success) ||
      record.status === status;
    const haystack = [
      record.id,
      record.label,
      record.franchise,
      record.fandom_wiki,
      record.error
    ].join(" ").toLowerCase();
    return matchesStatus && (!search || haystack.includes(search));
  }});

  shown.forEach((record) => {{
    const card = document.createElement("article");
    card.className = record.status;
    const image = document.createElement("div");
    image.className = "image";
    if (record.review_image) {{
      const img = document.createElement("img");
      img.src = record.review_image;
      img.alt = record.label;
      image.appendChild(img);
    }} else {{
      image.innerHTML = '<div class="unavailable">No image<br>' +
        escapeHtml(record.error || record.status) + '</div>';
    }}

    const details = document.createElement("div");
    details.className = "details";
    details.innerHTML =
      "<h2>" + escapeHtml(record.label) + "</h2>" +
      "<p><strong>" + escapeHtml(record.franchise || "") + "</strong></p>" +
      "<p>" + escapeHtml(record.id) + "</p>" +
      "<p>Wiki: " + escapeHtml(record.fandom_wiki || "") + "</p>" +
      "<p>Page: " + escapeHtml(record.resolved_page || record.requested_page || "") + "</p>" +
      (record.source_page
        ? '<p><a target="_blank" rel="noreferrer" href="' +
          encodeURI(record.source_page) + '">Open source page</a></p>'
        : "") +
      (record.error ? "<p>" + escapeHtml(record.error) + "</p>" : "");

    const disableLabel = document.createElement("label");
    disableLabel.className = "disable";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = disabledIds.has(record.id);
    checkbox.addEventListener("change", () => {{
      if (checkbox.checked) disabledIds.add(record.id);
      else disabledIds.delete(record.id);
    }});
    disableLabel.append(checkbox, document.createTextNode("Disable this character"));
    details.appendChild(disableLabel);

    card.append(image, details);
    grid.appendChild(card);
  }});

  const successes = records.filter((record) =>
    ["downloaded", "existing"].includes(record.status)
  ).length;
  const failures = records.filter((record) => record.status === "failed").length;
  summary.textContent =
    shown.length + " shown · " + successes + " usable · " + failures + " failed";
}}

function escapeHtml(value) {{
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}}

document.querySelector("#downloadDisabled").addEventListener("click", () => {{
  const blob = new Blob(
    [[...disabledIds].sort().join("\\n") + "\\n"],
    {{ type: "text/plain" }}
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "disabled-character-ids.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}});

statusFilter.addEventListener("change", render);
searchInput.addEventListener("input", render);
render();
</script>
</body>
</html>""".format(data=data_json)


def apply_disable_list(
    manifest_path: Path,
    rows: List[Dict[str, str]],
    disabled_ids: Set[str],
) -> None:
    if not disabled_ids:
        return
    found: Set[str] = set()
    for row in rows:
        if row["id"] in disabled_ids:
            row["enabled"] = "false"
            found.add(row["id"])
    write_manifest(manifest_path, rows)
    missing = sorted(disabled_ids - found)
    if missing:
        print("Warning: disable-list ids not found: {}".format(", ".join(missing)))


def disable_rows_with_missing_assets(
    manifest_path: Path,
    rows: List[Dict[str, str]],
    asset_root: Path,
) -> Set[str]:
    disabled: Set[str] = set()

    for row in rows:
        if not parse_bool(row.get("enabled"), True):
            continue

        image_path = (
            asset_root
            / row["subcategory"]
            / "{}.webp".format(safe_filename(row["id"]))
        )

        if image_path.exists():
            continue

        row["enabled"] = "false"
        disabled.add(row["id"])

    if disabled:
        write_manifest(manifest_path, rows)

    return disabled


def parse_arguments() -> argparse.Namespace:
    script_path = Path(__file__).resolve()
    default_root = script_path.parents[2]

    parser = argparse.ArgumentParser(
        description="Download local character images from specific Fandom wikis."
    )
    parser.add_argument("--project-root", type=Path, default=default_root)
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--ids", help="Comma-separated character ids to process.")
    parser.add_argument("--id-file", type=Path, help="Text file containing ids to process.")
    parser.add_argument("--disable-list", type=Path, help="Disable ids selected in the review page.")
    parser.add_argument(
        "--disable-missing-assets",
        action="store_true",
        help=(
            "Set enabled=false for every character whose local WebP file "
            "is missing, then regenerate the character library without "
            "redownloading those files."
        ),
    )
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    parser.add_argument("--pause", type=float, default=0.15)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-patch", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_arguments()
    project_root = args.project_root.resolve()
    manifest_path = (args.manifest or project_root / "data" / "characters.csv").resolve()
    asset_root = project_root / "assets" / "images" / "clue-items" / "characters"
    tool_root = project_root / "tools" / "fandom-character-downloader"
    generator_path = project_root / "js" / "clue-item-generator.js"
    generated_js_path = project_root / "js" / "generated-character-items.js"

    rows = load_manifest(manifest_path)

    disabled_ids = read_id_file(args.disable_list)

    if disabled_ids:
        apply_disable_list(manifest_path, rows, disabled_ids)
        print("Updated enabled=false for {} character(s).".format(len(disabled_ids)))

    missing_asset_ids: Set[str] = set()
    if args.disable_missing_assets:
        missing_asset_ids = disable_rows_with_missing_assets(
            manifest_path,
            rows,
            asset_root,
        )
        print(
            "Disabled {} character(s) whose local image file was missing.".format(
                len(missing_asset_ids)
            )
        )

    sync_only = bool(disabled_ids or args.disable_missing_assets) and not (
        args.ids or args.id_file or args.limit is not None
    )

    selected_ids: Set[str] = set()
    if args.ids:
        selected_ids.update(
            value.strip() for value in args.ids.split(",") if value.strip()
        )
    selected_ids.update(read_id_file(args.id_file))

    process_rows = [
        row for row in rows
        if (not selected_ids or row["id"] in selected_ids)
    ]
    if args.limit is not None:
        process_rows = process_rows[: max(0, args.limit)]
    if sync_only:
        process_rows = []

    enabled_count = sum(parse_bool(row["enabled"], True) for row in rows)
    print("Manifest: {} characters ({} enabled).".format(len(rows), enabled_count))
    print("Selected for this run: {}.".format(len(process_rows)))

    if args.dry_run:
        unknown = sorted(selected_ids - {row["id"] for row in rows})
        if unknown:
            print("Unknown requested ids: {}".format(", ".join(unknown)))
            return 1
        print("Dry run successful; no network requests were made.")
        return 0

    tool_root.mkdir(parents=True, exist_ok=True)
    asset_root.mkdir(parents=True, exist_ok=True)

    records: List[Dict[str, object]] = []
    thread_state = threading.local()

    def run_row(row: Dict[str, str]) -> Dict[str, object]:
        if not hasattr(thread_state, "client"):
            thread_state.client = FandomClient(
                pause_seconds=args.pause
            )
        return process_row(
            row,
            thread_state.client,
            asset_root,
            args.force,
        )

    workers = max(1, min(6, int(args.workers)))
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(run_row, row): row
            for row in process_rows
        }
        total = len(futures)
        completed = 0
        for future in as_completed(futures):
            completed += 1
            row = futures[future]
            try:
                record = future.result()
            except Exception as error:
                record = {
                    "id": row["id"],
                    "label": row["label"],
                    "subcategory": row["subcategory"],
                    "franchise": row["franchise"],
                    "fandom_wiki": row["fandom_wiki"],
                    "requested_page": row["fandom_page"],
                    "status": "failed",
                    "error": str(error),
                }
            records.append(record)
            print(
                "[{}/{}] {}: {}".format(
                    completed,
                    total,
                    record.get("label"),
                    record.get("status"),
                )
            )

    # Merge records from previous full report when running a subset.
    report_json_path = tool_root / "character-download-report.json"
    if selected_ids or args.limit is not None or sync_only:
        existing_records: List[Dict[str, object]] = []
        if report_json_path.exists():
            try:
                existing_records = json.loads(report_json_path.read_text(encoding="utf-8"))
            except Exception:
                existing_records = []
        new_by_id = {str(record["id"]): record for record in records}
        merged = [
            record for record in existing_records
            if str(record.get("id")) not in new_by_id
        ]
        merged.extend(records)
        records = merged

    order = {row["id"]: index for index, row in enumerate(rows)}
    records.sort(key=lambda record: order.get(str(record.get("id")), 10 ** 9))

    rows_by_id = {row["id"]: row for row in rows}
    items = build_character_items(rows_by_id, records, project_root)

    report_csv_path = tool_root / "character-download-report.csv"
    write_reports(report_json_path, report_csv_path, records)

    review_path = tool_root / "character-review.html"
    review_path.write_text(
        review_html(records, project_root, review_path),
        encoding="utf-8",
    )

    write_generated_js(generated_js_path, items)

    if not args.no_patch:
        patch_generator(generator_path, items)

    usable = sum(
        record.get("status") in {"downloaded", "existing"}
        for record in records
    )
    failed = sum(record.get("status") == "failed" for record in records)

    print()
    print("Usable character images: {}".format(usable))
    print("Failed character images: {}".format(failed))
    print("Review page: {}".format(review_path))
    print("Report: {}".format(report_csv_path))
    print("Generated data: {}".format(generated_js_path))
    if not args.no_patch:
        print("Updated generator: {}".format(generator_path))
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
