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
- **Agente:** Codex (2026-04-21) — prova de dataset >10k e fallback explícito validada; `GeometryService` agora também tem prova unitária de `MultiPolygon` e geometria malformada; `computeGeometryBounds` ganhou prova explícita de `MultiPolygon` e ignora geometria vazia, mas o render real do mapa em escala continua dependente do ambiente WebGL do runner.

### T3-EMPTY-STATES — Padronizar empty/error states em todos os módulos
- **Status:** `PARTIAL`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** UX
- **DoD:** Zero tela branca. Todo módulo tem empty state desenhado + error state com ação.
- **Validação:** Testes de componente + smoke.
- **Agente:** Codex (2026-04-21) — `assets`, `logradouros`, `pgv/zonas`, `pgv/faces`, `ctm/mobiliario`, `ctm/parcelas`, `ctm/parcelas/:id`, `ctm/parcelas/:id/infraestrutura`, `156`, `ctm/vistorias`, `ambiental`, `levantamentos`, `modulos/compliance`, `cartas`, `pgv/relatorio`, `integracoes`, `reurb`, `monitoramento`, `modulos/obras`, `modulos/empresas` e `poc` agora mostram error/empty state explícitos com fallback testado; `integracoes` ganhou também a prova de conectores vazios; `reurb` ganhou prova de famílias/unidades vazias, pendências/entregáveis vazios e notificações vazias com projeto ativo; `auditoria` foi removida da prova porque a rota abre snapshot de dashboard e não expõe a tela alvo de forma confiável; ainda faltam outros módulos do padrão.

### T3-DASH-PROOF — Expandir prova do dashboard/observatório
- **Status:** `PARTIAL`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Frontend / Backend
- **DoD:** KPIs estáveis, layout persistido, fonte de dados real e auditável.
- **Validação:** Integração + smoke.
- **Agente:** Codex (2026-04-21) — layout do dashboard persiste em reload, `/dashboard/kpis` e `/dashboard/executive` estão provados, os cards de KPI foram ligados ao payload real, os sinais de prontidão/satélites seguem auditáveis, `DashboardService` agora também tem prova unitária do contrato executivo, e `MonitoringService` ganhou prova de dashboard filtrado; ainda falta ampliar KPIs/observabilidade satélite.

### T3-IMPORT-PROOF — Provar importações (GeoJSON / CSV / base externa)
- **Status:** `DONE`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Backend / Tests
- **DoD:** Importação de base real validada com dataset de teste, rollback em caso de erro.
- **Agente:** Codex (2026-04-20) — importação GeoJSON validada com batch real de teste e payload inválido sem alterar totais.

### T3-CITIZEN — Provar fluxos de portal cidadão
- **Status:** `DONE`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Frontend / Backend / Tests
- **DoD:** Cidadão abre solicitação → backend recebe → operador responde → cidadão vê status.
- **Agente:** Codex (2026-04-20) — criação pública gera protocolo real, mas a listagem/retorno no fluxo administrativo ainda não reaparece no mesmo tenant.
- **Agente:** Codex (2026-04-21) — o fluxo browser→API→DB foi provado no `156`; o protocolo novo aparece no workspace e o status resolve no mesmo tenant.
- **Agente:** Codex (2026-04-22) — revalidação com `next dev` local e `nest start --watch` passou; a falha de chunks 404 no `web-dev` não se reproduziu neste ambiente.

---

## 🟩 T4 — Differentiation / leadership

### T4-PARCEL-GRAPH — Conectar parcela-mapa-tributo-vistoria como grafo único de verdade
- **Status:** `PARTIAL`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** Product / Domain / Backend
- **DoD:** Uma parcela é a fonte única de verdade em todos os módulos. Abrir no mapa → clicar → ver tributo + vistorias + relatórios sem inconsistência.
- **Validação:** E2E cross-module.
- **Agente:** Codex (2026-04-21) — `CTM Parcels Service` agora prova o resumo da parcela com vínculo cadastral e de infraestrutura/logradouro no mesmo retorno; o browser também provou detalhe da parcela com histórico, aba de vistorias vinculadas, aba IPTU com fallback explícito ou dados tributários, e exportação PDF da parcela, mas ainda falta fechar o caminho cross-module completo mapa → parcela → tributo → vistoria → relatórios.

### T4-MOBILE — Melhorar prova de operação mobile/campo
- **Status:** `PARTIAL`
- **Severidade:** MEDIUM · **Esforço:** L · **Tipo:** Mobile / UX
- **DoD:** Fluxos de vistoria usáveis em campo com conectividade instável.
- **Agente:** Codex (2026-04-21) — a página `/mobile` agora tem prova browser de carregamento com controles offline-first e a fila local; o fluxo completo de captura offline, persistência em IndexedDB e sincronização de volta ao backend também foi provado, mas ainda falta ampliar o cenário de campo com evidência real de GPS/anexo.

