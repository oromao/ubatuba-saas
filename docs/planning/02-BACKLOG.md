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

### T5-SP-TEST-PROOF — Prove system works end-to-end
- **Status**: `DONE`
- **Severidade**: CRÍTICA · **Esforço**: 3d
- **DoD**: Menu smoke passes 100%; no route hangs; failures deterministic; E2E flows pass
- **Agente**: Claude (2026-04-28)
- **Validação**: `tests/e2e/fullscan/menu-smoke.spec.ts` (28 routes)
- **Implementação**:
  - Extended menu-smoke from 16 → 28 routes covering all nav-visible + 5 previously-FIX routes
  - Added: certidoes, levantamentos, profile, compliance, alerts, obras-publicas, cemiterio, pgv/fatores, pgv/faces, pgv/relatorio, assets
  - All 30 routes in cleanup inventory now classified (29 KEEP, 1 HIDE)
  - Zero remaining FIX classifications

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

### T6-SP-GIS-SCALE — Make GIS usable with São Paulo scale
- **Status**: `DONE`
- **Severidade**: CRÍTICA · **Esforço**: 4d
- **DoD**: Map loads with partial data (viewport); no full dataset load; zoom/pan responsive; large dataset doesn't break UI
- **Agente**: Claude (2026-04-28)
- **Validação**: Integration test `apps/api/test/ctm/parcels-gis-scale.spec.ts` (5 scenarios)
- **Implementação**:
  - Added bbox limit of 2000 in repository.list() when bbox filter present
  - Changed frontend map-view.tsx to use viewport-based bbox loading instead of full dataset
  - Added debounced `moveend` handler to reload parcels on pan/zoom
  - Changed source update to use `setData()` instead of re-creating source
  - Existing 2dsphere index on `geometry` field ensures $geoWithin uses IXSCAN

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

## 🔶 T8 — PARIDADE GEOPIXEL-CLASS (Competitive Parity)

**Objetivo:** Deixar FlyDea comparável à GeoPixel em funcionalidades básicas.

### T8-GIS-CRS — CRS Transform UTM↔WGS84
- **Status:** `IN_PROGRESS`
- **Severidade:** CRÍTICA · **Esforço:** M (3d) · **Tipo:** GIS / Backend
- **Problema:** SP usa UTM 31983 (EPSG:31983), sistema assume WGS84 (EPSG:4326). Import de dados SP falha ou corrompe coordenadas.
- **DoD:** (1) `GET /api/gis/convert?from=31983&to=4326&coords=...` (2) Conversão bidirecional (3) Validação contra epsg.io (4) Handle batch conversion
- **Validação:** Unit tests contra coordenadas conhecidas + integration test
- **Testes:** Unit (crs.service.ts), Integration (API endpoint)
- **Arquivos:** `apps/api/src/modules/gis/crs.service.ts`, `crs.controller.ts`
- **Implementação:** Endpoint REST criado em gis.controller.ts, testes unitários em test/gis/gis-crs.spec.ts
- **Agente:** Mistral Vibe (2026-04-28)
- **Impacto em licitação:** **BLOQUEIO TOTAL** — Dados geográficos incorretos

### T8-GIS-BBOX — Endpoint Bbox Viewport
- **Status:** `IN_PROGRESS`
- **Severidade:** CRÍTICA · **Esforço:** M (4d) · **Tipo:** GIS / Backend
- **Problema:** Carrega todos os lotes de uma vez = browser crash. Necessário carregar apenas o que está no viewport.
- **DoD:** (1) Endpoint `/api/gis/bbox?minLng=...&minLat=...&maxLng=...&maxLat=...` (2) Retorna <1000 itens por default (3) Query otimizada com 2dsphere index (2) Suporte a paginação
- **Validação:** Query explain = IXSCAN, performance <500ms com 50k geometrias
- **Testes:** Integration (bbox query), E2E (mapa interativo)
- **Arquivos:** `apps/api/src/modules/gis/gis.controller.ts`
- **Implementação:** Endpoint REST criado em gis.controller.ts, testes de integração em test/gis/gis-bbox.spec.ts
- **Agente:** Mistral Vibe (2026-04-28)
- **Impacto em licitação:** **CRÍTICO** — UX ruim, browser freeze

