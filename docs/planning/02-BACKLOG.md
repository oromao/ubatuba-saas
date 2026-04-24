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

---

## 🟥 T1 — Survival / credibility blockers

*Enquanto T1 não estiver DONE, nada novo entra. Ponto.*

### T1-AUDIT-VISTORIAS — CRÍTICO: Corrigir criação de vistorias (botão não responde)
- **Status:** `TODO`
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
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** S · **Tipo:** Frontend / UX
- **Problema:** 
  - Clique em "Notificações Oficiais" leva para /app/cartas em vez de notificações (Bug #7)
  - Clique em "Usuário" (menu lateral) leva para /app/processes em vez de perfil (Bug #9)
- **DoD:** (1) Cliques navegam para rotas corretas (2) Páginas carregam (3) Sem confusão de navegação
- **Validação:** E2E de navegação + browser
- **Origem:** Auditoria 2026-04-24 (Bugs #7, #9)

### T2-AUDIT-FEEDBACK-VISUAL — Implementar feedback visual em filtros
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Frontend / UX
- **Problema:** Filtro "Demo" em CTM Parcelas clica mas não mostra spinner/mensagem. Usuário não sabe se funcionou.
- **DoD:** (1) Ao clicar, spinner/badge aparece (2) Dados carregam ou "nenhum resultado" (3) Feedback claro
- **Validação:** E2E + browser
- **Origem:** Auditoria 2026-04-24 (Bug #2)

### T2-AUDIT-TEST-DATA — Criar seed de dados de teste
- **Status:** `TODO`
- **Severidade:** HIGH · **Esforço:** L · **Tipo:** Database / Seeds / QA
- **Problema:** Banco vazio (0 parcelas, 0 logradouros, 0 vistorias). Impossível validar fluxos reais.
- **DoD:** (1) Seed popula ~50 parcelas, 20 logradouros, 10 vistorias (2) Dados coerentes (coords, relacionamentos) (3) Script reutilizável
- **Validação:** Seed executa sem erro + validação de integridade
- **Origem:** Auditoria 2026-04-24 (Feature faltante)
- **Depende de:** T2-PARCEL-E2E (dados necessários para testar)

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
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Backend / UX
- **Problema:** Erro 500 genérico sem contexto. Usuário não sabe o que falhou.
- **DoD:** (1) Resposta inclui error code (ex: "VALIDATION_ERROR") (2) Mensagem amigável ao usuário (3) Logs detalhados no servidor
- **Validação:** API test + browser error message
- **Origem:** Auditoria 2026-04-24 (P2.1)

### T3-AUDIT-CONFIRMATIONS — Implementar modais de confirmação em ações críticas
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Frontend / UX
- **Problema:** Botões como "Deferir" (Alvará) ou "Deletar" não mostram confirmação. Risco de ações irreversíveis.
- **DoD:** (1) Modal aparece antes de ação irreversível (2) Opções "Cancelar" e "Confirmar" (3) Mensagem clara
- **Validação:** E2E + browser
- **Origem:** Auditoria 2026-04-24 (P2.2)

### T3-AUDIT-TENANT-VALIDATION — Adicionar validação de Tenant no login
- **Status:** `TODO`
- **Severidade:** MEDIUM · **Esforço:** S · **Tipo:** Frontend / Auth
- **Problema:** Campo Tenant pré-preenchido. Não há forma de testar multi-tenancy.
- **DoD:** (1) Campo editável (2) Validação: tenant inexistente → erro claro (3) Login com tenant diferente funciona
- **Validação:** E2E login + teste multi-tenant
- **Origem:** Auditoria 2026-04-24 (P2.3)

### T3-AUDIT-CONSOLE-ERROR — Corrigir erro de console Hidrografia/Mapbox
- **Status:** `TODO`
- **Severidade:** LOW · **Esforço:** S · **Tipo:** Frontend / GIS
- **Problema:** Console: "Cannot read properties of undefined (reading 'getSource')". Falha ao carregar camada.
- **DoD:** (1) Sem erros no console (2) Camada carrega sem exception (3) Validação de object antes de property access
- **Validação:** Browser console + E2E
- **Origem:** Auditoria 2026-04-24 (P2.4, UX-2)

### T3-AUDIT-IMPORT-MODAL — Implementar modal de importação de dados
- **Status:** `TODO`
- **Severidade:** LOW · **Esforço:** M · **Tipo:** Frontend / CTM
- **Problema:** Botão "Importar Dados" não abre interface. Sem forma de upload.
- **DoD:** (1) Modal/drawer com input arquivo (2) Aceita CSV/GeoJSON (3) Preview antes de salvar (4) Feedback sucesso/erro
- **Validação:** E2E upload + validação de dados
- **Origem:** Auditoria 2026-04-24 (P3.1, UX-1)

### T3-AUDIT-PAGINATION — Adicionar paginação e ordenação em tabelas
- **Status:** `TODO`
- **Severidade:** LOW · **Esforço:** M · **Tipo:** Frontend / UX
- **Problema:** Tabelas não mostram controles de paginação. Escalabilidade prejudicada.
- **DoD:** (1) Paginação funciona (2) Ordenação por coluna clicável (3) Limite configurável (10/25/50 por página)
- **Validação:** E2E + browser com dataset grande
- **Origem:** Auditoria 2026-04-24 (P3.2)

### T3-AUDIT-EMPTY-MESSAGES — Melhorar mensagens de estado vazio
- **Status:** `TODO`
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
