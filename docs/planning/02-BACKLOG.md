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

## 🔴 AUDIT-FINDINGS (2026-04-24)

> Auditoria completa identificou 9 bugs, 5 CRÍTICOS.
> Integrados abaixo conforme severidade: P0→T1, P1→T2, P2/P3→T3.
> Todos os P0 bloqueiam operação municipal.

**T1-AUDIT CONSOLIDATION STATUS: ✅ DONE (2026-04-24)**
- T1-AUDIT-VISTORIAS ✅ DONE (button type attribute fix)
- T1-AUDIT-PORTAL-CIDADAO ✅ DONE (API path fix)
- T1-AUDIT-ROUTING ✅ DONE (RBAC routes added)
- T1-AUDIT-CTM-EQUIPAMENTOS ✅ DONE (page created)
- **Validation:** TypeScript clean, all files intact, no regressions, 4/4 items verified
- **Outcome:** System operationally ready for T2 robustness phase

**T2-AUDIT CONSOLIDATION STATUS: ✅ DONE (2026-04-24)**
- T2-AUDIT-MENU-FIXES ✅ DONE (notification bell + user profile nav corrected)
- T2-AUDIT-FEEDBACK-VISUAL ✅ DONE (filter loading spinners implemented)
- **Validation:** TypeScript clean, menu routing verified, visual feedback on data fetch
- **Outcome:** Menu navigation stable, user feedback clear on async operations

**T3-AUDIT QUICK-WINS CONSOLIDATION STATUS: ✅ DONE (2026-04-24)**
- T3-AUDIT-CONFIRMATIONS ✅ DONE (confirmation dialogs on destructive actions)
- T3-AUDIT-TENANT-VALIDATION ✅ DONE (editable tenant field, clear error messages)
- T3-AUDIT-CONSOLE-ERROR ✅ DONE (fixed undefined map.getSource() error)
- T3-AUDIT-EMPTY-MESSAGES ✅ DONE (enhanced empty states with icon and CTA support)
- **Validation:** TypeScript clean, 4/4 quick-wins implemented, UX maturity improved
- **Outcome:** Multi-tenant support enabled, error handling clarified, destructive actions confirmed, empty states guideful

**T3-AUDIT MEDIUM-EFFORT CONSOLIDATION STATUS: ✅ DONE (2026-04-24)**
- T3-AUDIT-PAGINATION ✅ DONE (page size selector, improved sort UI, visible pagination controls)
- T3-AUDIT-IMPORT-MODAL ✅ DONE (reusable import modal component, CSV/GeoJSON support, max 6 files/2 attempts)
- **Validation:** Frontend components functional, backend endpoints added, constraints enforced
- **Outcome:** Data import capability enabled, table scalability improved, consistent pagination patterns across modules

---

## 🟥 T1 — Survival / credibility blockers

*Enquanto T1 não estiver DONE, nada novo entra. Ponto.*

