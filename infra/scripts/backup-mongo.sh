#!/usr/bin/env bash
# FlyDea MongoDB Backup Script
# Uso: ./backup-mongo.sh [output-dir]
# Default output dir: ./backups/mongo/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Load .env if available
[ -f "$PROJECT_ROOT/.env" ] && set -a && source "$PROJECT_ROOT/.env" && set +a

BACKUP_DIR="${1:-$PROJECT_ROOT/backups/mongo}"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
BACKUP_NAME="flydea-mongo-$TIMESTAMP"
MONGO_URI="${MONGO_URL:-mongodb://localhost:27017/flydea}"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[backup] Starting MongoDB backup..."
echo "[backup] URI: $MONGO_URI"
echo "[backup] Dest: $BACKUP_DIR/$BACKUP_NAME"

mongodump \
  --uri="$MONGO_URI" \
  --out="$BACKUP_DIR/$BACKUP_NAME" \
  --gzip \
  --quiet

echo "[backup] Dump complete. Compressing..."

tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
  -C "$BACKUP_DIR" "$BACKUP_NAME" \
  && rm -rf "$BACKUP_DIR/$BACKUP_NAME"

echo "[backup] Archive: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "[backup] Size: $(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)"

# Cleanup old backups
find "$BACKUP_DIR" -name "flydea-mongo-*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "[backup] Retention: removed backups older than $RETENTION_DAYS days"

echo "[backup] Done."
