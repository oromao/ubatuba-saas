#!/bin/bash

###############################################################################
# MongoDB Restore Script for FlyDea
#
# Usage:
#   ./restore-mongodb.sh <backup-file> [mongo-uri] [drop-existing]
#
# Examples:
#   ./restore-mongodb.sh backups/backup-20260331-143000.tar.gz mongodb://localhost:27017/flydea
#   ./restore-mongodb.sh backup.tar.gz mongodb://localhost:27017/flydea true
#
# Options:
#   backup-file      - Path to backup archive (.tar.gz)
#   mongo-uri        - MongoDB connection string (default: mongodb://localhost:27017/flydea)
#   drop-existing    - Drop existing collections before restore (default: false)
#
# Features:
#   - Extract backup archive
#   - Restore database from mongodump output
#   - Optional drop existing data
#   - Validation of restore
#   - Detailed logging
#
# Requirements:
#   - mongorestore (MongoDB tools)
#   - tar
#   - bash 4+
#
###############################################################################

set -euo pipefail

# Configuration
BACKUP_FILE="${1:?Backup file required (usage: $0 <backup-file> [mongo-uri] [drop-existing])}"
MONGO_URI="${2:-mongodb://localhost:27017/flydea}"
DROP_EXISTING="${3:-false}"
LOG_FILE="restore-$(date +%Y%m%d-%H%M%S).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

log_info "Starting MongoDB restore from backup: ${BACKUP_FILE}"
log_info "MongoDB URI: ${MONGO_URI}"
log_info "Drop existing data: ${DROP_EXISTING}"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
  log_error "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# Check if backup file is readable
if [ ! -r "${BACKUP_FILE}" ]; then
  log_error "Backup file not readable: ${BACKUP_FILE}"
  exit 1
fi

# Check if mongorestore is installed
if ! command -v mongorestore &>/dev/null; then
  log_error "mongorestore not found. Please install MongoDB tools."
  exit 1
fi

# Check if tar is installed
if ! command -v tar &>/dev/null; then
  log_error "tar not found"
  exit 1
fi

# Create temp directory for extraction
TEMP_DIR=$(mktemp -d)
trap "rm -rf ${TEMP_DIR}" EXIT

log_info "Extracting backup to temporary directory: ${TEMP_DIR}"
if ! tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}" 2>&1 | tee -a "${LOG_FILE}"; then
  log_error "Failed to extract backup archive"
  exit 1
fi

# Find the dump directory
DUMP_DIR=$(find "${TEMP_DIR}" -maxdepth 2 -type d -name "dump" | head -1)
if [ -z "${DUMP_DIR}" ]; then
  # Try to find any directory with .bson files
  DUMP_DIR=$(find "${TEMP_DIR}" -maxdepth 2 -type d | head -1)
  ACTUAL_DIR="${TEMP_DIR}/$(ls -1 "${TEMP_DIR}" | head -1)"
  if [ -d "${ACTUAL_DIR}" ]; then
    DUMP_DIR="${ACTUAL_DIR}"
  fi
fi

if [ ! -d "${DUMP_DIR}" ]; then
  log_error "Could not find dump directory in archive"
  exit 1
fi

log_info "Dump directory: ${DUMP_DIR}"
log_info "Checking MongoDB connection..."

# Verify MongoDB is running
if ! mongosh "${MONGO_URI}" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
  log_error "MongoDB is not accessible at ${MONGO_URI}"
  exit 1
fi

print_status 0 "MongoDB is running and accessible"

###############################################################################
# Pre-Restore Checks
###############################################################################

log_info "Collecting pre-restore statistics..."

# Get database name from URI
DB_NAME=$(echo "${MONGO_URI}" | grep -oP '(?<=/)[^/?]+(?:[/?]|$)' | head -1)
if [ -z "${DB_NAME}" ]; then
  DB_NAME="flydea"
fi

log_info "Target database: ${DB_NAME}"

# Show current collections
log_info "Current collections:"
mongosh "${MONGO_URI}" --eval "db.getCollectionNames().forEach(c => print('  ' + c))" 2>/dev/null || true

###############################################################################
# Restore
###############################################################################

log_info "Starting mongorestore..."

RESTORE_ARGS=(
  "--uri=${MONGO_URI}"
  "--archive=${BACKUP_FILE}"
)

# Add drop flag if requested
if [ "${DROP_EXISTING}" = "true" ]; then
  RESTORE_ARGS+=("--drop")
  log_warn "Will drop existing collections before restore!"
fi

if mongorestore "${RESTORE_ARGS[@]}" 2>&1 | tee -a "${LOG_FILE}"; then
  print_status 0 "mongorestore completed"
else
  log_error "mongorestore failed"
  exit 1
fi

###############################################################################
# Post-Restore Validation
###############################################################################

log_info "Validating restore..."

# Wait for restore to fully complete
sleep 2

# Count collections
COLLECTION_COUNT=$(mongosh "${MONGO_URI}" --eval "db.getCollectionNames().length" 2>/dev/null || echo "0")
log_info "Collections restored: ${COLLECTION_COUNT}"

# Get database stats
log_info "Database statistics:"
mongosh "${MONGO_URI}" --eval "JSON.stringify(db.stats(), null, 2)" 2>/dev/null | tee -a "${LOG_FILE}" || true

# Verify critical collections exist
CRITICAL_COLLECTIONS=("tenants" "users" "memberships" "projects")
MISSING_COLLECTIONS=()

for collection in "${CRITICAL_COLLECTIONS[@]}"; do
  COUNT=$(mongosh "${MONGO_URI}" --eval "db.${collection}.countDocuments()" 2>/dev/null || echo "0")
  if [ "$COUNT" -gt 0 ]; then
    log_info "✓ Collection '${collection}' restored (${COUNT} documents)"
  else
    log_warn "✗ Collection '${collection}' is empty or missing"
    MISSING_COLLECTIONS+=("${collection}")
  fi
done

###############################################################################
# Summary
###############################################################################

log_info "✓ Restore completed!"
log_info "  Backup file: ${BACKUP_FILE}"
log_info "  Target database: ${DB_NAME}"
log_info "  Restore log: ${LOG_FILE}"

if [ ${#MISSING_COLLECTIONS[@]} -gt 0 ]; then
  log_warn "Warning: Some critical collections are empty: ${MISSING_COLLECTIONS[*]}"
  print_status 1 "Restore completed with warnings"
  exit 1
else
  print_status 0 "MongoDB restore validated successfully"
  exit 0
fi
