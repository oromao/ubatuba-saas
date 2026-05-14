#!/usr/bin/env bash
# FlyDea Message Bus — portado do AbaMais
# Uso: bus <comando> [opções]
# Comandos: init, agent, send, receive, queue, pipeline, status

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
DB="${FLYDEA_RUNTIME_DB:-$PROJECT_ROOT/.ai/runtime/runtime.db}"

uuid() { uuidgen 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null || echo "fallback-$(date +%s)-$$"; }
now() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
die() { echo "ERROR: $*" >&2; exit 1; }

require_db() { [ -f "$DB" ] || die "runtime.db não encontrado. Execute 'bus init' primeiro."; }

# ── Init ─────────────────────────────────────────────────────────────────
cmd_init() {
  if [ -f "$DB" ]; then echo "runtime.db já existe"; return 0; fi
  mkdir -p "$(dirname "$DB")"
  sqlite3 "$DB" < "$SCRIPT_DIR/schema-extension.sql"
  echo "runtime.db criado em $DB"
  echo "Schema: bus_agents, bus_messages, bus_pipelines, bus_pipeline_runs, bus_subscriptions, bus_queues, events, checkpoints, approvals"
}

# ── Agent ────────────────────────────────────────────────────────────────
cmd_agent() {
  local agent="" action=""
  while [[ $# -gt 0 ]]; do case "$1" in register|heartbeat|status) action="$1"; shift ;; --agent) agent="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$agent" ] && die "--agent required"
  require_db
  case "$action" in
    register) sqlite3 "$DB" "INSERT OR IGNORE INTO bus_agents (id, name, role) VALUES ('$agent', '$agent', '$agent');"; echo "Agent '$agent' registrado." ;;
    heartbeat) sqlite3 "$DB" "UPDATE bus_agents SET status='idle', last_heartbeat='$(now)' WHERE name='$agent';" ;;
    status) sqlite3 -column -header "$DB" "SELECT name, role, status, last_heartbeat FROM bus_agents WHERE name='$agent';" ;;
    *) die "Use: register, heartbeat, status" ;;
  esac
}

# ── Send ─────────────────────────────────────────────────────────────────
cmd_send() {
  local to="" type="" subject="" body="" correlation_id="" priority="P2"
  while [[ $# -gt 0 ]]; do
    case "$1" in --to) to="$2"; shift 2 ;; --type) type="$2"; shift 2 ;; --subject) subject="$2"; shift 2 ;;
      --body) body="$2"; shift 2 ;; --correlation) correlation_id="$2"; shift 2 ;; --priority) priority="$2"; shift 2 ;; *) shift ;;
    esac
  done
  [ -z "$type" ] && die "--type required"
  [ -z "$subject" ] && die "--subject required"
  require_db
  local msg_id sender correlation
  msg_id=$(uuid); sender="${FLYDEA_AGENT:-orchestrator}"
  correlation="${correlation_id:-$msg_id}"
  local escaped_body
  escaped_body=$(echo "${body:-}" | sed "s/'/''/g")
  sqlite3 "$DB" "INSERT INTO bus_messages (id, correlation_id, sender, recipient, msg_type, subject, body, priority, status, created_at)
    VALUES ('$msg_id', '$correlation', '$sender', '${to:-}', '$type', '$subject', '${escaped_body:-}', '$priority', 'pending', '$(now)');"
  echo "{\"msg_id\": \"$msg_id\", \"correlation_id\": \"$correlation\", \"to\": \"${to:-broadcast}\", \"type\": \"$type\"}"
}

