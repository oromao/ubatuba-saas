# 02 — Backlog Priorizado

> Backlog organizado por tier de prioridade. Status vivo. Atualize ao final de cada sessão.
> Formato de ID: `T<tier>-<slug>` (ex.: `T1-ROUTE-PROOF`).

---

## Legenda de status

| Status | Significado |
|---|---|
| `TODO` | Não iniciado |
| `IN_PROGRESS` | Em execução (indicar agente) |
| `BLOCKED` | Bloqueado (indicar motivo) |
| `PARTIAL` | Funciona em parte, mas sem prova completa — não conta como DONE |
| `DONE` | Provado por teste automatizado + revisão do Paulo |
| `DROPPED` | Descartado (indicar razão) |

## Legenda de severidade

`CRITICAL` > `HIGH` > `MEDIUM` > `LOW`

## Legenda de esforço

`S` = 1-3 dias · `M` = 3-10 dias · `L` = 10-20 dias · `XL` = >20 dias

---

## 🟥 T1 — Survival / credibility blockers

*Enquanto T1 não estiver DONE, nada novo entra. Ponto.*

### T1-ROUTE-PROOF — Provar toda rota de menu ou escondê-la
- **Status:** `TODO`
- **Severidade:** CRITICAL · **Esforço:** M · **Tipo:** Product / QA / UX
- **Problema:** Rotas visíveis no menu não são uniformemente provadas.
- **DoD:** Todo item do menu passa smoke/E2E OU é removido do nav primário (movido para `.archive/nav/`).
- **Validação:** `pnpm test:e2e:menu-smoke` verde para cada rota.
- **Depende de:** T1-HYDRATION, T1-DEVSERVER.
- **Agente:** —

### T1-HYDRATION — Estabilizar hidratação e impedir tela branca
- **Status:** `TODO`
- **Severidade:** CRITICAL · **Esforço:** M · **Tipo:** Frontend / UX
- **Problema:** Algumas páginas ficam presas em "Carregando sessão institucional..." ou em estados de loader ambíguos.
- **DoD:** Toda rota ou exibe conteúdo estável em <3s, ou mostra estado de `empty`/`error` explícito com ação.
- **Validação:** E2E que navega o menu inteiro e falha se encontrar loader persistente por >3s.
- **Depende de:** —
- **Agente:** —

### T1-DEVSERVER — Eliminar fragilidade de dev server / cache
- **Status:** `TODO`
- **Severidade:** CRITICAL · **Esforço:** S-M · **Tipo:** Infra / DevEx
- **Problema:** Cache do Next.js produz chunks 500 que mascaram erros reais de rota.
- **DoD:** Script `pnpm verify:clean` roda start limpo + smoke e retorna 0 em CI de forma reprodutível.
- **Validação:** 5 execuções consecutivas em CI sem flake.
- **Depende de:** —
- **Agente:** —

---

## 🟧 T2 — Robustness / municipal operation

### T2-PARCEL-E2E — Provar parcel search/detail/update ponta a ponta
- **Status:** `TODO`
- **Severidade:** CRITICAL · **Esforço:** M-L · **Tipo:** Backend / Frontend / Tests
- **DoD:** Usuário busca parcela → abre detalhe → edita campo → persiste → recarrega → valor persistido.
- **Validação:** E2E Playwright + integração API.
- **Depende de:** T1 inteiro.

### T2-INSPECT-E2E — Provar ciclo de vistoria ponta a ponta
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** Backend / Frontend / Tests
- **DoD:** Criar vistoria → transicionar status → vincular à parcela → persistir → visível no histórico.
- **Validação:** E2E + integração.
- **Depende de:** T2-PARCEL-E2E.

### T2-TAX-INTEG — Provar integração tributária e coerência do read model
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** Backend / Tests
- **DoD:** Dado tributário persistido → lido → refletido no dashboard + detalhe da parcela com coerência.
- **Validação:** Integração + smoke de dashboard.
- **Depende de:** T2-PARCEL-E2E.

### T2-REPORTS — Provar geração de relatórios/PDFs em workflow real
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** Backend / Frontend / Tests
- **DoD:** Gerar / abrir / baixar PDF válido em fluxo real (certidão, relatório, notificação).
- **Validação:** E2E + inspeção binária do PDF.
- **Depende de:** T2-PARCEL-E2E.

---

## 🟨 T3 — Maturity / competitive parity

### T3-GIS-SCALE — Robustecer comportamento operacional do GIS em escala
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** GIS / Frontend / Performance
- **DoD:** Mapa estável com dataset real grande (>10k geometrias), overlays, fitBounds sem quebrar, clustering funcional.
- **Validação:** E2E + smoke de performance.

### T3-EMPTY-STATES — Padronizar empty/error states em todos os módulos
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** UX
- **DoD:** Zero tela branca. Todo módulo tem empty state desenhado + error state com ação.
- **Validação:** Testes de componente + smoke.

### T3-DASH-PROOF — Expandir prova do dashboard/observatório
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Frontend / Backend
- **DoD:** KPIs estáveis, layout persistido, fonte de dados real e auditável.
- **Validação:** Integração + smoke.

### T3-IMPORT-PROOF — Provar importações (GeoJSON / CSV / base externa)
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Backend / Tests
- **DoD:** Importação de base real validada com dataset de teste, rollback em caso de erro.

### T3-CITIZEN — Provar fluxos de portal cidadão
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Frontend / Backend / Tests
- **DoD:** Cidadão abre solicitação → backend recebe → operador responde → cidadão vê status.

---

## 🟩 T4 — Differentiation / leadership

### T4-PARCEL-GRAPH — Conectar parcela-mapa-tributo-vistoria como grafo único de verdade
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** Product / Domain / Backend
- **DoD:** Uma parcela é a fonte única de verdade em todos os módulos. Abrir no mapa → clicar → ver tributo + vistorias + relatórios sem inconsistência.
- **Validação:** E2E cross-module.

### T4-MOBILE — Melhorar prova de operação mobile/campo
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** L · **Tipo:** Mobile / UX
- **DoD:** Fluxos de vistoria usáveis em campo com conectividade instável.

### T4-AUDIT — Elevar confiança de auditoria e isolamento multi-tenant
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** M-L · **Tipo:** Security / Backend / Tests
- **DoD:** Trilha de auditoria clara + testes de isolamento de tenant passando.

---

## Mesclado de `PROXIMAS_20_ACOES_PRIORITARIAS.md` em 2026-04-17

Plano antigo consolidado neste backlog para evitar divergência de fonte.

- Ações de validação e navegação viraram prioridade T1/T2 já refletida neste arquivo.
- Fluxos de vistoria, dashboard, PDF e validações de negócio devem ser tratados como itens T2 com prova automatizada.
- Itens de workflow, histórico e IPTU/integração ficam como base para refinamento de T2/T3 conforme prova real aparecer.
- Ações de mobile, performance, documentação e preparação de demo entram como sustentação de T3/T4 ou como notas em execução/maturidade.
- A tabela antiga de esforço/sprint pode ser usada como referência histórica, mas o backlog vivo é este arquivo.

---

## Histórico de mudanças

| Data | Agente | Item | Ação |
|---|---|---|---|
| 2026-04-17 | Claude (bootstrap) | — | Backlog inicial a partir da auditoria |
