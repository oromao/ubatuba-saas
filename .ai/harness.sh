#!/usr/bin/env bash
# FlyDea Harness — entry point at .ai/harness.sh
# Uso: ./harness.sh <comando>
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/runtime/harness.sh" "$@"