# ── Receive ──────────────────────────────────────────────────────────────
cmd_receive() {
  local agent="" limit=5 mark_read=false queue=""
  while [[ $# -gt 0 ]]; do
    case "$1" in --agent) agent="$2"; shift 2 ;; --limit) limit="$2"; shift 2 ;; --mark-read) mark_read=true; shift ;;
      --queue) queue="$2"; shift 2 ;; *) shift ;;
    esac
  done
  [ -z "$agent" ] && die "--agent required"
  require_db
  local where="(recipient='$agent' OR recipient IS NULL)"
  [ -n "$queue" ] && where="recipient='queue:$queue'"
  local msgs
  msgs=$(sqlite3 -json "$DB" "SELECT id, correlation_id, sender, msg_type, subject, body, priority, status, created_at FROM bus_messages WHERE $where AND status='pending' ORDER BY created_at ASC LIMIT $limit;" 2>/dev/null || echo "[]")
  if [ "$mark_read" = true ] && [ "$msgs" != "[]" ]; then
    local ids; ids=$(echo "$msgs" | python3 -c "import sys,json; print(','.join(\"'\"+m['id']+\"'\" for m in json.load(sys.stdin)))" 2>/dev/null)
    [ -n "$ids" ] && sqlite3 "$DB" "UPDATE bus_messages SET status='delivered', delivered_at='$(now)' WHERE id IN ($ids);" 2>/dev/null || true
  fi
  echo "$msgs"
}

# ── Queue ────────────────────────────────────────────────────────────────
cmd_queue() {
  local action="${1:-}"; shift 2>/dev/null || true
  case "$action" in
    create) cmd_queue_create "$@" ;;
    list) cmd_queue_list ;;
    delete) cmd_queue_delete "$@" ;;
    subscribe) cmd_queue_subscribe "$@" ;;
    unsubscribe) cmd_queue_unsubscribe "$@" ;;
    publish) cmd_queue_publish "$@" ;;
    consume) cmd_queue_consume "$@" ;;
    ack) cmd_queue_ack "$@" ;;
    nack) cmd_queue_nack "$@" ;;
    *) echo "Subcomandos: create, list, delete, subscribe, unsubscribe, publish, consume, ack, nack" ;;
  esac
}

cmd_queue_create() {
  local name="" type="topic" dlq="" max_retries=3
  while [[ $# -gt 0 ]]; do
    case "$1" in --name) name="$2"; shift 2 ;; --type) type="$2"; shift 2 ;; --dlq) dlq="$2"; shift 2 ;; --max-retries) max_retries="$2"; shift 2 ;; *) shift ;;
    esac
  done
  [ -z "$name" ] && die "--name required"
  require_db
  sqlite3 "$DB" "INSERT OR IGNORE INTO bus_queues (name, type, dlq_name, max_retries) VALUES ('$name', '$type', '${dlq:-}', $max_retries);"
  echo "Queue '$name' criada (type=$type, dlq=${dlq:--}, max_retries=$max_retries)"
}

cmd_queue_list() {
  require_db
  echo "=== Queues ==="
  sqlite3 -column -header "$DB" "SELECT name, type, COALESCE(dlq_name,'-') AS dlq, max_retries FROM bus_queues ORDER BY name;" 2>/dev/null
  echo ""
  echo "=== Subscriptions ==="
  sqlite3 -column -header "$DB" "SELECT q.name AS queue, s.agent_id FROM bus_subscriptions s JOIN bus_queues q ON s.topic=q.name ORDER BY q.name;" 2>/dev/null
}

