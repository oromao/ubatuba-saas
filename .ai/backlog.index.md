# Backlog Index — FlyDea (Harness)

> Este índice conecta o harness `.ai/` ao sistema de planejamento `docs/planning/`.
> Backlog detalhado em `docs/planning/02-BACKLOG.md`.
> Plano de execução em `docs/planning/03-EXECUTION-PLAN.md`.

## Domínios Prioritários (GovTech)

| Prioridade | Domínio | Descrição |
|---|---|---|
| T0 | Planning Hygiene | Estrutura, docs, testes |
| T1 | Core Domain | GIS, parcel, map, cadastre |
| T2 | Taxation | IPTU, PGV, fiscal |
| T3 | Licensing | Alvará, licenças, processos |
| T4 | Cross-cutting | Auth, multi-tenant, logging, monitoring |

## Sprint Atual

- **Sprint:** Harness Port (fundação)
- **Status:** Harness REAL — bus + queues operacionais, 17 testes passando
- **Próxima:** Domain Core (GIS + parcel)

## Pontos de Conexão

| .ai/ | docs/planning/ | Status |
|---|---|---|
| `backlog.index.md` | `02-BACKLOG.md` | ✅ Link ativo |
| `bus pipeline runs` | `03-EXECUTION-PLAN.md` | ✅ Bridge via planning-bridge.sh |
| `bus agent heartbeats` | `11-ACTIVE-LOCKS.md` | ✅ Bridge via planning-bridge.sh |
| `bus events` | `04-PROGRESS-SUMMARY.md` | ✅ Bridge via planning-bridge.sh |

## Pendentes

- [ ] Refinar OKRs para GovTech
- [ ] Pipeline de CI/CD via message bus
