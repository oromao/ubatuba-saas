#!/bin/bash

###############################################################################
# MongoDB Backup Script for FlyDea
#
# Usage:
#   ./backup-mongodb.sh [backup-dir] [mongo-uri] [retention-days]
#
# Examples:
#   ./backup-mongodb.sh /backups mongodb://localhost:27017/flydea 30
#   ./backup-mongodb.sh ./backups-local mongodb://mongo:27017/flydea 7
#
# Features:
#   - Full database backup using mongodump
#   - Timestamped backup directory
#   - Compression (gzip) for storage efficiency
#   - Automatic retention policy (delete old backups)
#   - Logging to file
#   - Error handling & exit codes
#
# Requirements:
#   - mongodump (MongoDB tools)
#   - gzip
#   - bash 4+
#
# Cron example (daily at 2 AM):
#   0 2 * * * /path/to/backup-mongodb.sh /backups mongodb://localhost:27017/flydea 30
#
###############################################################################

set -euo pipefail

# Configuration
BACKUP_DIR="${1:-.backups}"
MONGO_URI="${2:-mongodb://localhost:27017/flydea}"
RETENTION_DAYS="${3:-30}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

###############################################################################
# Functions
###############################################################################

log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }

print_status() {
  local status=$1
  local message=$2

  if [ $status -eq 0 ]; then
    echo -e "${GREEN}✓${NC} ${message}"
  else
    echo -e "${RED}✗${NC} ${message}"
  fi
}

###############################################################################
# Validation
###############################################################################

log_info "Starting MongoDB backup..."
log_info "Backup directory: ${BACKUP_DIR}"
log_info "MongoDB URI: ${MONGO_URI}"
log_info "Retention policy: ${RETENTION_DAYS} days"

# Check if mongodump is installed
if ! command -v mongodump &>/dev/null; then
  log_error "mongodump not found. Please install MongoDB tools."
  echo "Install: brew install mongodump (macOS) or apt-get install mongodb-org-tools (Linux)"
  exit 1
fi

# Check if gzip is installed
if ! command -v gzip &>/dev/null; then
  log_error "gzip not found. Please install gzip."
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"
if [ ! -d "${BACKUP_DIR}" ]; then
  log_error "Failed to create backup directory: ${BACKUP_DIR}"
  exit 1
fi

# Check if MongoDB is reachable
log_info "Checking MongoDB connection..."
if ! mongosh "${MONGO_URI}" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
  log_warn "MongoDB connection check failed, but continuing..."
fi

###############################################################################
# Backup
###############################################################################

log_info "Creating backup directory: ${BACKUP_PATH}"
mkdir -p "${BACKUP_PATH}"

log_info "Running mongodump..."
if mongodump --uri="${MONGO_URI}" --out="${BACKUP_PATH}" 2>&1 | tee -a "${LOG_FILE}"; then
  print_status 0 "mongodump completed"
else
  log_error "mongodump failed"
  rm -rf "${BACKUP_PATH}"
  exit 1
fi

###############################################################################
# Compression
###############################################################################

log_info "Compressing backup..."
COMPRESSED_FILE="${BACKUP_PATH}.tar.gz"

if tar -czf "${COMPRESSED_FILE}" -C "${BACKUP_DIR}" "${BACKUP_NAME}" 2>&1 | tee -a "${LOG_FILE}"; then
  print_status 0 "Compression completed"

  # Remove uncompressed directory
  rm -rf "${BACKUP_PATH}"

  # Get compressed file size
  COMPRESSED_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)
  log_info "Backup compressed to: ${COMPRESSED_FILE} (${COMPRESSED_SIZE})"
else
  log_error "Compression failed"
  rm -rf "${BACKUP_PATH}"
  exit 1
fi

###############################################################################
# Retention Policy
###############################################################################

log_info "Applying retention policy (keeping last ${RETENTION_DAYS} days)..."

# Find and delete old backups
CURRENT_TIME=$(date +%s)
RETENTION_SECONDS=$((RETENTION_DAYS * 24 * 60 * 60))

find "${BACKUP_DIR}" -maxdepth 1 -name "backup-*.tar.gz" -type f | while read -r backup_file; do
  FILE_TIME=$(stat -c %Y "${backup_file}" 2>/dev/null || stat -f %m "${backup_file}" 2>/dev/null)
  AGE_SECONDS=$((CURRENT_TIME - FILE_TIME))

  if [ $AGE_SECONDS -gt $RETENTION_SECONDS ]; then
    SIZE=$(du -h "${backup_file}" | cut -f1)
    log_info "Deleting old backup (age: $((AGE_SECONDS / 86400)) days): $(basename "${backup_file}") (${SIZE})"
    rm -f "${backup_file}"
  fi
done

###############################################################################
# Cleanup & Summary
###############################################################################

log_info "Listing recent backups:"
ls -lh "${BACKUP_DIR}"/backup-*.tar.gz 2>/dev/null | tail -5 | while read -r line; do
  log_info "  ${line}"
done

BACKUP_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)
TOTAL_BACKUP_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)

log_info "✓ Backup completed successfully!"
log_info "  Backup file: ${COMPRESSED_FILE}"
log_info "  Backup size: ${BACKUP_SIZE}"
log_info "  Total backups dir size: ${TOTAL_BACKUP_SIZE}"

print_status 0 "MongoDB backup completed successfully"

exit 0