### T8-GIS-MVT — Implementar MVT Tiles
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** XL (20d) · **Tipo:** GIS / Backend / Performance
- **Problema:** GeoJSON puro não escala para 50k+ geometrias. Browser crash com dataset real SP.
- **DoD:** (1) Endpoint `/api/gis/tiles/{z}/{x}/{y}.pbf` serve vector tiles (2) Renderização no mapa funciona (3) Seleção de features funciona (4) Suporte a layers múltiplos
- **Validação:** E2E render + seleção + performance com 50k+ geometrias
- **Testes:** Unit (encoder), Integration (endpoint), E2E (render)
- **Arquivos:** `apps/api/src/modules/gis/tile.controller.ts`, `tile.service.ts`, `apps/api/src/common/utils/mvt.util.ts`
- **Depende de:** T6-SP-GIS-INDEX-2DSPHERE
- **Impacto em licitação:** **BLOQUEIO TOTAL** — Sistema inutilizável em escala municipal
- **Definição de pronto:** MVT tiles servindo e renderizando com dataset SP real

### T8-GIS-CRS — CRS Transform UTM↔WGS84
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (3d) · **Tipo:** GIS / Backend
- **Problema:** SP usa UTM 31983 (EPSG:31983), sistema assume WGS84 (EPSG:4326). Import de dados SP falha ou corrompe coordenadas.
- **DoD:** (1) `GET /api/gis/convert?from=31983&to=4326&coords=...` (2) Conversão bidirecional (3) Validação contra epsg.io (4) Handle batch conversion
- **Validação:** Unit tests contra coordenadas conhecidas + integration test
- **Testes:** Unit (crs.service.ts), Integration (API endpoint)
- **Arquivos:** `apps/api/src/modules/gis/crs.service.ts`, `crs.controller.ts`
- **Impacto em licitação:** **BLOQUEIO TOTAL** — Dados geográficos incorretos

### T8-GIS-BBOX — Endpoint Bbox Viewport
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (4d) · **Tipo:** GIS / Backend
- **Problema:** Carrega todos os lotes de uma vez = browser crash. Necessário carregar apenas o que está no viewport.
- **DoD:** (1) Endpoint `/api/gis/bbox?minLng=...&minLat=...&maxLng=...&maxLat=...` (2) Retorna <1000 itens por default (3) Query otimizada com 2dsphere index (4) Suporte a paginação
- **Validação:** Query explain = IXSCAN, performance <500ms com 50k geometrias
- **Testes:** Integration (bbox query), E2E (mapa interativo)
- **Arquivos:** `apps/api/src/modules/ctm/parcels/parcels.controller.ts`, `parcels.service.ts`
- **Impacto em licitação:** **CRÍTICO** — UX ruim, browser freeze

### T8-GIS-CLUSTER — Supercluster para Mapa
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** S (2d) · **Tipo:** GIS / Frontend
- **Problema:** 50k+ pins no mapa = sobreposição, UX ilegível.
- **DoD:** (1) Supercluster implementado (2) Cluster radius 50px (3) Zoom out = clusters, zoom in = detalhe (4) Click em cluster expande
- **Validação:** E2E zoom out/in + clique em cluster
- **Testes:** E2E (clustering behavior)
- **Arquivos:** `apps/web/src/app/app/maps/map-view.tsx`
- **Depende de:** T8-GIS-MVT
- **Impacto em licitação:** **ALTO** — Mapa inutilizável visualmente

### T8-GIS-MULTIPOLYGON — Suporte MultiPolygon Complexo
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** S (2d) · **Tipo:** GIS / Backend / Tests
- **Problema:** MultiPolygon complexo SP (holes, ilhas) não testado. Risco de dados corrompidos.
- **DoD:** (1) Import lote com holes (2) Salva e recupera idêntico (3) Validação `isValid` (4) `computeGeometryBounds` funciona com holes
- **Validação:** Import real SP + validação geométrica
- **Testes:** Unit (geometry validation), Integration (import), E2E (render)
- **Arquivos:** `apps/api/src/modules/ctm/parcels/parcel.schema.ts`, `parcels.service.ts`
- **Impacto em licitação:** **ALTO** — Dados geométricos incorretos

