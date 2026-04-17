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
| T2-PARCEL-E2E | Codex | 2026-04-17 | Próximo após fechar T1; busca, detalhe e update da parcela. |

## Próximos na fila (ordem de ataque)

1. **T1-DEVSERVER** — destravar a base antes de tudo.
2. **T1-HYDRATION** — fechado nesta sessão.
3. **T1-ROUTE-PROOF** — fechado nesta sessão.
4. **T2-PARCEL-E2E** — próximo.
5. **T2-INSPECT-E2E** — paralelo a T2-TAX-INTEG após PARCEL-E2E.

## Bloqueios atuais

| Item | Bloqueado por | Desde | Responsável |
|---|---|---|---|
| T1-DEVSERVER | Docker/Colima indisponível neste ambiente | 2026-04-17 | Codex / Paulo |
| T1-ROUTE-PROOF | Conclusão do inventário de rotas e prova de hidratação | 2026-04-17 | Codex |

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