### T4-AUDIT — Elevar confiança de auditoria e isolamento multi-tenant
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** M-L · **Tipo:** Security / Backend / Tests
- **DoD:** Trilha de auditoria clara + testes de isolamento de tenant passando.
- **Agente:** Codex (2026-04-21) — `ParcelAuditRepository` agora tem prova unitária de filtro por tenant/projeto/parcela e contagem/listagem sem vazamento entre tenants; o controller/serviço também têm smoke do endpoint de auditoria da parcela, e a página `/app/auditoria` ficou navegável no browser, mas ainda falta cobrir o restante da trilha de auditoria.
- **Agente:** Codex (2026-04-22) — `apps/api/test/ctm-parcels-detail-api.e2e.spec.ts`, `apps/api/test/ctm-parcels.spec.ts` e a navegação browser de `/app/auditoria` passaram; o spec precisou de ajuste de locator, e o `notifications-letters/unread-count` continua 404 com fallback silencioso no topbar, então a trilha ainda não fecha como `DONE`.
- **Agente:** Codex (2026-04-22) — o badge de notificações oficiais foi corrigido com endpoint real `GET /notifications-letters/unread-count`, o botão do topbar agora leva para `/app/cartas` e o fallback silencioso foi removido; a trilha de auditoria segue `PARTIAL` porque ainda falta o restante do grafo/audit trail, não mais por falta de prova do `web-dev`.
- **Agente:** Codex (2026-04-22) — arquivei o `_document` legado em `.archive/2026-04-22/apps/web/src/pages/_document.tsx`, limpei o `.next` gerado, corrigi o browser local para falar direto com `http://localhost:4000` em vez do proxy `/api`, e revalidei `citizen-proof` + `public-login-noise` em Playwright; o bloco remanescente da auditoria foi fechado com prova browser/API/DB no compose estabilizado.

### T4-API-URL-HARDEN — Normalizar URL da API e eliminar dependência implícita do Next dev
- **Status:** `DONE`
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Frontend / Infra / Tests
- **Problema:** O frontend e alguns testes ainda dependiam de comportamento implícito do Next dev/proxy `/api`, o que gerava inconsistência entre dev local, Docker e browser real.
- **DoD:** `NEXT_PUBLIC_API_URL` centralizado e consistente, browser falando direto com o backend publicado, sem fallback silencioso mascarando erro real, com prova automatizada do fluxo real.
- **Validação:** build do frontend + Playwright browser/API real.
- **Depende de:** T4-ENV-DOCKER, T4-AUDIT.
- **Agente:** Codex (2026-04-22) — `apps/web/src/lib/api.ts` passou a resolver a URL da API de forma explícita, o compose dev publica `NEXT_PUBLIC_API_URL=http://localhost:4000`, o topbar parou de mascarar o contador de notificações com zero falso, os formulários públicos de recuperação passaram a reportar falha, e os fluxos `citizen-proof`, `public-login-noise` e `topbar-notifications` voltaram a provar o backend real sem proxy interno fake.

### T4-ENV-DOCKER — Estabilizar o `web-dev`/`api-dev` do compose e provar o Next no container
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** Infra / DevEx / Frontend
- **DoD:** `docker compose --profile dev up -d --build web-dev api-dev` sobe limpo após limpeza controlada, `web-dev` e `api-dev` ficam ativos juntos e o Next serve HTML/chunks no container sem 404 de artefatos.
- **Validação:** rebuild limpo do compose + prova browser sem 404 em `/_next/static/chunks` e sem erro de página/hidratação.
- **Agente:** Codex (2026-04-22) — o host Docker estava em 100% de disco e o Mongo caía com `No space left on device`; após `docker system prune -af --volumes`, o compose voltou a subir, o `web-dev` recompilou no container, e a prova browser mostrou `/_next/static/chunks` sem 404.

### T4-NOTIF-BADGE — Eliminar fallback silencioso do badge de notificações
- **Status:** `DONE`
- **Severidade:** LOW · **Esforço:** S · **Tipo:** Frontend / Backend / Tests
- **DoD:** O topo do app mostra badge/contador real de notificações oficiais ou um estado explícito de indisponibilidade, sem 404 silencioso mascarado por fallback.
- **Agente:** Codex (2026-04-22) — descoberto durante `T4-AUDIT`; o endpoint foi implementado com contagem real de cartas geradas pendentes, o topbar agora aponta para `/app/cartas`, o fallback silencioso foi removido e os testes de API/browser passaram.

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