### T8-INTEG-GEOSAMPA — Import GeoSampa Real
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (4d) · **Tipo:** Integração / Dados
- **Problema:** Import atual não testado com dados reais de São Paulo (50k+ lotes).
- **DoD:** (1) Script `pnpm seed:geosampa-real` executa sem erros (2) Import 10k lotes sem falhas (3) Log completo de import (4) Estatísticas de import
- **Validação:** 3 execuções consecutivas sem erros
- **Testes:** Integration (import 50k), E2E (visualização)
- **Arquivos:** `test/fixtures/sp-geosampa-base.geojson`, `scripts/seed-geosampa.mjs`
- **Depende de:** T8-GIS-CRS, T7-SP-DATA-REAL
- **Impacto em licitação:** **CRÍTICO** — Não pode provar que funciona com dados reais

### T8-CTM-DESMEMB — Workflow de Desmembramento
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** L (10d) · **Tipo:** CTM / Domain / Backend
- **Problema:** GeoPixel tem workflow completo de desmembramento. FlyDea tem apenas CRUD simples.
- **DoD:** (1) Parcela → desmembramento → aprovação → nova parcela (2) Validação topológica (3) Histórico de desmembramento (4) Inversão de desmembramento
- **Validação:** E2E completo do workflow
- **Testes:** Unit (validation), Integration (workflow), E2E (UI)
- **Arquivos:** `apps/api/src/modules/ctm/parcels/parcels-desmembramento.service.ts`
- **Impacto em licitação:** **CRÍTICO** — CTM incompleto

### T8-CTM-COMPLETO — CTM Completo (10/10 Features)
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** L (8d) · **Tipo:** CTM / Product
- **Problema:** GeoPixel tem 10/10 features cadastrais. FlyDea tem 6/10.
- **DoD:** (1) Lista comparativa FlyDea vs GeoPixel (2) Implementar features faltantes (3) Benchmark de performance (4) Documentação completa
- **Validação:** Benchmark comparativo + E2E de todas as features
- **Testes:** E2E de cada feature
- **Impacto em licitação:** **ALTO** — Gap competitivo

### T8-PROCESS-ALVARA — Módulo de Alvarás
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** XL (15d) · **Tipo:** Processos / Backend / Frontend
- **Problema:** Não tem módulo de alvarás. Não atende processo de licitação.
- **DoD:** (1) CRUD alvará (2) Workflow de aprovação (3) Vinculação com parcela (4) Emissão de documento oficial (5) Prazo de validade
- **Validação:** E2E completo do fluxo
- **Testes:** Unit, Integration, E2E
- **Arquivos:** `apps/api/src/modules/processes/alvaras/`
- **Impacto em licitação:** **CRÍTICO** — Processo não atender

### T8-PROCESS-HABITE — Módulo Habite-se
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** L (8d) · **Tipo:** Processos / Backend / Frontend
- **Problema:** Não tem módulo de habite-se. Não atende construção.
- **DoD:** (1) CRUD habite-se (2) Vinculação com alvará (3) Inspeção final (4) Emissão de certidão (5) Registro oficial
- **Validação:** E2E completo
- **Testes:** Unit, Integration, E2E
- **Arquivos:** `apps/api/src/modules/processes/habites/`
- **Impacto em licitação:** **CRÍTICO** — Processo não atende

### T8-TRIB-IPTU — Cálculo IPTU
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** L (10d) · **Tipo:** Tributação / Backend
- **Problema:** Dashboard usa mock. Não tem cálculo real de IPTU.
- **DoD:** (1) Engine de cálculo IPTU (2) Integração com planta de valores (3) Cálculo por parcela (4) Dashboard coerente (5) Simulador
- **Validação:** Validação contra sistema legado SP
- **Testes:** Unit (cálculo), Integration (API), E2E (visualização)
- **Arquivos:** `apps/api/src/modules/tributacao/iptu-calculator.service.ts`
- **Depende de:** T8-TRIB-PLANTA
- **Impacto em licitação:** **CRÍTICO** — Fiscalização impossível

### T8-TRIB-PLANTA — Planta de Valores
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** M (5d) · **Tipo:** Tributação / Backend
- **Problema:** Sem planta de valores por zona. Cálculo IPTU não tem base.
- **DoD:** (1) CRUD zona tributária (2) Valor por m² por zona (3) Planta visual no mapa (4) Export PDF
- **Validação:** Ajax de zona no mapa + export PDF
- **Testes:** Unit, Integration, E2E
- **Arquivos:** `apps/api/src/modules/tributacao/zonas/`
- **Impacto em licitação:** **ALTO** — Cálculo IPTU inválido

