# 03 — Execution Plan

> Estado **vivo** do que está sendo executado agora.
> Atualize ao iniciar e ao encerrar cada sessão.

---

## Sprint atual

**Janela:** `2026-04-17 → 2026-05-01` (primeiro sprint pós-bootstrap)
**Foco:** T1 completo (Survival / credibility blockers)
**Objetivo de sprint:** Chegar ao final com `T1-ROUTE-PROOF`, `T1-HYDRATION`, `T1-DEVSERVER` em `DONE`.

## Em execução agora

| Item | Agente | Iniciado em | Nota |
|---|---|---|---|
| T1-DEVSERVER | Claude | 2026-04-17 (retomado) | Docker/Colima operational. Fixed verify-clean script (skip host build, let docker rebuild). Running rebuild now; API + migrate healthchecks OK. Smoke test can execute. |

## Próximos na fila (ordem de ataque)

1. **T1-DEVSERVER** — PARTIAL (Docker disponível; faltam os endpoints internos da migração).
2. **T1-HYDRATION** — ✓ DONE (2026-04-17).
3. **T1-ROUTE-PROOF** — ✓ DONE (2026-04-17).
4. **T2-PARCEL-E2E** — IN_PROGRESS (test written; awaiting exec).
5. **T2-INSPECT-E2E** — IN_PROGRESS (E2E + integration tests written).
6. **T2-TAX-INTEG** — IN_PROGRESS (E2E test written).
7. **T2-REPORTS** — IN_PROGRESS (E2E test written).

## Bloqueios atuais

| Item | Bloqueado por | Desde | Responsável | Status |
|---|---|---|---|---|
| T1-DEVSERVER | Migrate ainda falha em endpoints internos do compose | 2026-04-17 | Codex | Partial; Docker/Colima OK, smoke ainda não fechou |
| T2-PARCEL-E2E (exec) | E2E infra (backend/frontend not accessible) | 2026-04-17 | — | Tests written; awaiting infra |
| T2-INSPECT-E2E (exec) | E2E infra | 2026-04-17 | — | Tests written; awaiting infra |
| T2-TAX-INTEG (exec) | E2E infra | 2026-04-17 | — | Tests written; awaiting infra |
| T2-REPORTS (exec) | E2E infra | 2026-04-17 | — | Tests written; awaiting infra |

## Decisões arquiteturais pendentes (precisam do Paulo)

- [ ] Definir se rotas sem prova saem do nav principal ou do repo (hide vs archive).
- [ ] Definir stack oficial de E2E (Playwright é o implícito — confirmar).
- [ ] Definir dataset real vs sintético para teste de GIS em escala (T3-GIS-SCALE).
- [ ] Definir critério de "dataset de teste" para T3-IMPORT-PROOF.

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
- A próxima sessão deve retomar pelo topo do backlog vivo, sem depender dos docs antigos.
