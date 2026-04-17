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
| — | — | — | Nenhum item em execução ainda. Primeiro agente que pegar o projeto deve começar por `T1-DEVSERVER` (é pré-requisito para os outros). |

## Próximos na fila (ordem de ataque)

1. **T1-DEVSERVER** — destravar a base antes de tudo.
2. **T1-HYDRATION** — sem isso, não dá para provar rota.
3. **T1-ROUTE-PROOF** — depende dos dois acima.
4. **T2-PARCEL-E2E** — entra quando T1 fechar.
5. **T2-INSPECT-E2E** — paralelo a T2-TAX-INTEG após PARCEL-E2E.

## Bloqueios atuais

| Item | Bloqueado por | Desde | Responsável |
|---|---|---|---|
| — | — | — | — |

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
