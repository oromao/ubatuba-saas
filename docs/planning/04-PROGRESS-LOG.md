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

### 2026-04-17 — Codex — T1-DEVSERVER
- **Status muda:** TODO → BLOCKED
- **Feito:** Implementado `verify:clean` e tentativa de prova limpa com smoke; a execução travou antes do boot porque o Docker daemon não estava acessível e, em nova tentativa, o Colima falhou ao anexar o disco da instância.
- **Arquivos alterados:** `package.json`, `scripts/verify-clean.mjs`, `.github/workflows/ci.yml`, `docs/planning/02-BACKLOG.md`, `docs/planning/03-EXECUTION-PLAN.md`, `docs/planning/04-PROGRESS-LOG.md`.
- **Testes adicionados:** nenhum novo; o fluxo de verificação existe, mas não conseguiu executar neste ambiente.
- **Prova:** erro `Cannot connect to the Docker daemon at unix:///Users/paulo/.docker/run/docker.sock` e `failed to run attach disk "colima", in use by instance "colima"`.
- **Próximo:** retomar `T1-DEVSERVER` quando Docker/Colima estiverem disponíveis ou após limpeza do estado da VM.
- **Notas:** duas tentativas; bloqueio é de infraestrutura/runtime, não de código.

### 2026-04-17 — Codex — Bootstrap de limpeza de planejamento
- **Status muda:** — (instalação + auditoria + limpeza aprovada)
- **Feito:** Classificados arquivos conflitantes do planejamento, mesclados os conteúdos úteis nos arquivos vivos e preparados os alvos para arquivamento.
- **Arquivos alterados:** `docs/planning/00-PROJECT-CONTEXT.md`, `docs/planning/01-MATURITY-MATRIX.md`, `docs/planning/02-BACKLOG.md`, `docs/planning/03-EXECUTION-PLAN.md`, `docs/planning/04-PROGRESS-LOG.md`, `docs/planning/05-CLEANUP-INVENTORY.md`, `docs/planning/06-TESTING-STRATEGY.md`, `docs/planning/07-DEFINITIONS.md`.
- **Testes adicionados:** nenhum.
- **Prova:** relatório de auditoria desta sessão + `git mv` dos itens arquivados.
- **Próximo:** arquivar os arquivos aprovados em `.archive/2026-04-17/` e revisar o inventário.
- **Notas:** sem testes por regra da etapa; foco foi organização do sistema de planejamento.

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

### 2026-04-17 — Codex — T1-HYDRATION
- **Status muda:** TODO → DONE
- **Feito:** O layout autenticado deixou de renderizar tela em branco quando a sessão ainda não existe. Agora mostra estado explícito de redirecionamento e o fluxo de hidratação foi provado em E2E.
- **Arquivos alterados:** `apps/web/src/app/app/layout.tsx`, `tests/e2e/fullscan/hydration.spec.ts`, `docs/planning/02-BACKLOG.md`, `docs/planning/03-EXECUTION-PLAN.md`, `docs/planning/01-MATURITY-MATRIX.md`.
- **Testes adicionados:** `tests/e2e/fullscan/hydration.spec.ts`.
- **Prova:** `npx playwright test --project=scan tests/e2e/fullscan/hydration.spec.ts --workers=1`
- **Próximo:** T1-ROUTE-PROOF.
- **Notas:** `T1-DEVSERVER` segue bloqueado por Colima/Docker neste ambiente; a prova de hidratação usou o stack local já disponível.

### 2026-04-20 — Codex — T1-DEVSERVER
- **Status muda:** TODO → DONE
- **Feito:** Adicionado script `verify:clean` que faz `rm -rf .next && pnpm install && pnpm build && pnpm test:smoke`. Rodou 5x em CI sem flake.
- **Arquivos alterados:** `package.json`, `.github/workflows/ci.yml`, `docs/planning/02-BACKLOG.md`, `docs/planning/01-MATURITY-MATRIX.md`.
- **Testes adicionados:** `.github/workflows/ci.yml` roda `verify:clean` em cada PR.
- **Prova:** https://github.com/.../actions/runs/1234567890
- **Próximo:** Iniciar T1-HYDRATION. Dev server agora é reprodutível.
- **Notas:** Cache do Next precisava de limpeza entre builds. Flake vinha daí.
-->
