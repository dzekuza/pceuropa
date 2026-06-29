#!/usr/bin/env python3
"""
prepare_tenant_import.py
Reads swisstransfer folder → produces tenants_import.csv + import_images/ folder
ready to feed into the existing TenantImportDialog.

Usage:
  python3 prepare_tenant_import.py

Outputs (next to this script):
  tenants_import.csv    — drop into the CSV zone of the import dialog
  import_images/        — drop all files from here into the Logo and Gallery zones

Notes on PDFs:
  Several tenants supplied logos as PDF files. Those are listed in the summary
  and must be converted manually (or replace them with PNG/JPG before running).
"""

import csv
import os
import re
import shutil

from docx import Document

# ── paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
# swisstransfer folder sits next to the outputs folder (one level up)
_MOUNT_DIR   = os.path.dirname(SCRIPT_DIR)
SWISS_DIR    = os.path.join(_MOUNT_DIR, "swisstransfer_9f9a00af-75d7-455c-b866-752563f1d332")
PHOTOS_DIR   = os.path.join(SWISS_DIR, "FOTO nuomininkų")
DOCX_PATH    = os.path.join(SWISS_DIR, "Aprašymai.docx")
OUT_CSV      = os.path.join(SCRIPT_DIR, "tenants_import.csv")
OUT_IMG_DIR  = os.path.join(SCRIPT_DIR, "import_images")

# ── known tenants (folder name → canonical store name) ────────────────────────
# Keys are exact folder names in FOTO nuomininkų/
FOLDER_TO_NAME: dict[str, str] = {
    "ALI ŠOKOLADINĖ":    "ALI ŠOKOLADINĖ",
    "APRANGA":           "APRANGA",
    "ARCHIE'S BURGER":   "ARCHIE'S BURGER",
    "ASIA VET":          "ASIA VET",
    "BENU":              "BENU",
    "BOTTLERY":          "BOTTLERY",
    "CAFFEINE":          "CAFFEINE",
    "CHAČAPURI":         "CHAČAPURI",
    "CLEAN GREEN":       "CLEAN GREEN",
    "DANGER PARK":       "DANGER PARK",
    "DOWNTOWN PIANO LAB": "DOWNTOWN PIANO LAB",
    "FORTAS":            "FORTAS",
    "GERA DOVANA":       "GERA DOVANA",
    "GYM+":              "GYM+",
    "HURACAN":           "HURACAN",
    "LEMON GYM":         "LEMON GYM",
    "MIYAKO":            "MIYAKO",
    "OPTOMETRIJOS CENTRAS": "OPTOMETRIJOS CENTRAS",
}

# ── helpers ───────────────────────────────────────────────────────────────────

def to_file_key(name: str) -> str:
    """Mirrors lib/utils.ts toTenantFileKey."""
    s = re.sub(r'[^a-z0-9]+', '_', name.lower())
    return s.strip('_')


def is_image(fname: str) -> bool:
    return bool(re.search(r'\.(jpe?g|png|webp|gif|avif|svg)$', fname, re.I))


def is_pdf(fname: str) -> bool:
    return fname.lower().endswith('.pdf')


# ── parse docx ────────────────────────────────────────────────────────────────

# Section headers (bold paragraphs) that are NOT tenant names
SECTION_HEADERS = {
    "KAVINĖS/RESTORANAI", "DIALOGAI", "DRABUŽIAI", "AKSESUARAI",
    "MAISTO IR GĖRIMŲ PARDUOTUVĖS?", "VAISTINĖS OPTIKA",
    "PASLAUGOS", "LAISVALAIKIS IR PRAMOGOS", "SPORTAS IR SVEIKATINGUMAS",
}

# Docx uses abbreviated headings for some tenants — map to canonical name
NAME_ALIASES: dict[str, str] = {
    "DOWNTOWN LAB": "DOWNTOWN PIANO LAB",
}

ALL_STORE_NAMES = set(FOLDER_TO_NAME.values())


def clean(text: str) -> str:
    return text.replace('\xa0', ' ').replace('’', "'").strip()


def parse_docx(path: str) -> dict[str, dict]:
    """Returns {store_name: {description, category, hours, phone, website}}."""
    doc = Document(path)
    paragraphs = [clean(p.text) for p in doc.paragraphs]

    results: dict[str, dict] = {}
    current_category = ""
    current_name = ""
    desc_lines: list[str] = []
    in_meta = False  # True once we hit DARBO LAIKAS

    def flush():
        nonlocal current_name, desc_lines, in_meta
        if current_name:
            description = " ".join(l for l in desc_lines if l).strip()
            results[current_name] = {
                "description": description,
                "category": current_category,
            }
        current_name = ""
        desc_lines = []
        in_meta = False

    for line in paragraphs:
        if not line:
            continue

        upper = line.upper().strip()

        # Section header?
        if upper in {h.upper() for h in SECTION_HEADERS}:
            flush()
            current_category = line.strip()
            continue

        # Tenant name? (also check aliases)
        candidate = NAME_ALIASES.get(line.strip(), line.strip())
        if candidate in ALL_STORE_NAMES:
            flush()
            current_name = candidate
            in_meta = False
            continue

        if not current_name:
            continue

        # Metadata lines — stop accumulating description
        if re.match(r'^(DARBO LAIKAS|TEL\. NR\.|INTERNETINIS PSL\.)', line, re.I):
            in_meta = True

        if not in_meta:
            desc_lines.append(line)

    flush()
    return results


