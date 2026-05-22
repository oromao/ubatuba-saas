#!/usr/bin/env bash
# FlyDea Planning Bridge — conecta o harness (.ai/) ao sistema de planejamento (docs/planning/)
# Uso: ./planning-bridge.sh <comando>
# Comandos: sync, status, report

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUS="$SCRIPT_DIR/bus/bus.sh"

die() { echo "ERROR: $*" >&2; exit 1; }

require_db() { "$BUS" status >/dev/null 2>&1 || die "Bus nao inicializado. Execute 'harness.sh start' primeiro."; }

# ── sync: bridges pipeline events to planning files ─────────────────────
cmd_sync() {
  require_db

  # 1. Pull recent pipeline completions from bus events
  echo "=== Syncing harness → planning ==="

  local completed_runs
  completed_runs=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" \
    "SELECT correlation_id, pipeline_id, completed_at, context_json FROM bus_pipeline_runs WHERE status='completed' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 5;" 2>/dev/null)

  if [ -n "$completed_runs" ]; then
    echo "Recent pipeline completions:"
    echo "$completed_runs" | while IFS='|' read -r corr pipe completed_at ctx; do
      echo "  • $pipe ($corr) — completed at $completed_at"
    done
  else
    echo "No recent pipeline completions."
  fi

  # 2. Check agent heartbeats vs stale threshold (4h)
  local stale_agents
  stale_agents=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" \
    "SELECT name FROM bus_agents WHERE last_heartbeat IS NOT NULL AND datetime(last_heartbeat) < datetime('now','-4 hours');" 2>/dev/null)

  if [ -n "$stale_agents" ]; then
    echo "STALE agents (>4h without heartbeat):"
    echo "$stale_agents" | while IFS= read -r agent; do echo "  • $agent"; done
  fi

  # 3. Emit sync event to planning.sync queue
  "$BUS" queue publish --queue planning.sync --subject "planning.synced" \
    --body "{\"source\":\"planning-bridge\",\"timestamp\":\"$(date -u +%s)\"}" >/dev/null 2>&1 || true

  echo "Sync complete."
}

# ── status: show harness ↔ planning alignment ──────────────────────────
cmd_status() {
  require_db

  echo "=== Harness ↔ Planning Alignment ==="

  # Bus status
  local agents queues pending
  agents=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_agents;")
  queues=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_queues;")
  pending=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_messages WHERE status='pending';")

  echo "Bus: $agents agents, $queues queues, $pending pending messages"

  # File alignment check
  local missing=0
  for f in "docs/planning/02-BACKLOG.md" "docs/planning/03-EXECUTION-PLAN.md" \
           "docs/planning/04-PROGRESS-SUMMARY.md" "docs/planning/11-ACTIVE-LOCKS.md" \
           "docs/planning/01-MATURITY-MATRIX.md" "docs/planning/05-CLEANUP-INVENTORY.md"; do
    if [ -f "$PROJECT_ROOT/$f" ]; then
      echo "  [OK] $f"
    else
      echo "  [MISS] $f"
      missing=$((missing+1))
    fi
  done

  # Check if .ai/backlog.index.md references docs/planning/02-BACKLOG.md
  if grep -q "docs/planning/02-BACKLOG" "$PROJECT_ROOT/.ai/backlog.index.md" 2>/dev/null; then
    echo "  [OK] .ai/backlog.index.md → docs/planning/02-BACKLOG.md"
  else
    echo "  [WARN] .ai/backlog.index.md nao referencia docs/planning/"
  fi

  [ "$missing" -eq 0 ] && echo "Alignment: OK" || echo "Alignment: $missing missing files"
}

# ── report: generate summary for progress log ──────────────────────────
cmd_report() {
  require_db

  local now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  cat <<REPORT
# Harness Report — $now

## System
- Agents: $(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_agents;")
- Queues: $(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_queues;")
- Pipelines: $(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_pipelines;")
- Messages total: $(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_messages;")
- Messages pending: $(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_messages WHERE status='pending';")

## Active Agents
$(sqlite3 -column "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT name, status, COALESCE(last_heartbeat,'-') AS heartbeat FROM bus_agents ORDER BY name;" 2>/dev/null)

## Recent Pipeline Runs
$(sqlite3 -column "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT pipeline_id, current_step||'/'||total_steps AS step, status, COALESCE(completed_at,'-') AS completed FROM bus_pipeline_runs ORDER BY started_at DESC LIMIT 5;" 2>/dev/null)

## Queues
$(sqlite3 -column "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT q.name, q.type, COUNT(s.agent_id) AS subs FROM bus_queues q LEFT JOIN bus_subscriptions s ON s.topic=q.name GROUP BY q.name ORDER BY q.name;" 2>/dev/null)
REPORT
}

# ── Main ────────────────────────────────────────────────────────────────
cmd_main() {
  local cmd="${1:-}"; shift 2>/dev/null || true
  case "$cmd" in
    sync) cmd_sync "$@" ;;
    status) cmd_status "$@" ;;
    report) cmd_report "$@" ;;
    help|--help|-h) echo "Uso: ./planning-bridge.sh sync|status|report" ;;
    *) echo "Uso: ./planning-bridge.sh <sync|status|report>";;
  esac
}

cmd_main "$@"
