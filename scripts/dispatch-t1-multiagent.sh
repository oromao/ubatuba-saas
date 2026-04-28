#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
LOG_DIR="$ROOT/.ai-dispatch"
mkdir -p "$LOG_DIR"

COMMON_RULES='
REGRAS OBRIGATÓRIAS:
- Leia 02-BACKLOG.md, 08-AUDIT-FINDINGS-SUMMARY.md, 09-MULTIAGENT-HANDOFF.md e 04-PROGRESS-LOG.md.
- Trabalhe somente na task designada.
- Não mexa em arquivos fora do escopo sem evidência forte.
- Não refatore amplo.
- Não invente sucesso.
- Não faça loop: se falhar 2 vezes com o mesmo erro, registre causa provável e mude abordagem.
- Sempre rode validação objetiva.
- Atualize 04-PROGRESS-LOG.md no final.
- Faça commit pequeno e claro.
- Saída final: problema, causa raiz, arquivos alterados, validação, risco residual, commit.
'

dispatch() {
  local agent="$1"
  local task="$2"
  local prompt="$3"
  local file="$LOG_DIR/${task}.prompt.txt"

  cat > "$file" <<PROMPT
Você está no repo: $ROOT

TASK: $task

$COMMON_RULES

MISSÃO:
$prompt

CRITÉRIO DE SUCESSO:
- Bug corrigido de verdade.
- Teste/validação passou.
- Sem falso positivo.
- Sem loop.
- Commit feito com prefixo [$task].

COMECE AGORA.
PROMPT

  echo "Despachando $task para $agent..."

  case "$agent" in
    codex)
      nohup codex "$(<"$file")" > "$LOG_DIR/${task}.out.log" 2>&1 &
      ;;
    claude)
      nohup claude "$(<"$file")" > "$LOG_DIR/${task}.out.log" 2>&1 &
      ;;
    gemini)
      nohup gemini -p "$(<"$file")" > "$LOG_DIR/${task}.out.log" 2>&1 &
      ;;
    *)
      echo "Agente inválido: $agent"
      exit 1
      ;;
  esac

  echo "$! $agent $task" >> "$LOG_DIR/pids.txt"
}

dispatch codex "T1-AUDIT-PORTAL-CIDADAO" "
Corrija o erro 500 do Portal Cidadão.
Use 08-AUDIT-FINDINGS-SUMMARY.md linhas/seção do Portal Cidadão.
Objetivo: cidadão consegue enviar solicitação/chamado sem erro 500, com persistência real backend/API/DB.
Valide com teste backend e, se possível, browser/E2E.
"

dispatch claude "T1-AUDIT-VISTORIAS" "
Corrija o fluxo de Vistorias onde o botão não clica/não executa ação.
Use 09-MULTIAGENT-HANDOFF.md seção Claude e backlog correspondente.
Objetivo: fiscal consegue iniciar/criar vistoria pelo fluxo principal.
Valide no browser ou teste E2E focado.
"

dispatch gemini "T1-AUDIT-ROUTING" "
Corrija o roteamento/admin redirection.
Use 09-MULTIAGENT-HANDOFF.md seção Gemini.
Objetivo: admin autenticado navega corretamente sem redirect indevido.
Valide login/admin/menu/rotas protegidas.
"

dispatch claude "T1-AUDIT-CTM-EQUIPAMENTOS" "
Corrija rota 404 de CTM Equipamentos.
Use 09-MULTIAGENT-HANDOFF.md e 02-BACKLOG.md.
Objetivo: menu/rota CTM Equipamentos abre tela válida, sem 404, com estado vazio adequado ou dados reais.
Valide curl/browser/Playwright.
"

echo ""
echo "Dispatch concluído."
echo "Prompts: $LOG_DIR/*.prompt.txt"
echo "Logs:    $LOG_DIR/*.out.log"
echo "PIDs:    $LOG_DIR/pids.txt"
echo ""
echo "Acompanhar:"
echo "tail -f $LOG_DIR/*.out.log"