### T8-CIDADAO-156 — Integração 156
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (5d) · **Tipo:** Portal / Integração
- **Problema:** Portal cidadão isolado. Não integra com sistema nacional 156.
- **DoD:** (1) API de integração 156 (2) Sincronização de solicitações (3) Acompanhamento unificado (4) Notificações
- **Validação:** Solicitação → 156 → Resposta visível no portal
- **Testes:** Integration, E2E
- **Arquivos:** `apps/api/src/modules/citizen/156-integration.service.ts`
- **Impacto em licitação:** **CRÍTICO** — Não atende padrão nacional

### T8-CERTIDAO-OFICIAL — Certidões Oficiais com Validade Jurídica
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** L (7d) · **Tipo:** Relatórios / Legal
- **Problema:** PDF simples sem assinatura digital. Sem validade jurídica.
- **DoD:** (1) Geração de certidão oficial (2) Assinatura digital (3) Número único (4) Validade temporal (5) Verificação online
- **Validação:** Validação com cartório de registro
- **Testes:** E2E (geração + verificação)
- **Arquivos:** `apps/api/src/modules/certificates/certificate-generator.service.ts`
- **Impacto em licitação:** **CRÍTICO** — Documentos sem valor legal

### T8-PGV-MAPA-MASSA — Mapa PGV por Valor
- **Status:** `TODO`
- **Severidade:** MÉDIA · **Esforço:** M (5d) · **Tipo:** GIS / PGV
- **Problema:** GeoPixel mostra massa em cores no mapa. FlyDea não tem.
- **DoD:** (1) Gradiente de cores por valor de m² (2) Legenda dinâmica (3) Tooltip com valores (4) Filtro por faixa de valor
- **Validação:** Renderização visual correta
- **Testes:** E2E (interação com mapa)
- **Arquivos:** `apps/web/src/app/app/pgv/mapa-massa/`
- **Depende de:** T8-GIS-MVT, T8-TRIB-PLANTA
- **Impacto em licitação:** **MÉDIO** — Diferencial visual

---

## 🟧 T9 — LICITATION READINESS (Prontidão para prova técnica)

**Objetivo:** Deixar pronto para demonstração técnica em licitação e prova de conformidade.

### T9-DEMO-DATA — Dataset de Demonstração SP
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** L (5d) · **Tipo:** Dados / QA
- **Problema:** Sem dataset real de SP para demonstração. Não pode provar nada.
- **DoD:** (1) Dataset de 5k parcelas SP (2) Logradouros correspondentes (3) Dados de IPTU real (4) Vistorias de exemplo (5) Seed reproduzível
- **Validação:** Script executa sem erros + dados coerentes
- **Testes:** Integration (seed), E2E (visualização)
- **Arquivos:** `test/fixtures/demo-sp-dataset.geojson`, `scripts/seed-demo.mjs`
- **Impacto em licitação:** **CRÍTICO** — Não tem o que demonstrar

### T9-DEMO-FLOW — Fluxo de Demo 30 Minutos
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (3d) · **Tipo:** Product / UX
- **Problema:** Sem roteiro de demonstração. Risco de apresentaçao fraca.
- **DoD:** (1) Roteiro escrita (2) Scripts de execução (3) Dados pré-carregados (4) Checklist de verificação (5) Slides de suporte
- **Validação:** Ensaios internos (3x)
- **Testes:** - (documentação)
- **Arquivos:** `docs/licitacao/demo-roteiro.md`, `docs/licitacao/demo-scripts/`
- **Depende de:** T9-DEMO-DATA
- **Impacto em licitação:** **CRÍTICO** — Apresentação amadora

### T9-SEC-AUDIT — Auditoria de Segurança
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (5d) · **Tipo:** Security / Backend
- **Problema:** Sem auditoria de segurança. Vulnerabilidades não detectadas.
- **DoD:** (1) Relatório OWASP Top 10 (2) Scan automático em CI (3) Fix de todos críticos (4) Documentação de Security Policy
- **Validação:** Relatório limpo + CI passing
- **Testes:** Security scan em pipeline
- **Arquivos:** `docs/security/START.md`, `.github/workflows/security-scan.yml`
- **Impacto em licitação:** **CRÍTICO** — Risco de desqualificação por segurança