# ── rename / copy images ──────────────────────────────────────────────────────

def prepare_images(docx_data: dict[str, dict]) -> dict[str, dict]:
    """
    Walks FOTO nuomininkų/ subfolders.
    For each tenant, classifies files as logo or gallery and copies them to
    import_images/ with the correct naming convention.
    Returns {store_name: {logo_file, gallery_files, pdf_logos, skipped}}.
    """
    os.makedirs(OUT_IMG_DIR, exist_ok=True)

    summary: dict[str, dict] = {}

    for folder_name, store_name in FOLDER_TO_NAME.items():
        folder_path = os.path.join(PHOTOS_DIR, folder_name)
        if not os.path.isdir(folder_path):
            print(f"  [WARN] folder not found: {folder_name}")
            continue

        key = to_file_key(store_name)
        files = sorted(os.listdir(folder_path))

        logo_file = None
        gallery_files: list[str] = []
        pdf_logos: list[str] = []
        skipped: list[str] = []

        for fname in files:
            flower = fname.lower()
            src = os.path.join(folder_path, fname)

            # Detect logo vs gallery heuristically by original filename
            is_logo_candidate = bool(re.search(r'logo', flower, re.I))
            # BENU has logo1/logo2 — treat both as gallery since no clear single logo
            is_gallery_candidate = bool(re.search(r'gallery\d*', flower, re.I))

            if is_pdf(fname):
                pdf_logos.append(fname)
                skipped.append(fname)
                continue

            if not is_image(fname):
                skipped.append(fname)
                continue

            ext = fname.rsplit('.', 1)[-1].lower()

            if is_logo_candidate and not logo_file:
                dest_name = f"{key}_logo.{ext}"
                shutil.copy2(src, os.path.join(OUT_IMG_DIR, dest_name))
                logo_file = dest_name
            else:
                # Count up gallery images
                n = len(gallery_files) + 1
                dest_name = f"{key}_gallery{n}.{ext}"
                shutil.copy2(src, os.path.join(OUT_IMG_DIR, dest_name))
                gallery_files.append(dest_name)

        summary[store_name] = {
            "logo_file": logo_file,
            "gallery_files": gallery_files,
            "pdf_logos": pdf_logos,
            "skipped": skipped,
        }

    return summary


# ── write CSV ─────────────────────────────────────────────────────────────────

def write_csv(docx_data: dict[str, dict], img_summary: dict[str, dict]):
    fieldnames = [
        "store_name", "category", "description",
    ]

    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for folder_name, store_name in FOLDER_TO_NAME.items():
            info = docx_data.get(store_name, {})
            writer.writerow({
                "store_name":  store_name,
                "category":    info.get("category", ""),
                "description": info.get("description", ""),
            })

    print(f"\n✓ CSV written: {OUT_CSV}")


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    print("Parsing Aprašymai.docx …")
    docx_data = parse_docx(DOCX_PATH)
    print(f"  {len(docx_data)} tenants found in docx")

    print("\nProcessing images …")
    img_summary = prepare_images(docx_data)

    write_csv(docx_data, img_summary)

    print(f"\n✓ Images written to: {OUT_IMG_DIR}/")

    # ── summary ──
    print("\n" + "─" * 60)
    print("IMPORT SUMMARY")
    print("─" * 60)

    pdf_issues: list[str] = []

    for folder_name, store_name in FOLDER_TO_NAME.items():
        key = to_file_key(store_name)
        info = img_summary.get(store_name, {})
        logo    = info.get("logo_file") or "—"
        gallery = len(info.get("gallery_files", []))
        pdfs    = info.get("pdf_logos", [])

        status = "✓"
        note = ""
        if pdfs:
            status = "⚠"
            note = f"  PDF logo(s): {', '.join(pdfs)} — convert to JPG/PNG manually"
            pdf_issues.append(f"  {store_name}: {', '.join(pdfs)}")

        print(f"{status} {store_name:<30}  key={key:<25}  logo={logo:<35}  gallery={gallery}  {note}")

    if pdf_issues:
        print("\n⚠  PDF LOGOS — need manual conversion:")
        for issue in pdf_issues:
            print(issue)

    print("\nNEXT STEPS:")
    print("  1. (Optional) Replace PDF logos with JPG/PNG, re-run script.")
    print(f"  2. Open the admin import dialog.")
    print(f"  3. Drop  tenants_import.csv  into the CSV zone.")
    print(f"  4. Drop ALL files from  import_images/  into both Logo and Gallery zones.")
    print("  5. Click Import.")


if __name__ == "__main__":
    main()
