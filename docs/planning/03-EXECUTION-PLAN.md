# 03 — Execution Plan

> Estado **vivo** do que está sendo executado agora.
> Atualize ao iniciar e ao encerrar cada sessão.

---

## Sprint atual

**Janela:** `2026-04-17 → 2026-05-01` (primeiro sprint pós-bootstrap)
**Foco:** T1 completo (Survival / credibility blockers)
**Objetivo de sprint:** Chegar ao final com `T1-ROUTE-PROOF`, `T1-HYDRATION`, `T1-DEVSERVER` em `DONE`.

## Meta work completed

- `T4-BRAIN-OS` entrou em `DONE`: o brain agora faz auto-discovery do projeto, bootstrap de sessão e write-back de memória sem setup manual.
- `T4-HOOKS-OS` entrou em `DONE`: Claude Code e Codex passam a acionar bootstrap/write-back por hooks nativos; Gemini e app/workspace flows têm launcher/instruções de entrada apontando para o brain.
- O fluxo de execução continua no sprint atual do produto; esta camada meta só torna o arranque e a persistência automáticos.

## Em execução agora

| Item | Agente | Iniciado em | Nota |
|---|---|---|---|
| T3-IMPORT-PROOF | Codex | 2026-04-20 | GeoJSON import proved with rollback-on-error check; broader import surfaces remain TODO. |
| T3-CITIZEN | Codex | 2026-04-21 | Public request, backend list, and browser proof are now complete in the 156 workspace. |
| T3-GIS-SCALE | Codex | 2026-04-20 | Large dataset, shared bounds helper, and fallback explicit in WebGL-free runner are covered, but the real map render still depends on the environment. |

## Próximos na fila (ordem de ataque)

1. **T2-PARCEL-E2E** — DONE (search → detail → edit → persist verified).
2. **T2-INSPECT-E2E** — DONE (create → status → history → link to parcel confirmed).
3. **T2-TAX-INTEG** — DONE (dashboard/read-model coherence proven).
4. **T2-REPORTS** — DONE (PDF endpoint real; click + bytes validated).
5. **T3-GIS-SCALE** — PARTIAL (dataset >10k, shared bounds helper, and explicit fallback proved; real WebGL render still blocked by runner environment).
6. **T3-EMPTY-STATES** — PARTIAL (assets, logradouros, pgv/zonas, pgv/faces, ctm/mobiliario, ctm/parcelas, ctm/parcelas/:id, ctm/parcelas/:id/infraestrutura, 156, ctm/vistorias, ambiental, levantamentos, modulos/compliance, cartas, pgv/relatorio, integracoes logs/connectors, reurb projects/families/units/pendencies/deliverables, monitoramento, modulos/obras, modulos/empresas, and poc error/empty states proved; auditoria was dropped because the current route resolves to a dashboard snapshot instead of the target audit screen; broader module coverage still pending).
7. **T3-DASH-PROOF** — PARTIAL (layout persistence plus `/dashboard/kpis`, `/dashboard/executive`, and visible KPI cards are proved; broader observability coverage still pending).
8. **T3-IMPORT-PROOF** — DONE (GeoJSON import proved with invalid payload not changing totals).
9. **T3-CITIZEN** — DONE (public create, backend list, and browser proof complete in the 156 workspace).

## Bloqueios atuais

| Item | Bloqueado por | Desde | Responsável | Status |
|---|---|---|---|---|
| T1-DEVSERVER | Cold start do compose podia expirar antes do health | 2026-04-20 | Codex | DONE; Colima ativo, compose up e /health OK |
| T2-PARCEL-E2E (exec) | E2E infra (backend/frontend not accessible) | 2026-04-17 | — | Tests written; awaiting infra |
| T2-INSPECT-E2E (exec) | E2E infra | 2026-04-17 | — | DONE; create/status/history/link proved |
| T2-TAX-INTEG (exec) | E2E infra | 2026-04-17 | — | DONE; dashboard and parcel stats match |
| T2-REPORTS (exec) | E2E infra | 2026-04-17 | — | DONE; PDF bytes validated after UI click |

## Decisões arquiteturais pendentes (precisam do Paulo)

- [ ] Definir se rotas sem prova saem do nav principal ou do repo (hide vs archive).
- [ ] Definir stack oficial de E2E (Playwright é o implícito — confirmar).
- [ ] Definir dataset real vs sintético para teste de GIS em escala (T3-GIS-SCALE).
- [ ] Definir critério de "dataset de teste" para T3-IMPORT-PROOF.
- [x] `T3-CITIZEN` já saiu do eixo de blocos; próxima prioridade volta para o backlog de T3/T4.

## Check-in de final de sprint (preencher em 2026-05-01)

- Itens entregues:
- Itens movidos para próximo sprint:
- Mudanças na matriz de maturidade:
- Decisões tomadas:
- Lições aprendidas:

---

## Mesclado de `docs/executable-roadmap-sprints.md` em 2026-04-17

- Sprint 0: estabilização da base bootável e testável.
- Sprint 1: confiança institucional, handoff e prova de RBAC/sessão.
- Objetivo útil para refinar ordem do sprint atual sem criar um roadmap paralelo.

## Fechamento desta sessão

- Arquivos conflitantes foram classificados, mesclados ou arquivados.
- A próxima sessão deve retomar pelo topo do backlog vivo, com o brain carregado automaticamente pelos hooks nativos sempre que a ferramenta permitir.
