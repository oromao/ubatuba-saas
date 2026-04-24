#!/usr/bin/env bash
set -euo pipefail

SESSION="flydea-ai"

tmux new-session -d -s $SESSION

run() {
  local name="$1"
  local cmd="$2"

  tmux new-window -t $SESSION -n "$name"
  tmux send-keys -t $SESSION:"$name" "$cmd" C-m
}

COMMON='
Leia 02-BACKLOG.md, 08-AUDIT-FINDINGS-SUMMARY.md, 09-MULTIAGENT-HANDOFF.md e 04-PROGRESS-LOG.md.

REGRAS:
- não fazer loop
- não refatorar amplo
- validar de verdade
- parar se repetir erro 2x
- entregar correção real
'

run "portal" "codex \"TASK: T1-AUDIT-PORTAL-CIDADAO
$COMMON
Corrija erro 500 portal cidadão com persistência real backend.
Valide com teste real.\""

run "vistorias" "claude \"TASK: T1-AUDIT-VISTORIAS
$COMMON
Corrija botão que não funciona.
Fluxo deve criar vistoria de verdade.\""

run "routing" "gemini -p \"TASK: T1-AUDIT-ROUTING
$COMMON
Corrija redirecionamento admin.
Sem loop de login.\""

run "ctm" "claude \"TASK: T1-AUDIT-CTM-EQUIPAMENTOS
$COMMON
Corrija rota 404.
Tela deve abrir corretamente.\""

echo "Session criada: $SESSION"
echo "Use: tmux attach -t $SESSION"
