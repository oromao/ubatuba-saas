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
- **Status:** `DONE`
- **Severidade:** CRITICAL · **Esforço:** M · **Tipo:** Product / QA / UX
- **Problema:** Rotas visíveis no menu não são uniformemente provadas.
- **DoD:** Todo item do menu passa smoke/E2E OU é removido do nav primário (movido para `.archive/nav/`).
- **Validação:** `pnpm test:e2e:menu-smoke` verde para cada rota.
- **Depende de:** T1-HYDRATION, T1-DEVSERVER.
- **Agente:** —

### T1-HYDRATION — Estabilizar hidratação e impedir tela branca
- **Status:** `DONE`
- **Severidade:** CRITICAL · **Esforço:** M · **Tipo:** Frontend / UX
- **Problema:** Algumas páginas ficam presas em "Carregando sessão institucional..." ou em estados de loader ambíguos.
- **DoD:** Toda rota ou exibe conteúdo estável em <3s, ou mostra estado de `empty`/`error` explícito com ação.
- **Validação:** E2E que navega o menu inteiro e falha se encontrar loader persistente por >3s.
- **Depende de:** —
- **Agente:** —

### T1-DEVSERVER — Eliminar fragilidade de dev server / cache
- **Status:** `DONE`
- **Severidade:** CRITICAL · **Esforço:** S-M · **Tipo:** Infra / DevEx
- **Problema:** Cache do Next.js produz chunks 500 que mascaram erros reais de rota.
- **DoD:** Script `pnpm verify:clean` roda start limpo + smoke e retorna 0 em CI de forma reprodutível.
- **Validação:** 5 execuções consecutivas em CI sem flake.
- **Depende de:** —
- **Agente:** Codex (2026-04-20) — Colima active; `docker compose --profile dev up -d --build --remove-orphans` leaves api-dev, web-dev, mongodb, redis, minio and geoserver up; `http://localhost:4000/health` returns `ok`. `scripts/verify-clean.mjs` now waits longer for cold starts.

---

## 🟧 T2 — Robustness / municipal operation

### T2-PARCEL-E2E — Provar parcel search/detail/update ponta a ponta
- **Status:** `DONE`
- **Severidade:** CRITICAL · **Esforço:** M-L · **Tipo:** Backend / Frontend / Tests
- **DoD:** Usuário busca parcela → abre detalhe → edita campo → persiste → recarrega → valor persistido.
- **Validação:** E2E Playwright + integração API.
- **Depende de:** T1 inteiro.
- **Agente:** Codex (2026-04-20) — busca → detalhe → edição → persistência → reload provados; stats/list/map paths pass.

### T2-INSPECT-E2E — Provar ciclo de vistoria ponta a ponta
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** Backend / Frontend / Tests
- **DoD:** Criar vistoria → transicionar status → vincular à parcela → persistir → visível no histórico.
- **Validação:** E2E + integração.
- **Depende de:** T2-PARCEL-E2E.
- **Agente:** Codex (2026-04-20) — E2E confirmado: create → status → history → vínculo com parcela passou.

### T2-TAX-INTEG — Provar integração tributária e coerência do read model
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** Backend / Tests
- **DoD:** Dado tributário persistido → lido → refletido no dashboard + detalhe da parcela com coerência.
- **Validação:** Integração + smoke de dashboard.
- **Depende de:** T2-PARCEL-E2E.
- **Agente:** Codex (2026-04-20) — dashboard/executive and parcel statistics now match on IPTU totals.

### T2-REPORTS — Provar geração de relatórios/PDFs em workflow real
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** Backend / Frontend / Tests
- **DoD:** Gerar / abrir / baixar PDF válido em fluxo real (certidão, relatório, notificação).
- **Validação:** E2E + inspeção binária do PDF.
- **Depende de:** T2-PARCEL-E2E.
- **Agente:** Codex (2026-04-20) — PDF certificado provado em fluxo real com clique no detalhe da parcela + validação binária do PDF.

---

## 🟨 T3 — Maturity / competitive parity

### T3-GIS-SCALE — Robustecer comportamento operacional do GIS em escala
- **Status:** `PARTIAL`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** GIS / Frontend / Performance
- **DoD:** Mapa estável com dataset real grande (>10k geometrias), overlays, fitBounds sem quebrar, clustering funcional.
- **Validação:** E2E + smoke de performance.
- **Agente:** Codex (2026-04-20) — smoke/interação básica do mapa passaram e agora há prova de dataset >10k carregando com o mapa navegável; overlays em escala, fitBounds explícito e clustering ainda não foram provados.