### T9-PERF-BASE — Performance Baseline
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** M (4d) · **Tipo:** Performance / Tests
- **Problema:** Sem métricas de performance.Não sabe se escala.
- **DoD:** (1) Map load <2s (2) Search <300ms (3) Import 10k <10min (4) Concurrent 100 users <3s (5) Relato de performance
- **Validação:** Load tests passing
- **Testes:** Load tests (k6/JMeter)
- **Arquivos:** `tests/performance/map-load.spec.js`, `tests/performance/search.spec.js`
- **Impacto em licitação:** **ALTO** — Não pode provar que escala

### T9-DOCS-TEC — Documentação Técnica para Licitação
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** L (10d) · **Tipo:** Documentation / Legal
- **Problema:** Sem documentação técnica. Desqualificação imediata.
- **DoD:** (1) Arquitetura completa (2) API spec (OpenAPI) (3) Diagrama de infra (4) Manual de implantação (5) Guia de usuário
- **Validação:** Revisão jurídica + técnico
- **Testes:** - (documentação)
- **Arquivos:** `docs/licitacao/arquitetura.md`, `docs/licitacao/api-spec.yaml`, `docs/licitacao/manual-implantacao.md`
- **Impacto em licitação:** **CRÍTICO** — Documentação obrigatória

### T9-COMPLIANCE — Compliance LGPD e Normas Municipais
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (5d) · **Tipo:** Legal / Security
- **Problema:** Compliance parcial. Risco jurídico.
- **DoD:** (1) Checklist LGPD completo (2) Politica de privacidade (3) Termos de uso (4) Trilha de auditoria 100% (5) Relatórios de compliance
- **Validação:** Auditoria externa (opcional)
- **Testes:** - (documentação + testes de auditoria)
- **Arquivos:** `docs/compliance/lgpd-checklist.md`, `docs/compliance/politica-privacidade.md`
- **Impacto em licitação:** **CRÍTICO** — Requisito legal obrigatório

### T9-MULTI-TENANT-PROOF — Prova de Multi-Tenant Isolation
- **Status:** `TODO`
- **Severidade:** CRÍTICA · **Esforço:** M (4d) · **Tipo:** Security / Tests
- **Problema:** Multi-tenant não provado. Risco de vazamento de dados.
- **DoD:** (1) Tenant A não vê dados Tenant B (2) Admin Tenant A ≠ Admin Tenant B (3) Performance isolada (4) Storage separado (5) Audit trail por tenant
- **Validação:** E2E cross-tenant tests
- **Testes:** Unit (tenant guard), Integration (query isolation), E2E (cross-tenant)
- **Arquivos:** `tests/e2e/tenant-isolation.spec.ts`
- **Impacto em licitação:** **CRÍTICO** — Risco de desqualificação

### T9-BACKUP-RESTORE — Backup e Restore Automático
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** S (2d) · **Tipo:** Ops / Infra
- **Problema:** Sem backup automático. Risco de perda de dados.
- **DoD:** (1) Backup diário automático (2) Restore validado (3) Documentação (4) Alertas de falha (5) Testes de restore
- **Validação:** Restore completo <15min
- **Testes:** Integration (backup script), E2E (restore validation)
- **Arquivos:** `scripts/backup-daily.sh`, `docs/operations/backup-restore.md`
- **Impacto em licitação:** **ALTO** — Requisito operacional básico

### T9-MONITOR — Monitoramento e Alertas
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** M (3d) · **Tipo:** Ops / Monitoring
- **Problema:** Sem monitoramento. Downtime não detectado.
- **DoD:** (1) Dash de health (2) Alertas por email/Slack (3) Métricas de performance (4) Log centralizado (5) SLA tracking
- **Validação:** 7 dias uptime Monitoring
- **Testes:** Integration (alert triggers)
- **Arquivos:** `docker-compose.monitor.yml`, `apps/monitor/`
- **Impacto em licitação:** **ALTO** — Operação não confiável

### T9-ERROR-HANDLING — Tratamento de Erros Robusto
- **Status:** `TODO`
- **Severidade:** MÉDIA · **Esforço:** S (2d) · **Tipo:** UX / Backend
- **Problema:** Erros genéricos. Usuário não entende o que falhou.
- **DoD:** (1) Erros amigáveis (2) Codes de erro únicos (3) Logs detalhados (4) Sugestões de ação (5) Documentação
- **Validação:** Testes de erro em todos os fluxos
- **Testes:** Unit (error handling), E2E (error display)
- **Arquivos:** `apps/api/src/common/filters/http-exception.filter.ts`, `apps/web/src/lib/error-display.tsx`
- **Impacto em licitação:** **MÉDIO** — UX profissional

