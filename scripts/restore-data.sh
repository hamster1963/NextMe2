#!/usr/bin/env sh
set -eu

ARCHIVE_PATH="${1:-}"
DATA_DIR="${2:-./data}"

if [ -z "$ARCHIVE_PATH" ]; then
  echo "Usage: ./scripts/restore-data.sh <backup-archive-path> [data-dir]" >&2
  exit 1
fi

if [ ! -f "$ARCHIVE_PATH" ]; then
  echo "Backup archive not found: $ARCHIVE_PATH" >&2
  exit 1
fi

mkdir -p "$DATA_DIR"
tar -xzf "$ARCHIVE_PATH" -C "$DATA_DIR"

echo "Restore completed: $ARCHIVE_PATH -> $DATA_DIR"
