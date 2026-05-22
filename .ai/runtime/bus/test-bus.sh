#!/usr/bin/env bash
# FlyDea Message Bus — Integration Tests
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUS="$DIR/bus.sh"
DB_TEST="/tmp/flydea-test-$$.db"
export FLYDEA_RUNTIME_DB="$DB_TEST"

PASS=0
FAIL=0

pass() { PASS=$((PASS+1)); echo "  [PASS] $*"; }
fail() { FAIL=$((FAIL+1)); echo "  [FAIL] $*"; }

cleanup() { rm -f "$DB_TEST"; }
trap cleanup EXIT

# ── Test 1: init ────────────────────────────────────────────────────────
echo "=== Test: init ==="
"$BUS" init >/dev/null 2>&1 || true
[ -f "$DB_TEST" ] && pass "runtime.db created" || fail "runtime.db not created"

# ── Test 2: agent ───────────────────────────────────────────────────────
echo "=== Test: agent ==="
"$BUS" agent --agent testor register >/dev/null 2>&1
AGENT_OK=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_agents WHERE name='testor';")
[ "$AGENT_OK" = "1" ] && pass "agent registered" || fail "agent not registered"

"$BUS" agent --agent testor heartbeat >/dev/null 2>&1
HB_OK=$(sqlite3 "$DB_TEST" "SELECT status FROM bus_agents WHERE name='testor';")
[ "$HB_OK" = "idle" ] && pass "agent heartbeat" || fail "agent heartbeat failed"

# ── Test 3: send/receive ────────────────────────────────────────────────
echo "=== Test: send/receive ==="
"$BUS" send --to testor --type proposal --subject "test message" --body "hello" >/dev/null 2>&1
MSG_COUNT=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_messages WHERE status='pending';")
[ "$MSG_COUNT" -ge 1 ] && pass "send message" || fail "send message failed"

RECV=$("$BUS" receive --agent testor --limit 5 2>/dev/null)
RECV_COUNT=$(echo "$RECV" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null)
[ "$RECV_COUNT" -ge 1 ] && pass "receive message (count=$RECV_COUNT)" || fail "receive message failed"

# ── Test 4: queue create ────────────────────────────────────────────────
echo "=== Test: queue create ==="
"$BUS" queue create --name test.queue --type topic --dlq test.dlq >/dev/null 2>&1
Q_OK=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_queues WHERE name='test.queue' AND type='topic';")
[ "$Q_OK" = "1" ] && pass "queue created" || fail "queue not created"

# ── Test 5: queue sub/pub/consume ───────────────────────────────────────
echo "=== Test: queue pub/sub ==="
"$BUS" queue subscribe --queue test.queue --agent testor >/dev/null 2>&1
SUB_OK=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_subscriptions WHERE topic='test.queue' AND agent_id='testor';")
[ "$SUB_OK" = "1" ] && pass "queue subscribe" || fail "queue subscribe failed"

"$BUS" queue publish --queue test.queue --subject "queue.msg" --body "queued" >/dev/null 2>&1
PUB_OK=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_messages WHERE status='pending';")
[ "$PUB_OK" -ge 1 ] && pass "queue publish" || fail "queue publish failed"