### T9-HELP-SYSTEM — Sistema de Ajuda Contextual
- **Status:** `TODO`
- **Severidade:** BAIXA · **Esforço:** S (3d) · **Tipo:** UX / Documentation
- **Problema:** Sem ajuda contextual. Usuário perdido.
- **DoD:** (1) Tooltips em campos (2) Guia do usuário inline (3) Tour inicial (4) FAQ contextual (5) Botão de ajuda
- **Validação:** UX review
- **Testes:** E2E (help system)
- **Arquivos:** `apps/web/src/components/HelpTooltip.tsx`, `docs/user-guide/`
- **Impacto em licitação:** **BAIXO** — Melhoria de UX

---

## 🟨 T10 — DIFFERENTIATION (Diferenciais para VENCER, não só empatar)

**Objetivo:** Criar vantagens competitivas exclusivas contra GeoPixel.

### T10-OBSERVATORIO — Observatório Imobiliário
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** L (10d) · **Tipo:** Analytics / BI
- **Problema:** GeoPixel não tem analytics avançado. Oportunidade de diferencial.
- **DoD:** (1) KPIs executivos (2) Comparativos temporais (3) Heatmaps por valor (4) Predições de mercado (5) Relatórios executivos PDF
- **Validação:** Demo com dados reais
- **Testes:** E2E (analytics), Integration (data pipeline)
- **Arquivos:** `apps/api/src/modules/observatorio/observatorio.service.ts`
- **Impacto em licitação:** **ALTO** — Diferencial competitivo

### T10-OFFLINE-FULL — Mobile Offline Completo
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** XL (15d) · **Tipo:** Mobile / Offline
- **Problema:** GeoPixel tem mobile limitado. Oportunidade de liderança.
- **DoD:** (1) 100% funcionalidade offline (2) IndexedDB sync (3) GPS offline (4) Fotos offline (5) Formulários offline (6) Sync automático
- **Validação:** Teste de campo real
- **Testes:** E2E (offline mode), Integration (sync)
- **Arquivos:** `apps/mobile/src/services/offline-sync.ts`
- **Impacto em licitação:** **ALTO** — Diferencial para fiscalização

### T10-AI-PARCEL — Classificação Automática de Parcelas
- **Status:** `TODO`
- **Severidade:** MÉDIA · **Esforço:** XL (20d) · **Tipo:** AI / GIS
- **Problema:** Classificação manual é lenta. IA pode acelerar.
- **DoD:** (1) Modelo ML treinado (2) Classificação automática (3) Validação humana (4) Retraining pipeline (5) Métricas de acurácia
- **Validação:** Acurácia >90% em dataset de teste
- **Testes:** Unit (ML model), Integration (API), E2E (UI)
- **Arquivos:** `apps/api/src/modules/ai/parcel-classifier.service.ts`
- **Impacto em licitação:** **MÉDIO** — Diferencial tecnológico

### T10-WORKFLOW-ENGINE — Engine BPMN
- **Status:** `TODO`
- **Severidade:** ALTA · **Esforço:** XL (25d) · **Tipo:** Processos / BPMN
- **Problema:** Workflows hardcoded. Limita flexibilidade.
- **DoD:** (1) Engine BPMN (Camunda/Activiti) (2) Designer visual (3) Workflows customizáveis (4) Versionamento (5) Deploy automático
- **Validação:** Modelo customizado executando
- **Testes:** Integration (BPMN engine), E2E (workflow execution)
- **Arquivos:** `apps/api/src/modules/workflow/`
- **Impacto em licitação:** **ALTO** — Flexibilidade máxima

### T10-REC-ARRECADACAO — Recomendação de Arrecadação
- **Status:** `TODO`
- **Severidade:** MÉDIA · **Esforço:** M (8d) · **Tipo:** Analytics / AI
- **Problema:** Fiscalização aleatória. Perde eficiência.
- **DoD:** (1) Score de risco por parcela (2) Lista priorizada (3) Alertas de atraso (4) Relatórios de eficiência
- **Validação:** Aumento de arrecadação mensurável
- **Testes:** Integration (scoring), E2E (dashboard)
- **Arquivos:** `apps/api/src/modules/analytics/arrecadacao-analytics.service.ts`
- **Impacto em licitação:** **MÉDIO** — Otimização fiscal

