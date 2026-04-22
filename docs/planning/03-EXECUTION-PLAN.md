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
- `T4-ENV-DOCKER` entrou em `DONE`: o compose de desenvolvimento foi reconstruído após limpeza controlada do host Docker, `api-dev` e `web-dev` sobem juntos e o Next responde no container sem `/_next/static/chunks` 404 na prova browser.
- O fluxo de execução continua no sprint atual do produto; esta camada meta só torna o arranque e a persistência automáticos.

## Em execução agora

| Item | Agente | Iniciado em | Nota |
|---|---|---|---|
| T4-PARCEL-GRAPH | Codex | 2026-04-21 | Parcel summary backend plus parcel detail browser proof for history, vistorias, IPTU, and PDF export are covered; cross-module graph still incomplete. |
| T4-AUDIT | Codex | 2026-04-21 | Parcel audit repository plus controller/service audit smoke and the `/app/auditoria` page now have tenant-isolation coverage; browser and service tests pass after locator fix, and the notification badge now has a real endpoint and routes to `/app/cartas`, but the broader audit trail remains pending. |
| T4-MOBILE | Codex | 2026-04-21 | Mobile page now has offline-first browser proof for field controls and queue visibility; capture/sync flow still pending. |
| T3-IMPORT-PROOF | Codex | 2026-04-20 | GeoJSON import proved with rollback-on-error check; broader import surfaces remain TODO. |
| T3-GIS-SCALE | Codex | 2026-04-20 | Large dataset, shared bounds helper, and fallback explicit in WebGL-free runner are covered, but the real map render still depends on the environment. |

## Próximos na fila (ordem de ataque)

1. **T2-PARCEL-E2E** — DONE (search → detail → edit → persist verified; `T4-PARCEL-GRAPH` now also has parcel summary and parcel detail browser proof for history, vistorias, IPTU, and PDF export).
2. **T2-INSPECT-E2E** — DONE (create → status → history → link to parcel confirmed).
3. **T2-TAX-INTEG** — DONE (dashboard/read-model coherence proven).
4. **T2-REPORTS** — DONE (PDF endpoint real; click + bytes validated).
5. **T4-AUDIT** — PARTIAL (tenant-isolated `ParcelAuditRepository` filters and counts plus the `getAuditLog` service/controller smoke and `/app/auditoria` browser navigation are now proved; the notification badge now has a real endpoint and opens `/app/cartas`, the Docker `web-dev` path is now proved, but the broader audit trail remains pending).
6. **T4-MOBILE** — PARTIAL (offline-first browser proof for field controls and queue visibility is in place; capture/sync flow still pending).
7. **T3-GIS-SCALE** — PARTIAL (dataset >10k, shared bounds helper, explicit fallback, `GeometryService` coverage for `MultiPolygon`/malformed geometry, and `computeGeometryBounds` coverage for `MultiPolygon`/empty geometry proved; real WebGL render still blocked by runner environment).
8. **T3-EMPTY-STATES** — PARTIAL (assets, logradouros, pgv/zonas, pgv/faces, ctm/mobiliario, ctm/parcelas, ctm/parcelas/:id, ctm/parcelas/:id/infraestrutura, 156, ctm/vistorias, ambiental, levantamentos, modulos/compliance, cartas, pgv/relatorio, integracoes logs/connectors, reurb projects/families/units/pendencies/deliverables/notifications, monitoramento, modulos/obras, modulos/empresas, and poc error/empty states proved; auditoria was dropped because the current route resolves to a dashboard snapshot instead of the target audit screen; broader module coverage still pending).
9. **T3-DASH-PROOF** — PARTIAL (layout persistence plus `/dashboard/kpis`, `/dashboard/executive`, visible KPI cards, backend contract coverage in `DashboardService`, and filtered dashboard coverage in `MonitoringService` are proved; broader observability coverage still pending).

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
- `T4-ENV-DOCKER` ficou `DONE`; o Docker de desenvolvimento voltou a subir com `web-dev` e `api-dev` juntos, e a prova browser não registrou `/_next/static/chunks` 404.
- A próxima sessão deve retomar pelo topo do backlog vivo, com o brain carregado automaticamente pelos hooks nativos sempre que a ferramenta permitir.
