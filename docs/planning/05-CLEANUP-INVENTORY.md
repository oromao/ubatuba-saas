# 05 — Cleanup Inventory

> Inventário do que precisa ser arquivado, escondido ou consolidado.
> Regra: **nunca deletar**. Mover para `.archive/YYYY-MM-DD/<caminho-original>/`.
> Atualize sempre que um agente tocar nessa área.

---

## Processo de limpeza

1. Identificar o alvo e classificar (ver `07-DEFINITIONS.md`).
2. Registrar aqui nesta tabela ANTES de mover.
3. Mover para `.archive/YYYY-MM-DD/` preservando a árvore de pastas.
4. Rodar `pnpm test:smoke` — nada pode quebrar.
5. Commitar com mensagem: `chore(cleanup): archive <alvo> — ref docs/planning/05-CLEANUP-INVENTORY.md`.
6. Registrar em `04-PROGRESS-LOG.md`.

## Classificação

| Rótulo | Ação |
|---|---|
| `KEEP` | Permanece onde está |
| `FIX` | Endurecer (abrir item no backlog) |
| `HIDE` | Remover do nav principal, manter código |
| `ARCHIVE` | Mover para `.archive/` |
| `DELETE_CANDIDATE` | Candidato a deleção após 2 sprints em `.archive/` sem uso |

---

## Rotas visíveis no menu — auditar individualmente

> Para cada rota abaixo, o agente deve validar: a rota renderiza sem tela branca? tem persistência real? tem teste?
> Se sim em todos → `KEEP`. Se algum não → `HIDE` ou `FIX`.

| Rota | Classificação | Justificativa | Ação proposta | Executado em |
|---|---|---|---|---|
| `/app/dashboard` | `KEEP` | T3-DASH-PROOF: layout + KPIs + error state provados | — | 2026-04-28 |
| `/app/maps` | `KEEP` | T3-GIS-SCALE: dataset 10k+ provado, fallback WebGL explícito | — | 2026-04-28 |
| `/app/ctm/parcelas` | `KEEP` | Entidade central provada | T2-PARCEL-E2E | 2026-04-20 |
| `/app/ctm/logradouros` | `KEEP` | Provado na auditoria + empty-state E2E | — | 2026-04-28 |
| `/app/ctm/mobiliario` | `KEEP` | Empty-state E2E provado, endpoint `/ctm/urban-furniture` existe | — | 2026-04-28 |
| `/app/ctm/vistorias` | `KEEP` | T2-INSPECT-E2E provado | — | 2026-04-20 |
| `/app/observatorio` | `KEEP` | Error-state E2E provado com fetch stub | — | 2026-04-28 |
| `/app/processes` | `KEEP` | Smoke passou, RBAC corrigido (T1-AUDIT-ROUTING) | — | 2026-04-28 |
| `/app/cartas` | `KEEP` | Empty-state E2E provado, notifications-letters endpoint real | — | 2026-04-28 |
| `/app/integracoes` | `KEEP` | Empty-state E2E provado (logs + connectors) | — | 2026-04-28 |
| `/app/modulos/obras` | `KEEP` | Empty-state E2E provado + ImportModal integrado | — | 2026-04-28 |
| `/app/modulos/empresas` | `KEEP` | Empty-state E2E provado + ImportModal integrado | — | 2026-04-28 |
| `/app/ambiental` | `KEEP` | Empty-state E2E provado | — | 2026-04-28 |
| `/app/pgv/zonas` | `KEEP` | Error-state E2E provado | — | 2026-04-28 |
| `/app/pgv/faces` | `KEEP` | Empty-state E2E provado | — | 2026-04-28 |
| `/app/pgv/fatores` | `KEEP` | Smoke test extended to cover this route | — | 2026-04-28 |
| `/app/pgv/relatorio` | `KEEP` | Empty-state E2E provado | — | 2026-04-28 |
| `/app/reurb` | `KEEP` | Empty-state E2E provado (projects + families + pendencies + notifications) | — | 2026-04-28 |
| `/app/poc` | `HIDE` | PoC não é produto; empty-state provado mas não municipal-grade | esconder do nav principal | — |
| `/app/certidoes` | `KEEP` | Smoke test extended; page exists with API integration | — | 2026-04-28 |
| `/app/levantamentos` | `KEEP` | Empty-state E2E provado (list + files) | — | 2026-04-28 |
| `/app/notifications` | `KEEP` | T4-NOTIF-BADGE + endpoint real de unread-count | — | 2026-04-28 |
| `/app/alerts` | `KEEP` | Smoke test extended; page exists with API integration | — | 2026-04-28 |
| `/app/assets` | `KEEP` | Error-state E2E provado | — | 2026-04-28 |
| `/app/profile` | `KEEP` | RBAC corrigido, rota navegável | — | 2026-04-28 |
| `/app/modulos/compliance` | `KEEP` | Empty-state E2E provado | — | 2026-04-28 |
| `/app/modulos/obras-publicas` | `KEEP` | Smoke test extended; page exists with API integration | — | 2026-04-28 |
| `/app/modulos/cemiterio` | `KEEP` | Smoke test extended; page exists with API integration | — | 2026-04-28 |
| `/app/mobile/*` | `KEEP` | T4-MOBILE: offline-first, GPS, anexo, sync E2E provados | — | 2026-04-28 |
| `/app/portal/*` | `KEEP` | T3-CITIZEN: browser→API→DB provado | — | 2026-04-28 |