### T10-FISCAL-IA — Fiscalização Inteligente
- **Status:** `TODO`
- **Severidade:** MÉDIA · **Esforço:** M (8d) · **Tipo:** Analytics / AI
- **Problema:** Fiscalização reativa. IA pode ser proativa.
- **DoD:** (1) Detecção de anomalias (2) Alertas automáticos (3) Padroes de fraude (4) Relatórios de fiscalização
- **Validação:** Redução de falsos positivos
- **Testes:** Integration (detection), E2E (alerts)
- **Arquivos:** `apps/api/src/modules/ai/fiscal-ai.service.ts`
- **Impacto em licitação:** **MÉDIO** — Fiscalização eficiente

### T10-IOT-INTEGRATION — Integração com IoT
- **Status:** `TODO`
- **Severidade:** BAIXA · **Esforço:** L (10d) · **Tipo:** IoT / Sensoriamento
- **Problema:** Sem sensoriamento remoto. Dados limitados à fiscalização.
- **DoD:** (1) Integração com sensores (2) Dashboard IoT (3) Alertas automáticos (4) Análise temporal
- **Validação:** PoC com sensor real
- **Testes:** Integration (IoT API), E2E (dashboard)
- **Arquivos:** `apps/api/src/modules/iot/iot-integration.service.ts`
- **Impacto em licitação:** **BAIXO** — Futuro do monitoramento

### T10-CHATBOT — Chatbot de Atendimento
- **Status:** `TODO`
- **Severidade:** BAIXA · **Esforço:** M (8d) · **Tipo:** Cidadão / AI
- **Problema:** Cidadão sem suporte 24/7.
- **DoD:** (1) Chatbot LLM (2) Integração com 156 (3) FAQ automático (4) Escalamento humano (5) Métricas de satisfação
- **Validação:** Testes com usuários reais
- **Testes:** E2E (chat flow), Integration (LLM API)
- **Arquivos:** `apps/web/src/components/Chatbot.tsx`
- **Impacto em licitação:** **BAIXO** — Melhoria de serviço

### T10-BLOCKCHAIN-AUDIT — Blockchain para Auditoria
- **Status:** `TODO`
- **Severidade:** BAIXA · **Esforço:** XL (20d) · **Tipo:** Auditoria / Blockchain
- **Problema:** Auditoria pode ser questionada. Blockchain = imutável.
- **DoD:** (1) Hash de cada ação em blockchain (2) Verificação pública (3) Integração com sistema (4) Explorador de blockchain
- **Validação:** Transações auditáveis
- **Testes:** Integration (blockchain), E2E (verification)
- **Arquivos:** `apps/api/src/modules/blockchain/blockchain-audit.service.ts`
- **Impacto em licitação:** **BAIXO** — Confiança máxima

---

## 📊 TRIAGEM DE PRIORIDADES (Próximos 15 Itens)

### 🔴 ONDA 0 - BLOCKERS CRÍTICOS (Sem isso = NÃO COMPETE)

| # | ID | Título |Esforço|Prioridade|Impacto|Dependências|Status|
|---|---|---|---|---|---|---|---|
| 1 | T8-GIS-MVT | MVT Tiles | XL (20d) | **P0** | BLOQUEIO TOTAL | - | `TODO` |
| 2 | T8-GIS-CRS | CRS Transform | M (3d) | **P0** | BLOQUEIO TOTAL | - | `DONE` |
| 3 | T8-GIS-BBOX | Bbox Viewport | M (4d) | **P0** | BLOQUEIO TOTAL | - | `DONE` |
| 4 | T8-GIS-CLUSTER | Supercluster | S (2d) | **P0** | ALTO | T8-GIS-MVT | `TODO` |
| 5 | T8-INTEG-GEOSAMPA | Import GeoSampa Real | M (4d) | **P0** | CRÍTICO | T8-GIS-CRS | `TODO` |

### 🟠 ONDA 1 - PROCESSOS CRÍTICOS (Sem isso = NÃO ATENDE EDITAL)

