# E2E Current State (Playwright)

## 1) Estado atual do Playwright
- Config principal: `/Users/paulo/sass/playwright.config.js`
- Runner: `@playwright/test`
- TestDir: `poc/checks`
- Match: `**/*.spec.js`
- Evidências no runner:
  - trace: `retain-on-failure`
  - video: `retain-on-failure`
  - screenshot: `only-on-failure`
  - artifacts: `test-results/artifacts`
  - relatório HTML: `playwright-report`
  - relatório JSON: `test-results/playwright-report.json`

## 2) Estrutura de testes encontrada
- Spec Playwright (runner):
  - `/Users/paulo/sass/poc/checks/browser-functional.spec.js`
  - `/Users/paulo/sass/poc/checks/roles-smoke.spec.js`
- Suites E2E/QA por script Playwright API (Node):
  - `/Users/paulo/sass/poc/checks/run-browser-functional.mjs`
  - `/Users/paulo/sass/poc/checks/run-full-qa-licitacao.mjs`
  - `/Users/paulo/sass/poc/checks/run-daily-user-workflow-live.mjs`

## 3) Como rodar local
- Smoke por perfil (Playwright Test):
  - `npm run e2e:smoke`
- Requisitos automatizáveis (suite completa):
  - `npm run e2e:requirements`
- Inventário de UI:
  - `npm run e2e:ui-inventory`
- Pacote de relatório completo:
  - `npm run e2e:report`

## 4) Como rodar em CI
- Mínimo recomendado:
  - `npm run e2e:smoke`
  - `npm run e2e:requirements`
- Observação:
  - Em ambientes headless sem suporte WebGL/GPU, os checks de mapa podem falhar por contexto gráfico.
  - Para execução estável de mapa, usar browser visível (`PW_HEADLESS=false`) no agente com display.

## 5) Estratégia de login atual
- Suites completas (`run-full-qa-licitacao.mjs`, `run-daily-user-workflow-live.mjs`):
  - login API para bootstrap de perfis
  - criação de usuários/memberships por execução
  - sessão UI por perfil com limpeza de cookies/localStorage
- Smoke por perfil (`roles-smoke.spec.js`):
  - login via API e injeção de tokens em localStorage para navegação rápida

## 6) Perfis cobertos e alternância
- Perfis: `ADMIN`, `GESTOR`, `OPERADOR`, `CAMPO` (OPERADOR para campo), `LEITOR`
- Alternância:
  - por credentials isoladas por perfil (geradas com `runId`)
  - sessão limpa antes de cada login UI

## 7) Cobertura atual (alto nível)
- Já coberto:
  - autenticação/multitenancy
  - navegação principal por perfil
  - CTM (parcelas/logradouros/mobiliário)
  - PGV (zonas/faces/fatores/versões/cálculo/impacto/exports)
  - levantamentos RGB + LiDAR
  - mobile sync
  - integrações tributárias
  - cartas/notificações
  - compliance
  - PoC score
  - matriz de permissões por perfil
- Gaps residuais:
  - cobertura runner-based para alguns fluxos profundos ainda depende mais das suites scriptadas do que specs curtas por tela
  - requisitos de cloud real (deploy em ambiente remoto) permanecem com validação principalmente documental/manual