## Arquivos/pastas suspeitos de serem lixo de planejamento

> Agentes devem listar aqui qualquer doc, README ou pasta que conflite com este sistema de planejamento (planos antigos, notas soltas, READMEs desatualizados).

| Caminho | Motivo | Ação | Executado em |
|---|---|---|---|
| `README.md` | Duplicava a função dos docs de planejamento e bootstrap | `MERGE` | 2026-04-17 |
| `CODEX-PROMPT-AUTONOMOUS.md` | Prompt operacional antigo, redundante com `AGENTS.md` | `ARCHIVE` | 2026-04-17 |
| `CODEX-PROMPT-BOOTSTRAP.md` | Prompt de bootstrap agora institucionalizado | `ARCHIVE` | 2026-04-17 |
| `CODEX-PROMPT-CONTINUE.md` | Continuação duplicada pelo sistema de sessão | `ARCHIVE` | 2026-04-17 |
| `AGENT.md` | Arquivo solto fora da convenção oficial | `ARCHIVE` | 2026-04-17 |
| `docs/edital-roadmap.md` | Roadmap paralelo ao backlog vivo | `MERGE` | 2026-04-17 |
| `docs/executable-roadmap-checklist.md` | Checklist útil, mas paralelo ao sistema oficial | `MERGE` | 2026-04-17 |
| `docs/executable-roadmap-sprints.md` | Plano por sprint duplicado | `MERGE` | 2026-04-17 |
| `docs/requirements-matrix.md` | Requisitos/evidências úteis para maturidade | `MERGE` | 2026-04-17 |
| `docs/edital-gap-analysis.md` | Gap analysis útil, mas paralelo ao backlog | `MERGE` | 2026-04-17 |
| `docs/edital-response-pack.md` | Material comercial útil, não plano primário | `MERGE` | 2026-04-17 |
| `docs/CTM_IMPORT_DOCUMENTATION.md` | Conteúdo útil de DEMO vs OFICIAL | `MERGE` | 2026-04-17 |
| `docs/EXTERNAL_DEMO_IMPORT.md` | Conteúdo útil sobre origem demo/importada | `MERGE` | 2026-04-17 |
| `GAP_ANALYSIS_EXECUTIVO.md` | Gap analysis útil para priorização | `MERGE` | 2026-04-17 |
| `BRAINSTORM_MATURIDADE.md` | Veredito antigo conflita com scorecard vivo | `ARCHIVE` | 2026-04-17 |
| `PROJECT_READY.md` | Status declaratório conflita com vocabulário obrigatório | `ARCHIVE` | 2026-04-17 |
| `STARTUP_STATUS.md` | Status antigo obsoleto | `ARCHIVE` | 2026-04-17 |