cmd_queue_delete() {
  local name=""
  while [[ $# -gt 0 ]]; do case "$1" in --name) name="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$name" ] && die "--name required"
  require_db
  sqlite3 "$DB" "DELETE FROM bus_subscriptions WHERE topic='$name';"
  sqlite3 "$DB" "DELETE FROM bus_queues WHERE name='$name';"
  echo "Queue '$name' deletada"
}

cmd_queue_subscribe() {
  local queue="" agent=""
  while [[ $# -gt 0 ]]; do case "$1" in --queue) queue="$2"; shift 2 ;; --agent) agent="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$queue" ] && die "--queue required"; [ -z "$agent" ] && die "--agent required"
  require_db
  sqlite3 "$DB" "INSERT OR IGNORE INTO bus_subscriptions (id, agent_id, topic, created_at) VALUES ('$(uuid)', '$agent', '$queue', '$(now)');"
  echo "Agent '$agent' inscrito na queue '$queue'"
}

cmd_queue_unsubscribe() {
  local queue="" agent=""
  while [[ $# -gt 0 ]]; do case "$1" in --queue) queue="$2"; shift 2 ;; --agent) agent="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$queue" ] && die "--queue required"; [ -z "$agent" ] && die "--agent required"
  require_db
  sqlite3 "$DB" "DELETE FROM bus_subscriptions WHERE topic='$queue' AND agent_id='$agent';"
  echo "Agent '$agent' removido da queue '$queue'"
}

cmd_queue_publish() {
  local queue="" subject="" body="" type="queue.msg" priority="P2"
  while [[ $# -gt 0 ]]; do
    case "$1" in --queue) queue="$2"; shift 2 ;; --subject) subject="$2"; shift 2 ;; --body) body="$2"; shift 2 ;;
      --type) type="$2"; shift 2 ;; --priority) priority="$2"; shift 2 ;; *) shift ;;
    esac
  done
  [ -z "$queue" ] && die "--queue required"; [ -z "$subject" ] && die "--subject required"
  require_db
  local sender="${FLYDEA_AGENT:-orchestrator}" msg_id correlation
  msg_id=$(uuid); correlation=$(uuid)
  local escaped_body
  escaped_body=$(echo "${body:-}" | sed "s/'/''/g")

  local queue_type
  queue_type=$(sqlite3 "$DB" "SELECT type FROM bus_queues WHERE name='$queue';")
  [ -z "$queue_type" ] && die "Queue '$queue' nao encontrada. Use 'bus queue create --name $queue' primeiro."

  case "$queue_type" in
    topic)
      local subscribers
      subscribers=$(sqlite3 -json "$DB" "SELECT agent_id FROM bus_subscriptions WHERE topic='$queue';" 2>/dev/null | python3 -c "import sys,json; data=json.load(sys.stdin); [print(s['agent_id']) for s in data]" 2>/dev/null)
      if [ -z "$subscribers" ]; then
        sqlite3 "$DB" "INSERT INTO bus_messages (id, correlation_id, sender, recipient, msg_type, subject, body, priority, status, created_at)
          VALUES ('$msg_id', '$correlation', '$sender', 'queue:$queue', '$type', '$subject', '${escaped_body:-}', '$priority', 'pending', '$(now)');"
        echo "{\"warn\": \"queue '$queue' tem 0 subscribers\", \"msg_id\": \"$msg_id\"}"
        return 0
      fi
      local first=true
      while IFS= read -r sub; do
        [ -z "$sub" ] && continue
        local mid="$msg_id"; [ "$first" = false ] && mid=$(uuid)
        sqlite3 "$DB" "INSERT INTO bus_messages (id, correlation_id, sender, recipient, msg_type, subject, body, priority, status, created_at)
          VALUES ('$mid', '$correlation', '$sender', '$sub', '$type', '$subject', '${escaped_body:-}', '$priority', 'pending', '$(now)');"
        first=false
      done <<< "$subscribers"
      echo "{\"queue\": \"$queue\", \"type\": \"topic\", \"correlation_id\": \"$correlation\", \"subscribers\": \"$subscribers\"}"
      ;;
    competitive|direct)
      sqlite3 "$DB" "INSERT INTO bus_messages (id, correlation_id, sender, recipient, msg_type, subject, body, priority, status, created_at)
        VALUES ('$msg_id', '$correlation', '$sender', 'queue:$queue', '$type', '$subject', '${escaped_body:-}', '$priority', 'pending', '$(now)');"
      echo "{\"queue\": \"$queue\", \"type\": \"$queue_type\", \"correlation_id\": \"$correlation\", \"msg_id\": \"$msg_id\"}"
      ;;
  esac
}

