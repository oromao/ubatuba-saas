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
| `/app/dashboard` | `KEEP?` | Dashboard é crítico, precisa provar | T3-DASH-PROOF | — |
| `/app/maps` | `KEEP?` | Core do produto | T3-GIS-SCALE | — |
| `/app/ctm/parcelas` | `KEEP?` | Entidade central | T2-PARCEL-E2E | — |
| `/app/ctm/logradouros` | `KEEP` | Provado na auditoria | — | — |
| `/app/ctm/mobiliario` | `TBD` | Não provado | validar ou HIDE | — |
| `/app/ctm/vistorias` | `KEEP?` | T2-INSPECT-E2E | provar ou HIDE | — |
| `/app/observatorio` | `FIX` | Usa persistência local demo | trocar para real ou marcar PARTIAL | — |
| `/app/processes` | `TBD` | Não provado | validar ou HIDE | — |
| `/app/cartas` | `TBD` | Não provado | validar ou HIDE | — |
| `/app/integracoes` | `TBD` | Não provado | validar ou HIDE | — |
| `/app/modulos/obras` | `TBD` | Não provado | validar ou HIDE | — |
| `/app/modulos/empresas` | `TBD` | Não provado | validar ou HIDE | — |
| `/app/ambiental` | `TBD` | Não provado | validar ou HIDE | — |
| `/app/pgv/zonas` | `TBD` | Provado parcialmente em backend | validar UI | — |
| `/app/pgv/faces` | `TBD` | idem | validar | — |
| `/app/pgv/fatores` | `TBD` | idem | validar | — |
| `/app/pgv/relatorio` | `TBD` | idem | validar | — |
| `/app/reurb` | `TBD` | Backend existe | validar UI | — |
| `/app/poc` | `ARCHIVE?` | "poc" é prova de conceito, não produto | archive a menos que justificado | — |
| `/app/certidoes` | `TBD` | T2-REPORTS toca aqui | validar | — |
| `/app/levantamentos` | `TBD` | — | validar | — |
| `/app/notifications` | `TBD` | — | validar | — |
| `/app/alerts` | `TBD` | — | validar | — |
| `/app/assets` | `TBD` | — | validar | — |
| `/app/profile` | `KEEP?` | Básico | validar | — |
| `/app/modulos/compliance` | `TBD` | — | validar | — |
| `/app/modulos/obras-publicas` | `TBD` | — | validar | — |
| `/app/modulos/cemiterio` | `TBD` | — | validar | — |
| `/app/mobile/*` | `FIX` | T4-MOBILE | provar ou HIDE | — |
| `/app/portal/*` | `TBD` | T3-CITIZEN | validar | — |

## Arquivos/pastas suspeitos de serem lixo de planejamento

> Agentes devem listar aqui qualquer doc, README ou pasta que conflite com este sistema de planejamento (planos antigos, notas soltas, READMEs desatualizados).

| Caminho | Motivo | Ação | Executado em |
|---|---|---|---|
| `PROXIMAS_20_ACOES_PRIORITARIAS.md` | Plano antigo sobreposto pelo backlog vivo | `ARCHIVE` | 2026-04-17 |
| `CODEX-PROMPT-BOOTSTRAP.md` | Prompt pontual substituído pelo sistema persistente | `ARCHIVE` | 2026-04-17 |
| `README.md` | Duplica regras e visão já cobertas por `AGENTS.md`/`docs/planning/` | `KEEP_BUT_FLAG` | 2026-04-17 |
| `docs/CTM_IMPORT_DOCUMENTATION.md` | Documento útil, mas reforça narrativa DEMO/OFICIAL que precisa de rastreio | `KEEP_BUT_FLAG` | 2026-04-17 |
| `docs/EXTERNAL_DEMO_IMPORT.md` | Documento útil, mas trata base DEMO externa e precisa de nota de limpeza | `KEEP_BUT_FLAG` | 2026-04-17 |
| `apps/web/src/app/app/ctm/parcelas/page.tsx` | UI expõe badges/alertas DEMO que precisam permanecer sinalizados | `KEEP_BUT_FLAG` | 2026-04-17 |
| `apps/web/src/app/app/ctm/parcelas/[id]/page.tsx` | Badge DEMO no detalhe da parcela precisa de rastreio | `KEEP_BUT_FLAG` | 2026-04-17 |
| `apps/web/src/app/app/maps/map-view.tsx` | Popup do mapa marca DEMO/OFICIAL e é área sensível de classificação | `KEEP_BUT_FLAG` | 2026-04-17 |
| `apps/api/src/modules/ctm/parcels/parcels.service.ts` | Lógica ainda contém caminhos DEMO/sample como primários em partes do fluxo | `KEEP_BUT_FLAG` | 2026-04-17 |
| `apps/api/src/modules/ctm/parcels/parcel.schema.ts` | `sourceType` default DEMO requer nota de legado | `KEEP_BUT_FLAG` | 2026-04-17 |
| `apps/api/src/seed/demo-seed.ts` | Seed demonstrativo necessário, mas é fonte de dados não-oficiais | `KEEP_BUT_FLAG` | 2026-04-17 |
| `apps/api/test/parcels-import.spec.ts` | Teste usa fixtures DEMO como base e deve seguir marcado | `KEEP_BUT_FLAG` | 2026-04-17 |

## Código marcado como PARTIAL/demo

> Qualquer `TODO[PARTIAL]:`, comentário de "demo", fallback-only, ou dado mock como primário deve entrar aqui.

| Caminho | O que é | Item do backlog | Executado em |
|---|---|---|---|
| `apps/web/src/app/app/ctm/parcelas/page.tsx` | Badges e filtros de MODO DEMO / BASE DEMO | T2-PARCEL-E2E / T3-EMPTY-STATES | 2026-04-17 |
| `apps/web/src/app/app/ctm/parcelas/[id]/page.tsx` | Badge DEMO no detalhe de parcela | T2-PARCEL-E2E | 2026-04-17 |
| `apps/web/src/app/app/maps/map-view.tsx` | Popup e labels exibem DEMO/OFICIAL | T3-GIS-SCALE | 2026-04-17 |
| `apps/api/src/modules/ctm/parcels/parcels.service.ts` | Serviços ainda consideram DEMO como caminho operacional | T2-TAX-INTEG / T3-IMPORT-PROOF | 2026-04-17 |
| `apps/api/src/modules/ctm/parcels/parcel.schema.ts` | Default `sourceType = DEMO` | T3-IMPORT-PROOF | 2026-04-17 |
| `apps/api/src/seed/demo-seed.ts` | Seed de demonstração | T1-DEVSERVER / T3-IMPORT-PROOF | 2026-04-17 |
| `apps/api/test/parcels-import.spec.ts` | Fixtures com `sourceType: DEMO` | T3-IMPORT-PROOF | 2026-04-17 |

## Histórico de arquivamento

| Data | Agente | Item arquivado | Motivo | Destino em `.archive/` |
|---|---|---|---|---|
| 2026-04-17 | Codex | `PROXIMAS_20_ACOES_PRIORITARIAS.md` | Plano antigo consolidado no backlog e execução | `.archive/2026-04-17/PROXIMAS_20_ACOES_PRIORITARIAS.md` |
| 2026-04-17 | Codex | `CODEX-PROMPT-BOOTSTRAP.md` | Substituído pelo sistema persistente de planejamento | `.archive/2026-04-17/CODEX-PROMPT-BOOTSTRAP.md` |