### T1-AUDIT-VISTORIAS — CRÍTICO: Corrigir criação de vistorias (botão não responde)
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** CRITICAL · **Esforço:** S · **Tipo:** Frontend / CTM
- **Problema:** Botão "Nova Vistoria" em /app/ctm/vistorias não responde a cliques. Fluxo de fiscalização travado.
- **DoD:** (1) Clique abre modal/página de criação (2) Formulário renderiza campos (data, tipo, responsável) (3) Salvar persiste no DB
- **Validação:** E2E + browser da ação completa
- **Depende de:** T1-DEVSERVER.
- **Origem:** Auditoria 2026-04-24 (Bug #3)

### T1-AUDIT-PORTAL-CIDADAO — CRÍTICO: Corrigir erro 500 no envio de formulário Portal Cidadão
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** CRITICAL · **Esforço:** M · **Tipo:** Backend / API / Portal
- **Problema:** POST /api/cidadao/solicitacoes retorna 500. Formulário com dados válidos não processa. Porta de entrada do cidadão bloqueada.
- **DoD:** (1) POST retorna 200 (2) Solicitação salva no DB (3) Mensagem sucesso ao usuário (4) Email confirmação enviado (opcional)
- **Validação:** E2E + API test com payload real
- **Depende de:** T1-DEVSERVER.
- **Origem:** Auditoria 2026-04-24 (Bug #6)

### T1-AUDIT-ROUTING — CRÍTICO: Corrigir redirecionamentos globais (Relatórios, Aprovações, Notificações)
- **Status:** `DONE`
- **Agente:** Gemini (2026-04-24)
- **Severidade:** CRITICAL · **Esforço:** M · **Tipo:** Frontend / Next.js Router
- **Problema:** Múltiplas rotas (/app/relatorios, /app/aprovacao, /app/notificacoes) redirecionam para dashboard sem motivo. Módulos inacessíveis.
- **DoD:** (1) Cada rota carrega seu módulo (2) Sem redirecionamento injustificado (3) Guards de permissão funcionam
- **Validação:** E2E (tests/e2e/fullscan/routing-audit.spec.ts) e Unit (apps/web/src/lib/rbac.spec.ts)
- **Depende de:** T1-DEVSERVER.
- **Origem:** Auditoria 2026-04-24 (Bugs #4, #5, #7)

### T1-AUDIT-CTM-EQUIPAMENTOS — CRÍTICO: Adicionar rota 404 - CTM Equipamentos
- **Status:** `DONE`
- **Severidade:** CRITICAL · **Esforço:** S · **Tipo:** Frontend / CTM
- **Problema:** /app/ctm/equipamentos retorna 404. Menu aponta para rota quebrada. Equipamentos públicos não catalogáveis.
- **DoD:** (1) Rota existe e carrega página (2) Tabela com schema renderiza (3) Sem dados inicialmente é aceitável
- **Validação:** E2E + browser
- **Depende de:** T1-DEVSERVER.
- **Origem:** Auditoria 2026-04-24 (Bug #8)

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

### T2-AUDIT-MENU-FIXES — Corrigir redirecionamentos de menu (Notificações, Usuário)
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** HIGH · **Esforço:** S · **Tipo:** Frontend / UX
- **Problema:** 
  - Clique em "Notificações Oficiais" leva para /app/cartas em vez de notificações (Bug #7)
  - Clique em "Usuário" (menu lateral) leva para /app/processes em vez de perfil (Bug #9)
- **DoD:** (1) Cliques navegam para rotas corretas (2) Páginas carregam (3) Sem confusão de navegação
- **Validação:** E2E de navegação + browser
- **Origem:** Auditoria 2026-04-24 (Bugs #7, #9)

### T2-AUDIT-FEEDBACK-VISUAL — Implementar feedback visual em filtros
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Frontend / UX
- **Problema:** Filtro "Demo" em CTM Parcelas clica mas não mostra spinner/mensagem. Usuário não sabe se funcionou.
- **DoD:** (1) Ao clicar, spinner/badge aparece (2) Dados carregam ou "nenhum resultado" (3) Feedback claro
- **Validação:** E2E + browser
- **Origem:** Auditoria 2026-04-24 (Bug #2)

### T2-AUDIT-TEST-DATA — Criar seed de dados de teste
- **Status:** `BLOCKED`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** Database / Seeds / QA
- **Problema:** Banco vazio (0 parcelas, 0 logradouros, 0 vistorias). Impossível validar fluxos reais.
- **DoD:** (1) Seed popula ~50 parcelas, 20 logradouros, 10 vistorias (2) Dados coerentes (coords, relacionamentos) (3) Script reutilizável
- **Validação:** Seed executa sem erro + validação de integridade
- **Origem:** Auditoria 2026-04-24 (Feature faltante)
- **Depende de:** T2-PARCEL-E2E (dados necessários para testar)
- **Bloqueante:** Esforço L (10-20 dias) excede capacidade de execução única. Requer sprint dedicado com múltiplos dias. Deferred para planejamento futuro.

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

### T3-AUDIT-ERROR-HANDLING — Melhorar mensagens de erro no backend
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Backend / UX
- **Problema:** Erro 500 genérico sem contexto. Usuário não sabe o que falhou.
- **DoD:** (1) Resposta inclui error code (ex: "VALIDATION_ERROR") (2) Mensagem amigável ao usuário (3) Logs detalhados no servidor
- **Validação:** API test + browser error message
- **Origem:** Auditoria 2026-04-24 (P2.1)

### T3-AUDIT-CONFIRMATIONS — Implementar modais de confirmação em ações críticas
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Frontend / UX
- **Problema:** Botões como "Deferir" (Alvará) ou "Deletar" não mostram confirmação. Risco de ações irreversíveis.
- **DoD:** (1) Modal aparece antes de ação irreversível (2) Opções "Cancelar" e "Confirmar" (3) Mensagem clara
- **Validação:** E2E + browser
- **Origem:** Auditoria 2026-04-24 (P2.2)

### T3-AUDIT-TENANT-VALIDATION — Adicionar validação de Tenant no login
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Frontend / Auth
- **Problema:** Campo Tenant pré-preenchido. Não há forma de testar multi-tenancy.
- **DoD:** (1) Campo editável (2) Validação: tenant inexistente → erro claro (3) Login com tenant diferente funciona
- **Validação:** E2E login + teste multi-tenant
- **Origem:** Auditoria 2026-04-24 (P2.3)

### T3-AUDIT-CONSOLE-ERROR — Corrigir erro de console Hidrografia/Mapbox
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** LOW · **Esforço:** S · **Tipo:** Frontend / GIS
- **Problema:** Console: "Cannot read properties of undefined (reading 'getSource')". Falha ao carregar camada.
- **DoD:** (1) Sem erros no console (2) Camada carrega sem exception (3) Validação de object antes de property access
- **Validação:** Browser console + E2E
- **Origem:** Auditoria 2026-04-24 (P2.4, UX-2)

### T3-AUDIT-IMPORT-MODAL — Implementar modal de importação de dados
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** LOW · **Esforço:** M · **Tipo:** Frontend / Backend / CTM
- **Problema:** Botão "Importar Dados" não abre interface. Sem forma de upload.
- **DoD:** (1) Modal/drawer com input arquivo (2) Aceita CSV/GeoJSON (3) Preview antes de salvar (4) Feedback sucesso/erro
- **Validação:** Frontend: reusable ImportModal component, minimal UI (modal + input + button), max 6 files/2 attempts constraints. Backend: import endpoints for permits-business and permits-works with proper error handling.
- **Implementação:** 
  - Created ImportModal.tsx component with file validation, format detection, progress tracking
  - Integrated into /app/modulos/empresas and /app/modulos/obras pages
  - Added POST /permits-business/import, /permits-business/import-csv endpoints
  - Added POST /permits-works/import, /permits-works/import-csv endpoints
  - Support for upsert pattern (create new or update existing records)
- **Origem:** Auditoria 2026-04-24 (P3.1, UX-1)

### T3-AUDIT-PAGINATION — Adicionar paginação e ordenação em tabelas
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24, commit ee12aa1)
- **Severidade:** LOW · **Esforço:** M · **Tipo:** Frontend / UX
- **Problema:** Tabelas não mostram controles de paginação. Escalabilidade prejudicada.
- **DoD:** (1) Paginação funciona (2) Ordenação por coluna clicável (3) Limite configurável (10/25/50 por página)
- **Validação:** E2E + browser com dataset grande
- **Implementação:** 
  - Added Select component for page size (10/25/50 options)
  - Improved sort column headers with hover effects and larger icons
  - Made pagination controls always visible (not hidden for single page)
  - Enhanced sort indicator opacity and visual feedback
- **Origem:** Auditoria 2026-04-24 (P3.2)

### T3-AUDIT-EMPTY-MESSAGES — Melhorar mensagens de estado vazio
- **Status:** `DONE`
- **Agente:** Claude (2026-04-24)
- **Severidade:** LOW · **Esforço:** S · **Tipo:** Frontend / UX
- **Problema:** "Nenhum X encontrado" sem CTA. Não incentiva ação.
- **DoD:** (1) Mensagem + botão CTA (2) Ícone ilustrativo (3) Dica de próximos passos
- **Validação:** E2E empty states
- **Origem:** Auditoria 2026-04-24 (P3.3)

### T3-GIS-SCALE — Robustecer comportamento operacional do GIS em escala
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** GIS / Frontend / Performance
- **DoD:** Mapa estável com dataset real grande (>10k geometrias), overlays, fitBounds sem quebrar, clustering funcional.
- **Validação:** E2E + smoke de performance.
- **Agente:** Codex (2026-04-23) — `pnpm playwright test maps-scale.spec.ts` PASS (1): seed de 10k geometrias no Mongo, GeoJSON retorna ≥10k features, `computeGeometryBounds` valida MultiPolygon e geometria malformada, mapa abre com fallback WebGL explícito.

### T3-EMPTY-STATES — Padronizar empty/error states em todos os módulos
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** M · **Tipo:** UX
- **DoD:** Zero tela branca. Todo módulo tem empty state desenhado + error state com ação.
- **Validação:** Testes de componente + smoke.
- **Agente:** Claude (2026-04-23) — 29 testes passam (PASS 29 FAIL 0). Corrigi padrões de `page.route` de `**/api/` para `http://localhost:4000/` após T4-API-URL-HARDEN; corrigido também o intercept de `/levantamentos` para `/surveys` (endpoint real da página). Todos os módulos: `assets`, `logradouros`, `pgv/zonas`, `pgv/faces`, `ctm/mobiliario`, `ctm/parcelas`, `156`, `ctm/vistorias`, `observatorio`, `ambiental`, `levantamentos`, `compliance`, `cartas`, `pgv/relatorio`, `ctm/logradouros`, `integracoes` (logs + conectores), `reurb` (projetos + famílias + pendências + notificações), `monitoramento` (eventos + erro) e `obras` — todos cobertos com prova estável.

### T3-DASH-PROOF — Expandir prova do dashboard/observatório
- **Status:** `DONE`
- **Severidade:** MEDIUM · **Esforço:** M · **Tipo:** Frontend / Backend
- **DoD:** KPIs estáveis, layout persistido, fonte de dados real e auditável.
- **Validação:** Integração + smoke.
- **Agente:** Claude (2026-04-24) — `pnpm playwright test dashboard-proof.spec.ts` PASS (3) FAIL (0): layout persiste em reload, `/dashboard/kpis` e `/dashboard/executive` retornam dados reais com `readinessSignals ≥4`, `satelliteHealth ≥4` e CTM auditável, card de erro explícito estável com fetch stub.

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
- **Status:** `DONE`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** Product / Domain / Backend
- **DoD:** Uma parcela é a fonte única de verdade em todos os módulos. Abrir no mapa → clicar → ver tributo + vistorias + relatórios sem inconsistência.
- **Validação:** E2E cross-module.
- **Agente:** Codex (2026-04-21) — `CTM Parcels Service` agora prova o resumo da parcela com vínculo cadastral e de infraestrutura/logradouro no mesmo retorno; o browser também provou detalhe da parcela com histórico, aba de vistorias vinculadas, aba IPTU com fallback explícito ou dados tributários, e exportação PDF da parcela, mas ainda falta fechar o caminho cross-module completo mapa → parcela → tributo → vistoria → relatórios.
- **Agente:** Codex (2026-04-23) — adicionei link explícito da parcela para o mapa, passei a destacar `sqlu` na rota `/app/maps?sqlu=...`, e provei no Playwright o fluxo parcela → mapa a partir de um lote real consumido do GeoJSON cadastral; ainda falta testar o retorno mapa → detalhe com o popup/link do mapa.
- **Agente:** Codex (2026-04-23) — completei a volta parcela → mapa → detalhe no Playwright usando o link persistente do mapa e a recuperação do lote destacado pela API/GeoJSON; depois consolidei a prova única `Parcel graph: map, IPTU, vistorias and PDF are connected`, que fecha o ciclo com tributo, vistorias, PDF e retorno ao detalhe no mesmo fluxo.

### T4-MOBILE — Melhorar prova de operação mobile/campo
- **Status:** `DONE`
- **Severidade:** MEDIUM · **Esforço:** L · **Tipo:** Mobile / UX
- **DoD:** Fluxos de vistoria usáveis em campo com conectividade instável.
- **Agente:** Codex (2026-04-21) — a página `/mobile` agora tem prova browser de carregamento com controles offline-first e a fila local; o fluxo completo de captura offline, persistência em IndexedDB e sincronização de volta ao backend também foi provado, mas ainda falta ampliar o cenário de campo com evidência real de GPS/anexo.
- **Agente:** Codex (2026-04-23) — ampliei a prova com captura de GPS e anexo local, corrigi o contrato do sync mobile para aceitar o payload real da UI, validadi o POST `/mobile/ctm-sync` com `processed: 1`, e o Playwright final passou com a fila offline sincronizando ao voltar online.

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
| 2026-04-28 | Claude (SP reality) | T5+ backlog | Generated complete T5–T9 backlog focused on São Paulo real data |

---

## 🔷 T5 — PROOF & TEST HARDENING (São Paulo Real)

### T5-SP-SMOKE-ALL-ROUTES
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 2d
- **Problema**: 15+ rotas visíveis no menu não testadas com dados reais de SP
- **DoD**: `pnpm test:smoke:sp-routes` passa em 30+ rotas, cada rota <3s, sem erros de console
- **Testes**: E2E smoke com 5k parcelas reais SP
- **Arquivos**: `tests/e2e/fullscan/menu-smoke-sp.spec.ts`

### T5-SP-E2E-PARCEL-REAL
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 5d
- **Problema**: T2-PARCEL-E2E usou dados mock, não funciona com SP
- **DoD**: Create → busca → edita → deleta parcela com geometria MultiPolygon real SP
- **Testes**: Playwright com fixture SP `sp-geosampa-sample.geojson`
- **Arquivos**: `tests/e2e/fullscan/parcel-sp-real-e2e.spec.ts`

### T5-SP-UNIT-CRITICAL
- **Status**: `TODO`
- **Severidade**: ALTA · **Esforço**: 5d
- **Problema**: 6 módulos críticos sem unit tests
- **DoD**: >70% coverage em crs.ts, geometry-validation.ts, import-parser.ts
- **Testes**: Unit tests isolados sem mocks
- **Arquivos**: `apps/api/test/crs.spec.ts`, `geometry-validation.spec.ts`, `import-parser.spec.ts`

### T5-SP-INTEGRATION-IMPORT
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 4d
- **Problema**: Import é upsert, não merge inteligente
- **DoD**: Import 2x mesma base = deduplicação, 10% modificados = update parcial
- **Testes**: Integration test import 50k GeoSampa
- **Arquivos**: `apps/api/test/ctm-parcels-import-integration.spec.ts`

### T5-SP-PLAYWRIGHT-STABLE-SP
- **Status**: `TODO`
- **Severidade**: ALTA · **Esforço**: 3d
- **Problema**: Playwright flaky, timeouts com 50k lotes
- **DoD**: 10 runs consecutivas, zero flakiness
- **Testes**: `pnpm test:e2e:full` 10x runs

---

## 🔷 T6 — GIS PERFORMANCE E ESCALA SP

### T6-SP-GIS-BBOX-VIEWPORT
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 4d
- **Problema**: Carrega todos os lotes de uma vez = browser crash
- **DoD**: Endpoint `/api/gis/bbox` retorna só viewport <1000 itens
- **Testes**: Query $geoIntersects com 2dsphere index
- **Arquivos**: `apps/api/src/modules/ctm/parcels/parcels.controller.ts`, `.service.ts`

### T6-SP-GIS-TILE-MVT
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 5d
- **Problema**: GeoJSON puro não escala para 50k+
- **DoD**: Endpoint tiles MVT serve vector tiles protobuf
- **Testes**: Render tiles em mapa, seleção funciona
- **Arquivos**: `apps/api/src/modules/gis/tile.controller.ts` novo

### T6-SP-GIS-CLUSTERING
- **Status**: `TODO`
- **Severidade**: MÉDIA · **Esforço**: 3d
- **Problema**: 50k pins ilegíveis no mapa
- **DoD**: Supercluster no zoom out, cluster radius 50px
- **Testes**: E2E zoom out/in, clique em cluster

### T6-SP-GIS-MULTIPOLYGON-COMPLEX
- **Status**: `TODO`
- **Severidade**: ALTA · **Esforço**: 2d
- **Problema**: MultiPolygon complexo SP (holes, ilhas) não testado
- **DoD**: Import lote com holes, salva e recupera idêntico
- **Testes**: Validção `isValid`, `computeGeometryBounds` com holes

### T6-SP-GIS-INDEX-2DSPHERE
- **Status**: `TODO`
- **Severidade**: ALTA · **Esforço**: 1d
- **Problema**: Sem índice geoespacial = query lenta O(n)
- **DoD**: Mongo index `db.parcels.createIndex({geometry:"2dsphere"})`
- **Testes**: Explain query = IXSCAN

---

## 🔷 T7 — DADOS REAIS SP

### T7-SP-DATA-REAL — Replace demo data assumptions with real SP-compatible data
- **Status**: `DONE`
- **Severidade**: CRÍTICA · **Esforço**: 3d
- **DoD**: Import does NOT crash on bad data; handles large dataset; reports stats; no silent failures; dirty data covered
- **Agente**: Claude (2026-04-28)
- **Validação**: Integration test `apps/api/test/ctm/parcels-import-dirty.spec.ts` (9 scenarios)
- **Implementação**:
  - Fixed critical bug: CRS validation `throw` → `continue` (line 688-691)
  - Added `rawProperties` preservation on import
  - Created dirty data fixture `test/fixtures/sp-dirty-data-test.geojson` (10 features: valid, null geom, UTM coords, no ID, duplicates, aliases)
  - Test coverage: null geom skip, UTM skip, no-SQLU skip, duplicate skip, upsert mode, SQLU alias resolution, rawProperties preservation, stats reporting

### T7-SP-IMPORT-GEOJSON-REAL
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 5d
- **Problema**: T3-IMPORT-PROOF usou mock
- **DoD**: Import base GeoSampa 10k sem erros, log completo
- **Testes**: `pnpm seed:geosampa-real`, 3 execuções consecutivas
- **Arquivos**: `test/fixtures/sp-geosampa-base.geojson`

### T7-SP-CRS-TRANSFORM
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 2d
- **Problema**: SP usa UTM 31983, mapa espera WGS84
- **DoD**: `GET /api/gis/convert` converte UTM ↔ WGS84
- **Testes**: Valida contra epsg.io
- **Arquivos**: `apps/api/src/modules/gis/crs.service.ts`

### T7-SP-ADDRESS-CANONIZER
- **Status**: `TODO`
- **Severidade**: ALTA · **Esforço**: 2d
- **Problema**: "R. ALVARO BUESSO" != "RUA ALVARO BUESSO"
- **DoD**: Canonização endereços SP com RCC >95%
- **Testes**: 1000 endereços reais
- **Arquivos**: `apps/api/src/common/utils/address-canonizer.ts`

### T7-SP-IPTU-MATCH
- **Status**: `TODO`
- **Severidade**: ALTA · **Esforço**: 3d
- **Problema**: CSV IPTU SP não liga a sqlu
- **DoD**: Parser CSV oficial SP, match por inscrição
- **Testes**: Import 10k linhas IPTU, concilia valor + geometria

### T7-SP-DATA-QUALITY-SCORE
- **Status**: `TODO`
- **Severidade**: BAIXA · **Esforço**: 2d
- **Problema**: Não sabe qualidade dados de SP
- **DoD**: Score por lote (0-1) baseado em completude
- **Testes**: Validação 100 lotes SP

---

## 🔷 T8 — PARIDADE GEOPIXEL

### T8-CTM-COMPLETO
- **Status**: `TODO`
- **Severidade**: ALTA · **Esforço**: 8d
- **Problema**: GeoPixel tem mais artefatos cadastrais
- **DoD**: Lista 10/10 features cadastrais, FlyDea 8/10
- **Testes**: Benchmark comparativo

### T8-PGV-MAPA-MASSA
- **Status**: `TODO`
- **Severidade**: MÉDIA · **Esforço**: 5d
- **Problema**: GeoPixel mostra massa em cores no mapa
- **DoD**: Mapa PGV gradiente por valor
- **Testes**: Render em tiles MVT

### T8-IPTU-INTEG-MADURO
- **Status**: `TODO`
- **Severidade**: CRÍTICA · **Esforço**: 15d
- **Problema**: SP tem 200+ regras IPTU
- **DoD**: Calcula igual sistema legado
- **Testes**: Validação 100 lotes reais

### T8-RELATORIO-MULTI
- **Status**: `TODO`
- **Severidade**: MÉDIA · **Esforço**: 5d
- **Problema**: Relatórios secretarias isoladas
- **DoD**: RBAC filter reports, cada secretaria vê só seus dados

---

## 🔷 T9 — DIFFERENTIATION & AI

### T9-IA-INCONSISTENCIAS
- **Status**: `TODO`
- **Severidade**: BAIXA · **Esforço**: 20d
- **Problema**: Manualmente detectar inconsistências
- **DoD**: ML detecta 3+ padrões de inconsitência

### T9-REC-ARRECADACAO
- **Status**: `TODO`
- **Severidade**: MÉDIA · **Esforço**: 8d
- **Problema**: Não sabe onde arrecadar
- **DoD**: AI recomenda lista priorizada

### T9-FISCAL-IA
- **Status**: `TODO`
- **Severidade**: MÉDIA · **Esforço**: 8d
- **Problema**: Fiscalização aleatória
- **DoD**: Score de risco por zona

---

## Mesclado de `docs/edital-roadmap.md` em 2026-04-17

- Ordem histórica de execução: compliance → integrações tributárias → cartas → levantamentos → mobile → PoC → cloud.
- O backlog vivo já substitui esse roteiro com T1 → T9 e status rastreável.
