# 08 — Agent Handoff (Manual Operacional)

> Protocolo obrigatório para início e fim de sessão de qualquer agente IA.
> ÚLTIMA REVISÃO: `2026-04-29` por `Gemini CLI (Cleanup Phase)`

---

## 1. Regras de Ouro

- 🛑 **Um Writer por vez:** Nunca edite arquivos se outro agente estiver com sessão ativa no mesmo workspace.
- 🛑 **Sem prova, sem DONE:** Nunca marque um item como DONE no backlog sem anexar o link/path do teste (P1-P8).
- 🛑 **Verdade no Filesystem:** O filesystem é a única fonte da verdade. Se o backlog diz DONE mas o código não tem teste, rebaixe para PARTIAL.
- 🛑 **Silêncio é Ouro:** Mantenha respostas compactas. Use ferramentas para agir, texto para comunicar intenção técnica.

---

## 2. Ciclo de Sessão (The Agent Loop)

### Início: Contextualização
1.  Ler `AGENTS.md` (Briefing).
2.  Ler `docs/planning/00-PROJECT-CONTEXT.md` (Constituição).
3.  Ler `docs/planning/04-PROGRESS-SUMMARY.md` (Estado Atual).
4.  Ler `docs/planning/03-EXECUTION-PLAN.md` (Próximas Tarefas).
5.  **Identificar a tarefa:** Pegar o item #1 do "Top 5 Obrigatórios" no Execution Plan.

### Meio: Execução (Research -> Strategy -> Execution)
1.  **Reproduzir:** Se for bug, crie um teste que falhe antes de consertar.
2.  **Implementar:** Mudanças cirúrgicas, seguindo padrões locais.
3.  **Validar:** Rodar o nível de prova exigido (P1-P8).

### Fim: Handoff & Write-back
1.  Atualizar `docs/planning/02-BACKLOG.md` (Mudar status).
2.  Atualizar `docs/planning/04-PROGRESS-LOG.md` (Adicionar entrada no topo).
3.  Atualizar `docs/planning/04-PROGRESS-SUMMARY.md` (Se houver mudança material).
4.  Atualizar `docs/planning/03-EXECUTION-PLAN.md` (Mover para próximo item).
5.  Atualizar `docs/planning/01-MATURITY-MATRIX.md` (Se a maturidade do domínio mudou).
6.  **Commit:** Seguir o padrão de mensagem especificado no `AGENTS.md`.

---

## 3. Parallel Agent Handoff

Para sessões paralelas, utilize estes templates no seu log de execução ou handoff direto.

### Template: Task Claim (Início)
> **Task Claim**
> - Task ID: [ID]
> - Agent: [Nome/Modelo]
> - Branch: [Nome da branch]
> - Intended files: [Lista de caminhos ou módulos]
> - Expected proof: [P1-P8]
> - Can parallelize: [Sim/Não]
> - Conflicts checked: [Sim/Não]
> - Lock created in 11-ACTIVE-LOCKS.md: [Sim/Não]

### Template: Task Handoff (Fim)
> **Handoff**
> - Task ID: [ID]
> - Agent: [Nome/Modelo]
> - Status: [DONE/PARTIAL/BLOCKED]
> - Files changed: [Lista]
> - Tests/proof: [Caminho do teste]
> - Not proven: [O que faltou]
> - Remaining work: [Próximos passos]
> - Lock status: [RELEASED/DONE]
> - Safe for another agent to continue? [Sim/Não]

### Template: Conflict Report
> **Conflict Report**
> - Task ID: [Minha Task ID]
> - Agent: [Meu Nome]
> - File conflict: [Caminho do arquivo bloqueado]
> - Existing lock: [ID da outra Task]
> - My intended change: [Breve descrição]
> - Action taken: [Pulei tarefa / Mudei escopo / Aguardando]
> - Decision needed from Paulo: [Sim/Não]

---

## 4. Templates de Prompt / Intenção (Original)

1.  **Não pare:** Tente uma rota alternativa ou reduza o escopo para um "PARTIAL" funcional.
2.  **Documente:** Se falhar após 3 tentativas, pare e liste as premissas erradas.
3.  **Sinalize:** Marque o item como `BLOCKED` no backlog e explique o porquê no Progress Log.
4.  **Handoff:** Deixe o workspace limpo para o próximo agente ou para o Paulo.

---

> **Nota:** Este sistema de handoff visa reduzir o "token waste" e evitar auditorias infinitas. Siga o plano.