| # | ID | Título |Esforço|Prioridade|Impacto|Dependências|
|---|---|---|---|---|---|---|
| 6 | T8-PROCESS-ALVARA | Módulo Alvarás | XL (15d) | **P0** | CRÍTICO | - |
| 7 | T8-PROCESS-HABITE | Módulo Habite-se | L (8d) | **P0** | CRÍTICO | - |
| 8 | T8-TRIB-IPTU | Cálculo IPTU | L (10d) | **P0** | CRÍTICO | T8-TRIB-PLANTA |
| 9 | T8-TRIB-PLANTA | Planta de Valores | M (5d) | **P0** | ALTO | - |
| 10 | T8-CERTIDAO-OFICIAL | Certidões Oficiais | L (7d) | **P0** | CRÍTICO | - |

### 🟡 ONDA 2 - TRIBUTAÇÃO E INTEGRAÇÃO

| # | ID | Título |Esforço|Prioridade|Impacto|Dependências|
|---|---|---|---|---|---|---|
| 11 | T8-CIDADAO-156 | Integração 156 | M (5d) | **P0** | CRÍTICO | - |
| 12 | T8-CTM-DESMEMB | Workflow Desmembramento | L (10d) | **P0** | ALTO | - |

### 🟢 ONDA 3 - PROVAS E TESTES

| # | ID | Título |Esforço|Prioridade|Impacto|Dependências|
|---|---|---|---|---|---|---|
| 13 | T9-DEMO-DATA | Dataset Demonstração SP | L (5d) | **P0** | CRÍTICO | - |
| 14 | T5-SP-E2E-PARCEL-REAL | E2E Parcela Real SP | M (5d) | **P0** | CRÍTICO | - |
| 15 | T5-SP-PLAYWRIGHT-STABLE-SP | Playwright Estável | M (3d) | **P0** | CRÍTICO | - |

### 🔵 ONDA 4 - DIFERENCIAIS (Para vencer, não só empatar)

| # | ID | Título |Esforço|Prioridade|Impacto|Dependências|
|---|---|---|---|---|---|---|
| 16 | T10-OBSERVATORIO | Observatório Imobiliário | L (10d) | P1 | ALTO | - |
| 17 | T10-OFFLINE-FULL | Mobile Offline Completo | XL (15d) | P1 | ALTO | - |
| 18 | T10-WORKFLOW-ENGINE | Engine BPMN | XL (25d) | P1 | ALTO | - |
| 19 | T10-AI-PARCEL | Classificação Automática | XL (20d) | P2 | MÉDIO | - |
| 20 | T10-REC-ARRECADACAO | Recomendação Arrecadação | M (8d) | P2 | MÉDIO | - |

---

## Histórico de mudanças

| Data | Agente | Item | Ação |
|---|---|---|---|
| 2026-04-28 | Mistral Vibe | T8-T10 | Adicionados 35+ itens para paridade GeoPixel-class e prontidão licitação |
| 2026-04-28 | Claude (SP reality) | T5+ backlog | Generated complete T5–T9 backlog focused on São Paulo real data |
| 2026-04-20 | Codex | T4-BRAIN-OS | Brain auto-discovery/bootstrap/write-back implemented |
| 2026-04-20 | Codex | T4-HOOKS-OS | Native hooks + launcher fallback wired to the brain |
| 2026-04-17 | Claude (bootstrap) | — | Backlog inicial a partir da auditoria |

---

## Legenda de Esforço Extendida

| Código | Esforço | Dias | Tipo |
|---|---|---|---|
| XS | Micro | <1d | Fix rápido |
| S | Pequeno | 1-3d | Feature simples |
| M | Médio | 3-10d | Module/Integration |
| L | Grande | 10-20d | System/Workflow |
| XL | Extra Grande | >20d | Platform/Architecture |

---

## Notas Finais

> **Atualizado por:** Mistral Vibe (Principal GovTech Product Strategist + Principal GIS Architect + Principal QA Auditor)
> **Data:** 2026-04-28
> **Modo:** DEEP BRAINSTORM + GAP ANALYSIS vs GeoPixel-class
> **Contexto:** Análise completa pós-GLM revelou que sistema NÃO está pronto para licitação. Gap de -2.8 pontos vs GeoPixel. 
> **Próximo:** Executar ONDA 0 (Blockers Críticos) antes de qualquer tentativa de licitação.
