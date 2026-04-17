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
| *(a preencher pelo agente de bootstrap)* | — | — | — |

## Código marcado como PARTIAL/demo

> Qualquer `TODO[PARTIAL]:`, comentário de "demo", fallback-only, ou dado mock como primário deve entrar aqui.

| Caminho | O que é | Item do backlog | Executado em |
|---|---|---|---|
| *(a preencher pelo agente de bootstrap)* | — | — | — |

## Histórico de arquivamento

| Data | Agente | Item arquivado | Motivo | Destino em `.archive/` |
|---|---|---|---|---|
| — | — | — | — | — |