### T3-EMPTY-STATES — Padronizar empty/error states em todos os módulos
- **Status:** `PARTIAL`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** UX
- **DoD:** Zero tela branca. Todo módulo tem empty state desenhado + error state com ação.
- **Validação:** Testes de componente + smoke.
- **Agente:** Codex (2026-04-20) — `assets`, `logradouros` e `pgv/zonas` agora mostram error state explícito com fallback testado; ainda faltam outros módulos do padrão.

### T3-DASH-PROOF — Expandir prova do dashboard/observatório
- **Status:** `PARTIAL`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Frontend / Backend
- **DoD:** KPIs estáveis, layout persistido, fonte de dados real e auditável.
- **Validação:** Integração + smoke.
- **Agente:** Codex (2026-04-20) — layout do dashboard agora persiste em reload via API + browser e a leitura executiva/sinais de prontidão estão provados contra o backend; ainda falta expandir a cobertura de observabilidade e KPIs satélite.

### T3-IMPORT-PROOF — Provar importações (GeoJSON / CSV / base externa)
- **Status:** `DONE`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Backend / Tests
- **DoD:** Importação de base real validada com dataset de teste, rollback em caso de erro.
- **Agente:** Codex (2026-04-20) — importação GeoJSON validada com batch real de teste e payload inválido sem alterar totais.

### T3-CITIZEN — Provar fluxos de portal cidadão
- **Status:** `PARTIAL`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Frontend / Backend / Tests
- **DoD:** Cidadão abre solicitação → backend recebe → operador responde → cidadão vê status.
- **Agente:** Codex (2026-04-20) — criação pública gera protocolo real, mas a listagem/retorno no fluxo administrativo ainda não reaparece no mesmo tenant.
- **Agente:** Codex (2026-04-20) — o read path de `citizen_calls` agora enxerga os registros persistidos; o browser do workspace 156 ainda fica preso na shell de carregamento institucional, então a prova E2E completa continua pendente.

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

### T4-BRAIN-OS — Fechar auto-discovery, bootstrap e write-back do brain
- **Status:** `DONE`
- **Severidade:** LOW · **Esforço:** S · **Tipo:** Automation / Memory / DevEx
- **Problema:** Sessões dependiam de setup manual e o brain não tinha auto-execução confiável no arranque.
- **DoD:** Descoberta automática do projeto, bootstrap de sessão, write-back do estado e memória durável por projeto.
- **Validação:** `python3 brain/scripts/start_agent.py --agent codex --cwd "$(pwd)" --json`
- **Depende de:** —
- **Agente:** Codex (2026-04-20)

### T4-HOOKS-OS — Ligar hooks nativos e fallback de launcher ao brain
- **Status:** `DONE`
- **Severidade:** LOW · **Esforço:** S · **Tipo:** Automation / Memory / DevEx
- **Problema:** O brain já existia, mas ainda dependia de acionamento manual ou wrappers fora do fluxo nativo dos agentes.
- **DoD:** Claude Code e Codex usam hooks nativos para bootstrap/write-back; Gemini e flows de app usam o melhor fallback disponível sem setup manual por sessão.
- **Validação:** hooks/configs carregam, bootstrap/write-back rodam, Graphify fica cacheado e reutilizado, e os arquivos de entrada do workspace apontam ao brain.
- **Depende de:** T4-BRAIN-OS.
- **Agente:** Codex (2026-04-20)

---

## Histórico de mudanças

| Data | Agente | Item | Ação |
|---|---|---|---|
| 2026-04-17 | Claude (bootstrap) | — | Backlog inicial a partir da auditoria |
| 2026-04-20 | Codex | T4-BRAIN-OS | Brain auto-discovery/bootstrap/write-back implemented |
| 2026-04-20 | Codex | T4-HOOKS-OS | Native hooks + launcher fallback wired to the brain |

---

## Mesclado de `docs/edital-roadmap.md` em 2026-04-17

- Ordem histórica de execução: compliance → integrações tributárias → cartas → levantamentos → mobile → PoC → cloud.
- O backlog vivo já substitui esse roteiro com T1 → T4 e status rastreável.

## Mesclado de `docs/executable-roadmap-checklist.md` em 2026-04-17

- Critérios de risco institucional: identidade, tenant isolation, audit traceability.
- Boa fonte para abrir itens T1/T4 e para gates de release, não como plano paralelo.

## Mesclado de `docs/edital-gap-analysis.md` em 2026-04-17

- Lacunas observadas em busca, operações principais e dados mock.
- Evidências de módulos já atendidos e lacunas a converter em itens T2/T3.

## Mesclado de `GAP_ANALYSIS_EXECUTIVO.md` em 2026-04-17

- Busca global quebrada, operações principais ausentes e dados mock como risco funcional.
- Material útil para priorizar correções de credibilidade e limpeza de FAKE/ZOMBIE.
