#!/bin/bash

# Simple script to check active multi-agent locks in FlyDea project

LOCK_FILE="docs/planning/11-ACTIVE-LOCKS.md"

if [ ! -f "$LOCK_FILE" ]; then
    echo "Error: Lock file $LOCK_FILE not found."
    exit 1
fi

echo "===================================================="
echo "          FLYDEA ACTIVE MULTI-AGENT LOCKS          "
echo "===================================================="
echo ""

# Extract the "Locks ativos" section until the next header
# Then filter for lines containing pipes but not the table separator
sed -n '/## Locks ativos/,/##/p' "$LOCK_FILE" | grep "|" | grep -v "\-\-\-"

echo ""
echo "===================================================="
echo "Note: If a task is CLAIMED or IN_PROGRESS, do NOT"
echo "touch the same files or modules."
echo "===================================================="
