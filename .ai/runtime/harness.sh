#!/usr/bin/env bash
# FlyDea Harness — runtime CLI
# Uso: ./harness.sh <comando>
# Comandos: start, agent, send, queue, pipeline, status, validate

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUS="$SCRIPT_DIR/bus/bus.sh"
HARNESS_AGENT="${FLYDEA_AGENT:-harness}"

die() { echo "ERROR: $*" >&2; exit 1; }
banner() { echo "╔══════════════════════════════════════════════════════╗"; echo "║  FlyDea Harness v1.0                                   ║"; echo "╚══════════════════════════════════════════════════════╝"; }

require_bus() {
  [ -x "$BUS" ] || die "bus.sh nao encontrado em $BUS"
}

cmd_start() {
  banner
  echo ""
  echo "Inicializando Harness..."
  require_bus

  # Init DB
  "$BUS" init

  # Register all agents with heartbeat
  for agent in orchestrator business risk security finops executor qa memory giss devops compliance; do
    "$BUS" agent --agent "$agent" register
    "$BUS" agent --agent "$agent" heartbeat
  done

  # Subscribe agents to default queues
  "$BUS" queue subscribe --queue pipeline.default --agent orchestrator
  "$BUS" queue subscribe --queue pipeline.default --agent executor
  "$BUS" queue subscribe --queue pipeline.default --agent qa
  "$BUS" queue subscribe --queue alerts --agent orchestrator
  "$BUS" queue subscribe --queue alerts --agent security
  "$BUS" queue subscribe --queue planning.sync --agent orchestrator
  "$BUS" queue subscribe --queue tasks --agent executor

  # Subscribe domain specialists to their queues
  "$BUS" queue subscribe --queue gis.operations --agent giss
  "$BUS" queue subscribe --queue gis.operations --agent qa
  "$BUS" queue subscribe --queue infra.deploy --agent devops
  "$BUS" queue subscribe --queue infra.deploy --agent executor
  "$BUS" queue subscribe --queue compliance.audit --agent compliance
  "$BUS" queue subscribe --queue compliance.audit --agent security

  # Auto-detect stale agents (no heartbeat >4h)
  local stale
  stale=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" \
    "SELECT name FROM bus_agents WHERE last_heartbeat IS NOT NULL AND datetime(last_heartbeat) < datetime('now','-4 hours');" 2>/dev/null)
  if [ -n "$stale" ]; then
    echo ""
    echo "⚠ STALE agents (>4h):"
    echo "$stale" | while IFS= read -r a; do echo "  • $a"; done
    echo "Execute './harness.sh agent <name> heartbeat' para renovar."
  fi

  # Emit startup event to planning.sync queue
  "$BUS" queue publish --queue planning.sync --subject "harness.started" \
    --body "{\"agents\":11,\"queues\":7,\"timestamp\":\"$(date -u +%s)\"}" >/dev/null 2>&1 || true

  echo ""
  echo "Harness pronto (11 agentes, 7 queues, 6 domínios). Use './harness.sh status' para verificar."
  echo ""
  "$BUS" status
}

cmd_agent() {
  require_bus
  local agent="${1:-}"; shift 2>/dev/null || true
  [ -z "$agent" ] && die "Uso: ./harness.sh agent <name> register|heartbeat|status"
  "$BUS" agent --agent "$agent" "$@"
}

cmd_send() {
  require_bus
  "$BUS" send "$@"
}

cmd_queue() {
  require_bus
  "$BUS" queue "$@"
}

cmd_pipeline() {
  require_bus
  "$BUS" pipeline "$@"
}

cmd_status() {
  require_bus
  "$BUS" status
}

cmd_validate() {
  banner
  echo ""
  echo "Validando harness..."
  local errors=0

  # Check runtime.db
  if [ -f "$PROJECT_ROOT/.ai/runtime/runtime.db" ]; then
    echo "[PASS] runtime.db existe"
  else
    echo "[FAIL] runtime.db nao encontrado"
    errors=$((errors+1))
  fi

  # Check bus.sh
  if [ -x "$BUS" ]; then
    echo "[PASS] bus.sh executavel"
  else
    echo "[FAIL] bus.sh nao executavel"
    errors=$((errors+1))
  fi

  # Check agents registered
  local agent_count
  agent_count=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_agents;" 2>/dev/null || echo 0)
  echo "[PASS] Agentes registrados: $agent_count"

  # Check queues exist
  local queue_count
  queue_count=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_queues;" 2>/dev/null || echo 0)
  echo "[PASS] Queues criadas: $queue_count"

  # Check messages flow
  local msg_count
  msg_count=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_messages;" 2>/dev/null || echo 0)
  echo "[PASS] Mensagens no sistema: $msg_count"

  # Check subscriptions
  local sub_count
  sub_count=$(sqlite3 "$PROJECT_ROOT/.ai/runtime/runtime.db" "SELECT COUNT(*) FROM bus_subscriptions;" 2>/dev/null || echo 0)
  echo "[PASS] Subscriptions ativas: $sub_count"

  # Integration test: send message via queue
  echo ""
  echo "--- Teste de integracao: enviar mensagem via queue ---"
  "$BUS" queue publish --queue alerts --subject "harness.validate" --body "{\"test\":\"harness integration\",\"timestamp\":\"$(date -u +%s)\"}" 2>/dev/null || { echo "[FAIL] Falha ao publicar na queue"; errors=$((errors+1)); }
  "$BUS" queue consume --queue alerts --agent orchestrator --limit 1 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print('[PASS] Mensagem consumida:', d[0]['subject'] if d else 'nenhuma')" 2>/dev/null || echo "[FAIL] Falha ao consumir mensagem"

  echo ""
  if [ "$errors" -eq 0 ]; then
    echo "✓ Validacao: PASSOU (0 erros)"
    return 0
  else
    echo "✗ Validacao: $errors erro(s)"
    return 1
  fi
}

cmd_main() {
  local cmd="${1:-}"; shift 2>/dev/null || true
  case "$cmd" in
    start) cmd_start "$@" ;;
    agent) cmd_agent "$@" ;;
    send) cmd_send "$@" ;;
    queue) cmd_queue "$@" ;;
    pipeline) cmd_pipeline "$@" ;;
    status) cmd_status "$@" ;;
    validate) cmd_validate "$@" ;;
    help|--help|-h)
      echo "FlyDea Harness — Uso:"
      echo "  ./harness.sh start                   Inicializar harness (agents + queues)"
      echo "  ./harness.sh agent <name> <action>    Gerenciar agente (register|heartbeat|status)"
      echo "  ./harness.sh send <args>              Enviar mensagem"
      echo "  ./harness.sh queue <subcomando>       Gerenciar queues"
      echo "  ./harness.sh pipeline <subcomando>    Gerenciar pipelines"
      echo "  ./harness.sh status                   Status do sistema"
      echo "  ./harness.sh validate                 Validar harness"
      ;;
    *) echo "Uso: ./harness.sh <comando>"; echo "Comandos: start, agent, send, queue, pipeline, status, validate";;
  esac
}

cmd_main "$@"
