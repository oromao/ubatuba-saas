# Harness Operating Contract — FlyDea

## Purpose
- Keep govtech business impact ahead of technical convenience.
- Make multi-agent workflow explicit and repeatable.
- Reduce ambiguity between governance, execution, and memory.

## Canonical Decision Order
1. Business and legal impact (Lei de Acesso à Informação, LGPD)
2. Risk and blast radius
3. Security and compliance
4. Execution
5. QA validation (existência ≠ funcionando — prove com testes)
6. Memory and documentation updates

## Operating Rules
- Never take mutable action without business impact review
- Prefer homologation first, then production
- Treat `terraform plan` and dry runs as decision artifacts
- Do not update memory by guesswork; update only what changed

## Sources of Truth
- Business context: `.ai/business-context.index.md`
- Current state: `.ai/context-compact.md`
- Active task: `.ai/current-task.md`
- Risk register: `.ai/risks.index.md`
- Delivery backlog: `docs/planning/02-BACKLOG.md`
- Command policy: `.ai/tools/command-policy.md`
- Execution plan: `docs/planning/03-EXECUTION-PLAN.md`
- Progress summary: `docs/planning/04-PROGRESS-SUMMARY.md`
- Active locks: `docs/planning/11-ACTIVE-LOCKS.md`
- Definitions: `docs/planning/07-DEFINITIONS.md`

## Infrastructure
- Message Bus: `.ai/runtime/bus/bus.sh` — agent communication
- Queues: `bus queue create|subscribe|publish|consume` — agent task queues
- Pipelines: `bus pipeline start|advance` — multi-step agent workflows
- Planning Bridge: `.ai/runtime/planning-bridge.sh` — sync harness ↔ planning system
- Tests: `.ai/runtime/bus/test-bus.sh` — 17 tests for bus + queues
