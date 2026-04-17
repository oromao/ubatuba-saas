# 04 — Progress Log

> **Append-only.** Nunca edite entradas antigas. Adicione novas no topo.
> Formato abaixo.

---

## Formato de entrada

```
### YYYY-MM-DD — <Agente> — <Item/s>
- **Status muda:** <TODO→IN_PROGRESS | IN_PROGRESS→DONE | ...>
- **Feito:** <descrição curta do que foi feito>
- **Arquivos alterados:** <lista>
- **Testes adicionados:** <lista, ou "nenhum" se for PARTIAL>
- **Prova:** <caminho do teste / link de CI / print>
- **Próximo:** <o que fica para a próxima sessão>
- **Notas:** <qualquer coisa relevante para o próximo agente>
```

---

## Entradas

### 2026-04-17 — Codex — Bootstrap de planejamento + limpeza inicial
- **Status muda:** — (criação inicial + consolidação)
- **Feito:** Arquivo de bootstrap antigo foi arquivado em `.archive/2026-04-17/` e o plano `PROXIMAS_20_ACOES_PRIORITARIAS.md` foi consolidado nos docs de planejamento.
- **Arquivos alterados:** `.archive/2026-04-17/CODEX-PROMPT-BOOTSTRAP.md`, `.archive/2026-04-17/PROXIMAS_20_ACOES_PRIORITARIAS.md`, `docs/planning/02-BACKLOG.md`, `docs/planning/03-EXECUTION-PLAN.md`, `docs/planning/04-PROGRESS-LOG.md`, `docs/planning/05-CLEANUP-INVENTORY.md`.
- **Testes adicionados:** nenhum.
- **Prova:** `git mv CODEX-PROMPT-BOOTSTRAP.md .archive/2026-04-17/CODEX-PROMPT-BOOTSTRAP.md`
- **Próximo:** seguir com a primeira tarefa real do backlog T1, começando por `T1-DEVSERVER`.
- **Notas:** `README.md`, docs de importação e módulos DEMO ficaram sinalizados em inventário para tratamento posterior.

### 2026-04-17 — Claude (bootstrap) — Sistema de planejamento
- **Status muda:** — (criação inicial)
- **Feito:** Instalado sistema de planejamento em `docs/planning/` com 8 arquivos (contexto, matriz, backlog, execução, log, limpeza, testes, definições) + `AGENTS.md` na raiz como entrada universal para agentes de IA.
- **Arquivos alterados:** `AGENTS.md`, `docs/planning/00-*.md` a `07-*.md`.
- **Testes adicionados:** nenhum (bootstrap de planejamento, não de código).
- **Prova:** estrutura de arquivos presente e legível por Codex/Claude Code/Gemini.
- **Próximo:** primeiro agente a executar deve começar por `T1-DEVSERVER` (pré-requisito de T1-HYDRATION e T1-ROUTE-PROOF).
- **Notas:** Paulo é o decisor final. Antes de mover arquivos para `.archive/`, preencher `05-CLEANUP-INVENTORY.md` e confirmar com ele.

<!--
Exemplo de entrada futura:

### 2026-04-20 — Codex — T1-DEVSERVER
- **Status muda:** TODO → DONE
- **Feito:** Adicionado script `verify:clean` que faz `rm -rf .next && pnpm install && pnpm build && pnpm test:smoke`. Rodou 5x em CI sem flake.
- **Arquivos alterados:** `package.json`, `.github/workflows/ci.yml`, `docs/planning/02-BACKLOG.md`, `docs/planning/01-MATURITY-MATRIX.md`.
- **Testes adicionados:** `.github/workflows/ci.yml` roda `verify:clean` em cada PR.
- **Prova:** https://github.com/.../actions/runs/1234567890
- **Próximo:** Iniciar T1-HYDRATION. Dev server agora é reprodutível.
- **Notas:** Cache do Next precisava de limpeza entre builds. Flake vinha daí.
-->