CONS=$("$BUS" queue consume --queue test.queue --agent testor 2>/dev/null)
CONS_COUNT=$(echo "$CONS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null)
[ "$CONS_COUNT" -ge 1 ] && pass "queue consume (count=$CONS_COUNT)" || fail "queue consume failed"

# ── Test 6: competitive queue ───────────────────────────────────────────
echo "=== Test: competitive queue ==="
"$BUS" queue create --name comp.queue --type competitive --dlq comp.dlq >/dev/null 2>&1
"$BUS" queue subscribe --queue comp.queue --agent worker1 >/dev/null 2>&1
"$BUS" queue subscribe --queue comp.queue --agent worker2 >/dev/null 2>&1
"$BUS" queue publish --queue comp.queue --subject "single.task" --body "work" >/dev/null 2>&1
COMP_PEND_BEFORE=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_messages WHERE recipient='queue:comp.queue' AND status='pending';")
# worker1 consumes with ack
"$BUS" queue consume --queue comp.queue --agent worker1 --ack >/dev/null 2>&1
COMP_PEND_AFTER=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_messages WHERE recipient='queue:comp.queue' AND status='pending';")
COMP_DELIVERED=$(sqlite3 "$DB_TEST" "SELECT COUNT(*) FROM bus_messages WHERE recipient='worker1' AND status='delivered';")
[ "$COMP_PEND_BEFORE" -eq 1 ] && pass "competitive: message queued" || fail "competitive: expected 1 pending, got $COMP_PEND_BEFORE"
[ "$COMP_PEND_AFTER" -eq 0 ] && pass "competitive: consumed (no more pending)" || fail "competitive: still $COMP_PEND_AFTER pending"
[ "$COMP_DELIVERED" -eq 1 ] && pass "competitive: delivered to worker1" || fail "competitive: worker1 delivered count=$COMP_DELIVERED"

# ── Test 7: pipeline ────────────────────────────────────────────────────
echo "=== Test: pipeline ==="
PIPE_OUT=$("$BUS" pipeline start --name read-only-query 2>/dev/null)
CORR_ID=$(echo "$PIPE_OUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['correlation_id'])" 2>/dev/null)
[ -n "$CORR_ID" ] && pass "pipeline started (id=$CORR_ID)" || fail "pipeline start failed"

# Advance through all 3 steps (orchestrator->executor->qa->done)
"$BUS" pipeline advance --correlation-id "$CORR_ID" >/dev/null 2>&1
"$BUS" pipeline advance --correlation-id "$CORR_ID" >/dev/null 2>&1
"$BUS" pipeline advance --correlation-id "$CORR_ID" >/dev/null 2>&1
ADV_STATUS=$(sqlite3 "$DB_TEST" "SELECT status FROM bus_pipeline_runs WHERE correlation_id='$CORR_ID';")
[ "$ADV_STATUS" = "completed" ] && pass "pipeline completed (3 advances)" || fail "pipeline status=$ADV_STATUS"

# ── Test 8: status ──────────────────────────────────────────────────────
echo "=== Test: status ==="
STATUS_OUT=$("$BUS" status 2>/dev/null)
echo "$STATUS_OUT" | grep -q "Message Bus Status" && pass "status command shows bus" || fail "status command failed"

# ── Test 9: DLQ via nack ────────────────────────────────────────────────
echo "=== Test: DLQ ==="
"$BUS" queue create --name fragile.queue --type competitive --dlq fragile.dlq >/dev/null 2>&1
"$BUS" queue subscribe --queue fragile.queue --agent worker1 >/dev/null 2>&1
"$BUS" queue publish --queue fragile.queue --subject "breakable" --body "{}" >/dev/null 2>&1

# Simulate 3 nacks to trigger DLQ move
MSG_ID=$(sqlite3 "$DB_TEST" "SELECT id FROM bus_messages WHERE recipient='queue:fragile.queue' AND status='pending' LIMIT 1;")
[ -n "$MSG_ID" ] && pass "found message for DLQ test" || fail "no message for DLQ test"

# Nack 3 times to trigger DLQ
"$BUS" queue nack --msg-id "$MSG_ID" --reason "attempt1" >/dev/null 2>&1
"$BUS" queue nack --msg-id "$MSG_ID" --reason "attempt2" >/dev/null 2>&1
"$BUS" queue nack --msg-id "$MSG_ID" --reason "attempt3" >/dev/null 2>&1

DLQ_RECIPIENT=$(sqlite3 "$DB_TEST" "SELECT recipient FROM bus_messages WHERE id='$MSG_ID';")
echo "$DLQ_RECIPIENT" | grep -q "fragile.dlq" && pass "DLQ: message moved after 3 nacks" || fail "DLQ: recipient is $DLQ_RECIPIENT"

# ── Summary ─────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "✓ All tests passed!" || echo "✗ Some tests failed."
exit $FAIL
