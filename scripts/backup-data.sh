#!/usr/bin/env sh
set -eu

DATA_DIR="${1:-./data}"
BACKUP_DIR="${2:-./backups}"

if [ ! -d "$DATA_DIR" ]; then
  echo "Data directory not found: $DATA_DIR" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date '+%Y%m%d-%H%M%S')"
ARCHIVE_PATH="$BACKUP_DIR/nextme2-data-$TIMESTAMP.tar.gz"

tar -czf "$ARCHIVE_PATH" -C "$DATA_DIR" .

echo "Backup created: $ARCHIVE_PATH"
