#!/bin/bash
# One-time Phase 6 cutover script: copies the already-downloaded Storage
# objects from the pre-migration backup into the new local-disk storage
# location, PRESERVING each object's original bucket/relative-path so URLs
# already stored in tenants/articles/faq_items/etc. DB rows keep resolving
# once those rows are rewritten to point at /api/storage/<bucket>/<key>.
#
# Do NOT run this against production data casually — it is meant to run
# once during Phase 6 cutover, after the local storage backend is deployed
# and before DB rows are rewritten to new URLs. See lib/storage/MIGRATION_NOTES.md.
#
# Usage:
#   STORAGE_ROOT=/data/uploads bash scripts/migrate-storage-to-local.sh
#
# Source layout expected (from the pre-migration backup):
#   ~/backups/pceuropa/pre-migration-2026-08-02/storage/marketing-assets/**
#   ~/backups/pceuropa/pre-migration-2026-08-02/storage/tenant-assets/**
#
# Destination layout produced (matches lib/storage/local-storage.ts):
#   $STORAGE_ROOT/marketing-assets/**
#   $STORAGE_ROOT/tenant-assets/**

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/pceuropa/pre-migration-2026-08-02/storage}"
STORAGE_ROOT="${STORAGE_ROOT:?Set STORAGE_ROOT env var before running (e.g. /data/uploads)}"
BUCKETS=("marketing-assets" "tenant-assets")

for bucket in "${BUCKETS[@]}"; do
  src="${BACKUP_DIR}/${bucket}"
  dest="${STORAGE_ROOT}/${bucket}"

  if [[ ! -d "$src" ]]; then
    echo "Skipping ${bucket}: no backup directory at ${src}"
    continue
  fi

  mkdir -p "$dest"
  # -a preserves relative paths/timestamps; trailing slash on src copies
  # contents (not the directory itself) into dest.
  cp -a "${src}/." "${dest}/"

  src_count=$(find "$src" -type f | wc -l | tr -d ' ')
  dest_count=$(find "$dest" -type f | wc -l | tr -d ' ')
  echo "${bucket}: ${src_count} files in backup, ${dest_count} files now in ${dest}"
  if [[ "$src_count" != "$dest_count" ]]; then
    echo "WARNING: file count mismatch for ${bucket} — investigate before proceeding" >&2
  fi
done

echo ""
echo "Done. Next steps (Phase 6, not performed by this script):"
echo "  1. Rewrite DB rows' stored URLs from the old Supabase Storage URLs to"
echo "     /api/storage/<bucket>/<key> (same bucket/key, new same-origin prefix)."
echo "  2. Verify a sample of images render via the new /api/storage route."
echo "  3. Deploy next.config.ts's CSP/remotePatterns changes alongside this cutover."