cmd_queue_consume() {
  local queue="" agent="" limit=1 ack=false
  while [[ $# -gt 0 ]]; do
    case "$1" in --queue) queue="$2"; shift 2 ;; --agent) agent="$2"; shift 2 ;; --limit) limit="$2"; shift 2 ;; --ack) ack=true; shift ;; *) shift ;;
    esac
  done
  [ -z "$queue" ] && die "--queue required"; [ -z "$agent" ] && die "--agent required"
  require_db

  local queue_type
  queue_type=$(sqlite3 "$DB" "SELECT type FROM bus_queues WHERE name='$queue';")

  local msgs
  case "$queue_type" in
    topic)
      msgs=$(sqlite3 -json "$DB" "SELECT id, correlation_id, sender, msg_type, subject, body, priority, status, created_at FROM bus_messages WHERE recipient='$agent' AND msg_type='queue.msg' AND status='pending' ORDER BY created_at ASC LIMIT $limit;" 2>/dev/null || echo "[]")
      ;;
    competitive|direct)
      msgs=$(sqlite3 -json "$DB" "SELECT id, correlation_id, sender, msg_type, subject, body, priority, status, created_at FROM bus_messages WHERE recipient='queue:$queue' AND status='pending' ORDER BY created_at ASC LIMIT $limit;" 2>/dev/null || echo "[]")
      if [ "$msgs" != "[]" ] && [ "$ack" = true ]; then
        local ids; ids=$(echo "$msgs" | python3 -c "import sys,json; print(','.join(\"'\"+m['id']+\"'\" for m in json.load(sys.stdin)))" 2>/dev/null)
        [ -n "$ids" ] && sqlite3 "$DB" "UPDATE bus_messages SET status='delivered', delivered_at='$(now)', recipient='$agent' WHERE id IN ($ids) AND status='pending';" 2>/dev/null || true
      fi
      ;;
  esac
  echo "$msgs"
}