## Código marcado como PARTIAL/demo

> Qualquer `TODO[PARTIAL]:`, comentário de "demo", fallback-only, ou dado mock como primário deve entrar aqui.

| Caminho | O que é | Item do backlog | Executado em |
|---|---|---|---|
| *(a preencher pelo agente de bootstrap)* | — | — | — |

## Histórico de arquivamento

| Data | Agente | Item arquivado | Motivo | Destino em `.archive/` |
|---|---|---|---|---|
| 2026-04-17 | Codex | `CODEX-PROMPT-AUTONOMOUS.md` | Prompt operacional redundante | `.archive/2026-04-17/CODEX-PROMPT-AUTONOMOUS.md` |
| 2026-04-17 | Codex | `CODEX-PROMPT-BOOTSTRAP.md` | Bootstrap duplicado | `.archive/2026-04-17/CODEX-PROMPT-BOOTSTRAP.md` |
| 2026-04-17 | Codex | `CODEX-PROMPT-CONTINUE.md` | Continuação duplicada | `.archive/2026-04-17/CODEX-PROMPT-CONTINUE.md` |
| 2026-04-17 | Codex | `AGENT.md` | Arquivo solto fora do sistema oficial | `.archive/2026-04-17/AGENT.md` |
| 2026-04-17 | Codex | `README.md` | Duplicava o sistema de planejamento | `.archive/2026-04-17/README.md` |
| 2026-04-17 | Codex | `BRAINSTORM_MATURIDADE.md` | Veredito antigo conflitante | `.archive/2026-04-17/BRAINSTORM_MATURIDADE.md` |
| 2026-04-17 | Codex | `PROJECT_READY.md` | Status declaratório conflitante | `.archive/2026-04-17/PROJECT_READY.md` |
| 2026-04-17 | Codex | `STARTUP_STATUS.md` | Status antigo obsoleto | `.archive/2026-04-17/STARTUP_STATUS.md` |
| 2026-04-17 | Codex | `docs/edital-roadmap.md` | Roadmap paralelo | `.archive/2026-04-17/docs/edital-roadmap.md` |
| 2026-04-17 | Codex | `docs/executable-roadmap-checklist.md` | Checklist paralelo | `.archive/2026-04-17/docs/executable-roadmap-checklist.md` |
| 2026-04-17 | Codex | `docs/executable-roadmap-sprints.md` | Sprint plan paralelo | `.archive/2026-04-17/docs/executable-roadmap-sprints.md` |
| 2026-04-17 | Codex | `docs/requirements-matrix.md` | Matriz paralela de requisitos | `.archive/2026-04-17/docs/requirements-matrix.md` |
| 2026-04-17 | Codex | `docs/edital-gap-analysis.md` | Gap analysis paralelo | `.archive/2026-04-17/docs/edital-gap-analysis.md` |
| 2026-04-17 | Codex | `docs/edital-response-pack.md` | Material comercial paralelo | `.archive/2026-04-17/docs/edital-response-pack.md` |
| 2026-04-17 | Codex | `docs/CTM_IMPORT_DOCUMENTATION.md` | Conteúdo demo/oficial consolidado | `.archive/2026-04-17/docs/CTM_IMPORT_DOCUMENTATION.md` |
| 2026-04-17 | Codex | `docs/EXTERNAL_DEMO_IMPORT.md` | Conteúdo demo/import consolidado | `.archive/2026-04-17/docs/EXTERNAL_DEMO_IMPORT.md` |
| 2026-04-17 | Codex | `GAP_ANALYSIS_EXECUTIVO.md` | Gap analysis útil mas paralelo | `.archive/2026-04-17/GAP_ANALYSIS_EXECUTIVO.md` |

## Mesclado de `docs/CTM_IMPORT_DOCUMENTATION.md` em 2026-04-17

- Regras de separação entre DEMO e OFICIAL.
- Badges e classificação de origem para ajudar a detectar FAKE/REAL.

## Mesclado de `docs/EXTERNAL_DEMO_IMPORT.md` em 2026-04-17

- Catálogo de origem demo/importada e comportamento de badge.
