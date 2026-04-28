# 03 — Execution Plan

> Estado **vivo** do que está sendo executado agora.
> Atualize ao iniciar e ao encerrar cada sessão.

---

## Sprint atual

**Janela:** `2026-04-28 → 2026-05-12` (segundo sprint pós-bootstrap)
**Foco:** T1+T2 DONE; T5+ inicia com dados reais SP
**Objetivo de sprint:** First Execution Package fechado. Classificação de rotas atualizada. Próximo: T5 (dados reais SP).

## Meta work completed

- `T4-BRAIN-OS` entrou em `DONE`: o brain agora faz auto-discovery do projeto, bootstrap de sessão e write-back de memória sem setup manual.
- `T4-HOOKS-OS` entrou em `DONE`: Claude Code e Codex passam a acionar bootstrap/write-back por hooks nativos; Gemini e app/workspace flows têm launcher/instruções de entrada apontando para o brain.
- `T4-ENV-DOCKER` entrou em `DONE`: o compose de desenvolvimento foi reconstruído após limpeza controlada do host Docker, `api-dev` e `web-dev` sobem juntos e o Next responde no container sem `/_next/static/chunks` 404 na prova browser.
- `T4-AUDIT` entrou em `DONE`: o `_document` legado foi arquivado, o browser local passou a falar direto com `http://localhost:4000` em vez do proxy `/api`, e as provas `citizen-proof` + `public-login-noise` voltaram a passar no compose estabilizado.
- `T4-API-URL-HARDEN` entrou em `DONE`: a URL da API do frontend ficou explícita e consistente, os fallbacks silenciosos do badge/formulários foram removidos e as provas browser/API reais voltaram a bater no backend sem depender de rewrite implícito.
- O fluxo de execução continua no sprint atual do produto; esta camada meta só torna o arranque e a persistência automáticos.

## Em execução agora

| Item | Agente | Iniciado em | Nota |
|---|---|---|---|
| — | — | — | First Execution Package (T1+T2) DONE. Hard pause para revisão do Paulo. |

## Deploy status

- VPS `172.233.188.166` está respondendo em `api` e `web`.
- `api` ficou saudável após a correção da healthcheck do compose.
- `nginx` está ativo na borda pública e o smoke HTTP retorna `200 OK`.
- `T3-EMPTY-STATES` ganhou mais uma prova estável: o erro do `monitoramento` agora sobe via `fetch` stub no browser, não só por empty state.
- `T3-DASH-PROOF` também ganhou prova estável do card de erro do painel executivo, com backend simulado no browser.

## Próximos na fila (ordem de ataque)

1. **T5-SP-SMOKE-ALL-ROUTES** — TODO (smoke 30+ rotas com dados reais SP)
2. **T5-SP-E2E-PARCEL-REAL** — TODO (parcel E2E com MultiPolygon real SP)
3. **T5-SP-INTEGRATION-IMPORT** — TODO (import deduplicação)
4. **T5-SP-UNIT-CRITICAL** — TODO (unit tests críticos)
5. **T5-SP-PLAYWRIGHT-STABLE-SP** — TODO (Playwright stability)
6. **T6-SP-GIS-BBOX-VIEWPORT** — TODO (viewport-based loading)
7. **T6-SP-GIS-TILE-MVT** — TODO (MVT tiles)
8. **Remaining FIX routes**: `/app/pgv/fatores`, `/app/certidoes`, `/app/alerts`, `/app/modulos/obras-publicas`, `/app/modulos/cemiterio` — precisa E2E proof ou HIDE
9. **T2-AUDIT-TEST-DATA** — BLOCKED (L-effort, deferred)

## Bloqueios atuais

| Item | Bloqueado por | Desde | Responsável | Status |
|---|---|---|---|---|
| T1-DEVSERVER | Cold start do compose podia expirar antes do health | 2026-04-20 | Codex | DONE; Colima ativo, compose up e /health OK |
| T2-PARCEL-E2E (exec) | E2E infra (backend/frontend not accessible) | 2026-04-17 | — | Tests written; awaiting infra |
| T2-INSPECT-E2E (exec) | E2E infra | 2026-04-17 | — | DONE; create/status/history/link proved |
| T2-TAX-INTEG (exec) | E2E infra | 2026-04-17 | — | DONE; dashboard and parcel stats match |
| T2-REPORTS (exec) | E2E infra | 2026-04-17 | — | DONE; PDF bytes validated after UI click |

## Decisões arquiteturais pendentes (precisam do Paulo)

- [ ] Definir se rotas sem prova saem do nav principal ou do repo (hide vs archive).
- [ ] Definir stack oficial de E2E (Playwright é o implícito — confirmar).
- [ ] Definir dataset real vs sintético para teste de GIS em escala (T3-GIS-SCALE).
- [ ] Definir critério de "dataset de teste" para T3-IMPORT-PROOF.
- [x] `T3-CITIZEN` já saiu do eixo de blocos; próxima prioridade volta para o backlog de T3/T4.

## Check-in de final de sprint (preencher em 2026-05-01)

- Itens entregues:
- Itens movidos para próximo sprint:
- Mudanças na matriz de maturidade:
- Decisões tomadas:
- Lições aprendidas:

---

## Mesclado de `docs/executable-roadmap-sprints.md` em 2026-04-17

- Sprint 0: estabilização da base bootável e testável.
- Sprint 1: confiança institucional, handoff e prova de RBAC/sessão.
- Objetivo útil para refinar ordem do sprint atual sem criar um roadmap paralelo.

## Fechamento desta sessão

- Arquivos conflitantes foram classificados, mesclados ou arquivados.
- `T4-ENV-DOCKER` ficou `DONE`; o Docker de desenvolvimento voltou a subir com `web-dev` e `api-dev` juntos, e a prova browser não registrou `/_next/static/chunks` 404.
- `T4-AUDIT` ficou `DONE`; o legado `_document` foi arquivado, o browser local passou a falar direto com `http://localhost:4000`, e as provas `citizen-proof` + `public-login-noise` voltaram a passar sem 404/hydration regressions.
- A próxima sessão deve retomar pelo topo do backlog vivo, com o brain carregado automaticamente pelos hooks nativos sempre que a ferramenta permitir.