cmd_queue_ack() {
  local msg_id=""
  while [[ $# -gt 0 ]]; do case "$1" in --msg-id) msg_id="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$msg_id" ] && die "--msg-id required"
  require_db
  sqlite3 "$DB" "UPDATE bus_messages SET status='delivered', delivered_at='$(now)' WHERE id='$msg_id' AND status='pending';"
  echo "Message '$msg_id' acknowledged"
}

cmd_queue_nack() {
  local msg_id="" reason="unknown"
  while [[ $# -gt 0 ]]; do case "$1" in --msg-id) msg_id="$2"; shift 2 ;; --reason) reason="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$msg_id" ] && die "--msg-id required"
  require_db

  local retries queue_name dlq_name
  retries=$(sqlite3 "$DB" "SELECT COALESCE(json_extract(body,'$.nack_count'),0)+1 FROM bus_messages WHERE id='$msg_id';" 2>/dev/null || echo 1)
  sqlite3 "$DB" "UPDATE bus_messages SET status='failed', body=json_set(COALESCE(body,'{}'),'$.nack_count',$retries,'$.nack_reason','$reason') WHERE id='$msg_id';"

  local recipient
  recipient=$(sqlite3 "$DB" "SELECT recipient FROM bus_messages WHERE id='$msg_id';" 2>/dev/null || echo "")
  queue_name=$(echo "$recipient" | sed 's/^queue://')
  dlq_name=$(sqlite3 "$DB" "SELECT dlq_name FROM bus_queues WHERE name='$queue_name';" 2>/dev/null || echo "")

  if [ -n "$dlq_name" ] && [ "$retries" -ge 3 ]; then
    cmd_queue_create --name "$dlq_name" --type topic 2>/dev/null || true
    sqlite3 "$DB" "UPDATE bus_messages SET recipient='queue:$dlq_name', status='pending' WHERE id='$msg_id';"
    echo "Message '$msg_id' moved to DLQ '$dlq_name' (retries=$retries)"
  else
    sqlite3 "$DB" "UPDATE bus_messages SET status='pending' WHERE id='$msg_id';"
    echo "Message '$msg_id' requeued (retry $retries)"
  fi
}

# ── Pipeline ─────────────────────────────────────────────────────────────
cmd_pipeline() {
  local action=""
  while [[ $# -gt 0 ]]; do case "$1" in start|advance|status|list) action="$1"; shift; break ;; *) shift ;; esac; done
  case "$action" in start) cmd_pipeline_start "$@" ;; advance) cmd_pipeline_advance "$@" ;; status) cmd_pipeline_status "$@" ;; list) cmd_pipeline_list ;; *) die "Use: start, advance, status, list" ;; esac
}

cmd_pipeline_start() {
  local name="" work_item="" context="{}" correlation_id
  while [[ $# -gt 0 ]]; do case "$1" in --name) name="$2"; shift 2 ;; --work-item) work_item="$2"; shift 2 ;; --context) context="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$name" ] && die "--name required (pipeline id)"
  require_db
  local total_steps
  total_steps=$(sqlite3 "$DB" "SELECT json_array_length(steps) FROM bus_pipelines WHERE id='$name';")
  [ -z "$total_steps" ] && die "Pipeline '$name' não encontrado"
  correlation_id=$(uuid)
  sqlite3 "$DB" "INSERT INTO bus_pipeline_runs (id, pipeline_id, work_item_id, correlation_id, current_step, total_steps, status, context_json, created_by)
    VALUES ('$(uuid)', '$name', '${work_item:-}', '$correlation_id', 0, $total_steps, 'running', '$context', '${FLYDEA_AGENT:-orchestrator}');"

  local steps_json
  steps_json=$(sqlite3 "$DB" "SELECT steps FROM bus_pipelines WHERE id='$name';")

  cmd_queue_publish --queue "pipeline.default" --subject "pipeline.started" \
    --body "{\"pipeline\":\"$name\",\"correlation_id\":\"$correlation_id\",\"steps\":$steps_json}" >/dev/null 2>&1 || true

  echo "{\"pipeline\": \"$name\", \"correlation_id\": \"$correlation_id\", \"total_steps\": $total_steps, \"status\": \"running\", \"current_step\": 0}"
}

cmd_pipeline_advance() {
  local correlation_id=""
  while [[ $# -gt 0 ]]; do case "$1" in --correlation-id) correlation_id="$2"; shift 2 ;; *) shift ;; esac; done
  [ -z "$correlation_id" ] && die "--correlation-id required"
  require_db
  local run_info current_step total_steps status pipeline_id steps_json
  run_info=$(sqlite3 "$DB" "SELECT pr.id, pr.current_step, pr.total_steps, pr.status, pr.pipeline_id, p.steps FROM bus_pipeline_runs pr JOIN bus_pipelines p ON p.id=pr.pipeline_id WHERE pr.correlation_id='$correlation_id';")
  [ -z "$run_info" ] && die "Pipeline run não encontrado"
  current_step=$(echo "$run_info" | cut -d'|' -f2)
  total_steps=$(echo "$run_info" | cut -d'|' -f3)
  status=$(echo "$run_info" | cut -d'|' -f4)
  pipeline_id=$(echo "$run_info" | cut -d'|' -f5)
  steps_json=$(echo "$run_info" | cut -d'|' -f6)
  [ "$status" != "running" ] && die "Pipeline não está running (status=$status)"
  local next_step=$((current_step + 1))
  if [ "$next_step" -ge "$total_steps" ]; then
    sqlite3 "$DB" "UPDATE bus_pipeline_runs SET status='completed', completed_at='$(now)' WHERE correlation_id='$correlation_id';"
    cmd_queue_publish --queue "pipeline.default" --subject "pipeline.completed" \
      --body "{\"pipeline\":\"$pipeline_id\",\"correlation_id\":\"$correlation_id\"}" >/dev/null 2>&1 || true
    echo "{\"correlation_id\": \"$correlation_id\", \"status\": \"completed\"}"
    return 0
  fi
  sqlite3 "$DB" "UPDATE bus_pipeline_runs SET current_step=$next_step WHERE correlation_id='$correlation_id';"
  echo "{\"correlation_id\": \"$correlation_id\", \"current_step\": $next_step, \"total_steps\": $total_steps, \"status\": \"running\"}"
}

cmd_pipeline_list() {
  require_db
  echo "=== Pipelines ==="
  sqlite3 -column -header "$DB" "SELECT id, name, category, CASE WHEN is_mutable=1 THEN 'yes' ELSE 'no' END AS mutable FROM bus_pipelines ORDER BY category;" 2>/dev/null
  echo ""
  echo "=== Active runs ==="
  sqlite3 -column -header "$DB" "SELECT correlation_id, pipeline_id, current_step||'/'||total_steps AS step, status, started_at FROM bus_pipeline_runs WHERE status IN ('running','waiting_human') ORDER BY started_at DESC;" 2>/dev/null
}

# ── Status ───────────────────────────────────────────────────────────────
cmd_status() {
  require_db
  echo "=== Message Bus Status ==="
  echo "DB: $DB"
  echo "Project: $PROJECT_ROOT"
  echo ""; echo "--- Agents ---"
  sqlite3 -column -header "$DB" "SELECT name, role, status, COALESCE(last_heartbeat,'-') AS last_heartbeat FROM bus_agents ORDER BY name;" 2>/dev/null
  echo ""; echo "--- Queues ---"
  sqlite3 -column -header "$DB" "SELECT q.name, q.type, COALESCE(q.dlq_name,'-') AS dlq, COUNT(s.agent_id) AS subs FROM bus_queues q LEFT JOIN bus_subscriptions s ON s.topic=q.name GROUP BY q.name ORDER BY q.name;" 2>/dev/null
  echo ""; echo "--- Pending Messages ---"
  sqlite3 -column -header "$DB" "SELECT sender, recipient, msg_type, priority, subject FROM bus_messages WHERE status='pending' ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
  echo ""; echo "--- Active Pipelines ---"
  sqlite3 -column -header "$DB" "SELECT correlation_id, pipeline_id, current_step||'/'||total_steps AS step, status FROM bus_pipeline_runs WHERE status IN ('running','waiting_human') ORDER BY started_at DESC;" 2>/dev/null
  echo ""; echo "--- Summary ---"
  echo "Messages total: $(sqlite3 "$DB" 'SELECT COUNT(*) FROM bus_messages;')"
  echo "Messages pending: $(sqlite3 "$DB" "SELECT COUNT(*) FROM bus_messages WHERE status='pending';")"
  echo "Queues: $(sqlite3 "$DB" 'SELECT COUNT(*) FROM bus_queues;')"
  echo "Agents registered: $(sqlite3 "$DB" 'SELECT COUNT(*) FROM bus_agents;')"
  echo "Subscriptions: $(sqlite3 "$DB" 'SELECT COUNT(*) FROM bus_subscriptions;')"
  echo "Pipeline runs: $(sqlite3 "$DB" 'SELECT COUNT(*) FROM bus_pipeline_runs;')"
}

# ── Main ─────────────────────────────────────────────────────────────────
cmd_main() {
  local cmd="${1:-}"; shift 2>/dev/null || true
  case "$cmd" in
    init) cmd_init "$@" ;;
    agent) cmd_agent "$@" ;;
    send) cmd_send "$@" ;;
    receive) cmd_receive "$@" ;;
    queue) cmd_queue "$@" ;;
    pipeline) cmd_pipeline "$@" ;;
    status) cmd_status "$@" ;;
    help|--help|-h)
      echo "FlyDea Message Bus — Uso:"
      echo "  bus init                          Cria runtime.db"
      echo "  bus agent --agent <name> register|heartbeat|status"
      echo "  bus send --to <agent> --type <t> --subject <s> [--body <b>]"
      echo "  bus receive --agent <name> [--limit N] [--mark-read]"
      echo "  bus queue create --name <q> [--type topic|competitive|direct]"
      echo "  bus queue list"
      echo "  bus queue subscribe --queue <q> --agent <a>"
      echo "  bus queue publish --queue <q> --subject <s> [--body <b>]"
      echo "  bus queue consume --queue <q> --agent <a> [--ack]"
      echo "  bus queue ack --msg-id <id> | nack --msg-id <id>"
      echo "  bus pipeline start|advance|list|status"
      echo "  bus status                        Visão geral do sistema"
      ;;
    *) echo "Uso: bus <comando>"; echo "Comandos: init, agent, send, receive, queue, pipeline, status";;
  esac
}

cmd_main "$@"
