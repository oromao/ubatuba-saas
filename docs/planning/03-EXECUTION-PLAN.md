# 03 — Execution Plan

> Estado **vivo** do que está sendo executado agora.
> Atualize ao iniciar e ao encerrar cada sessão.
> **Última atualização:** 2026-04-28 por Mistral Vibe (Diagnóstico Completo Pós-GLM)

---

## 🎯 VISÃO GERAL ESTRATÉGICA

**Objetivo Final:** Alcançar **NÍVEL PRIME** (paridade GeoPixel-class + diferenciais) para competir e VENCER licitações municipais.

**Status Atual:** ❌ **NÃO PRONTO PARA LICITAÇÃO** (Score: 20.5/100)

**Gap vs GeoPixel:** -2.8 pontos (escala 0-5) across 14 domínios

**Estratégia:** Executar em 4 Ondas sequenciais até atingir prontidão mínima (70/100).

---

## 📅 LINHA DO TEMPO ESTRATÉGICA

### Fase 1: SUPERVIVÊNCIA (Já Concluída - T1+T2)
- ✅ First Execution Package (T1+T2) DONE
- ✅ System opera em modo básico sem crash
- ✅ Roteamento e navegação funcionando

### Fase 2: PRONTIDÃO MÍNIMA (Próximos 6 meses)
- **ONDA 0:** Blockers Críticos (4 semanas) → Score 40/100
- **ONDA 1:** Processos Críticos (8 semanas) → Score 60/100  
- **ONDA 2:** Integração e Tributação (4 semanas) → Score 65/100
- **ONDA 3:** Provas e Testes (4 semanas) → Score 70/100 ✅ **PRONTO PARA LICITAÇÃO**

### Fase 3: DIFERENCIAÇÃO (Paralelo - 6 meses)
- **ONDA 4:** Diferenciais Competitivos (T10) → VANTAGEM para vencer

### Fase 4: EXCELÊNCIA (Contínuo)
- Otimização contínua
- Novos módulos (Cemitério, Obras, etc.)
- Expansão para outros municípios

---

## 🚀 SPINT ATUAL (ONDA 0 - BLOCKERS CRÍTICOS)

**Janela:** `2026-04-28 → 2026-05-28` (4 semanas)
**Foco:** Resolver BLOCKERS IMPEDITIVOS para licitação
**Objetivo de sprint:** Alcançar **40/100** no score geral (hoje: 20.5/100)

### Itens em Execução (ONDA 0)

| # | ID | Título | Agente | Iniciado | Status | Prioridade |
|---|---|---|---|---|---|---|
| 1 | T8-GIS-CRS | CRS Transform UTM↔WGS84 | - | - | TODO | **P0** |
| 2 | T8-GIS-BBOX | Endpoint Bbox Viewport | - | - | TODO | **P0** |
| 3 | T8-GIS-MVT | MVT Tiles | - | - | TODO | **P0** |
| 4 | T8-GIS-CLUSTER | Supercluster | - | - | TODO | **P0** |
| 5 | T8-INTEG-GEOSAMPA | Import GeoSampa Real | - | - | TODO | **P0** |

**Meta ONDA 0:** 5 itens críticos em progresso → Reduzir risco de BLOQUEIO TOTAL

---

## 📋 SPRINTS PRÓXIMOS

### Sprint 2: ONDA 1 - Processos Críticos (2026-05-28 → 2026-07-25)
**Objetivo:** Implementar módulos de processos essenciais para licitação
**Meta:** Alcançar **60/100** (Score: Processos + Tributação)

| # | ID | Título | Esforço | Prioridade |
|---|---|---|---|---|
| 1 | T8-PROCESS-ALVARA | Módulo Alvarás | XL (15d) | **P0** |
| 2 | T8-PROCESS-HABITE | Módulo Habite-se | L (8d) | **P0** |
| 3 | T8-TRIB-PLANTA | Planta de Valores | M (5d) | **P0** |
| 4 | T8-TRIB-IPTU | Cálculo IPTU | L (10d) | **P0** |
| 5 | T8-CERTIDAO-OFICIAL | Certidões Oficiais | L (7d) | **P0** |

### Sprint 3: ONDA 2 - Integração (2026-07-25 → 2026-08-22)
**Objetivo:** Integração com sistemas externos
**Meta:** Alcançar **65/100**

| # | ID | Título | Esforço | Prioridade |
|---|---|---|---|---|
| 1 | T8-CIDADAO-156 | Integração 156 | M (5d) | **P0** |
| 2 | T8-CTM-DESMEMB | Workflow Desmembramento | L (10d) | **P0** |
| 3 | T8-GIS-MULTIPOLYGON | MultiPolygon Complexo | S (2d) | P1 |
| 4 | T7-SP-ADDRESS-CANONIZER | Canonizador Endereços | M (2d) | P1 |
| 5 | T7-SP-IPTU-MATCH | Match IPTU-SP | M (3d) | P1 |

### Sprint 4: ONDA 3 - Provas (2026-08-22 → 2026-09-19)
**Objetivo:** Provar que tudo funciona com dados reais
**Meta:** Alcançar **70/100** ✅ **PRONTO PARA LICITAÇÃO**

| # | ID | Título | Esforço | Prioridade |
|---|---|---|---|---|
| 1 | T9-DEMO-DATA | Dataset Demonstração SP | L (5d) | **P0** |
| 2 | T5-SP-E2E-PARCEL-REAL | E2E Parcela Real SP | M (5d) | **P0** |
| 3 | T5-SP-PLAYWRIGHT-STABLE-SP | Playwright Estável | M (3d) | **P0** |
| 4 | T5-SP-UNIT-CRITICAL | Unit Tests Críticos | M (5d) | **P0** |
| 5 | T5-SP-INTEGRATION-IMPORT | Import Deduplicação | M (4d) | **P0** |
| 6 | T9-PERF-BASE | Performance Baseline | M (4d) | P0 |
| 7 | T9-SEC-AUDIT | Auditoria Segurança | M (5d) | **P0** |
| 8 | T9-MULTI-TENANT-PROOF | Multi-tenant Isolation | M (4d) | **P0** |

---

## 🎯 DEFINIÇÃO DE PRONTO (DoD - Definition of Done)

### Para TODOS os Itens:
- [ ] Código funciona (UI → API → DB)
- [ ] Testes automatizados passando
- [ ] Documentação atualizada
- [ ] Validação de Paulo (ou delegado)
- [ ] Prova de runtime real (NÃO mock)
- [ ] Atualização no 01-MATURITY-MATRIX.md
- [ ] Atualização no 04-PROGRESS-LOG.md

### Para Itens Críticos (P0):
- [ ] E2E completo com dados reais
- [ ] Testes de performance
- [ ] Auditoria de segurança
- [ ] Validação em 2+ navegadores

### Para Módulos Novos:
- [ ] Smoke tests
- [ ] Unit tests (>70% coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Documentação de API (OpenAPI)
- [ ] Documentação de usuário

---

## 🔥 DECISÕES ARQUITETURAIS PENDENTES (Precisam do Paulo)

| # | Decisão | Impacto | Prioridade | Status |
|---|---|---|---|---|
| 1 | **Stack MVP para licitação** | Definir se focamos em T8 (paridade) ou T8+T10 (diferenciais) | **CRÍTICA** | ⚠️ PENDENTE |
| 2 | **Orçamento de desenvolvimento** | Alocar recursos para ONDA 0 (5 itens, ~43 dias-homem) | **CRÍTICA** | ⚠️ PENDENTE |
| 3 | **Parceria com consultoria** | Para compliance LGPD e documentos oficiais | **ALTA** | ⚠️ PENDENTE |
| 4 | **Stack de BPMN** | Camunda vs Activiti vs Custom para T10-WORKFLOW-ENGINE | **MÉDIA** | ⚠️ PENDENTE |
| 5 | **Desde de dados real** | GeoSampa vs São Paulo completa vs dataset sintético | **ALTA** | ⚠️ PENDENTE |

---

## 📊 MÉTRICAS DE SUCESSO

### Score Geral (0-100)
```
Atual:     20.5/100  ❌ NÃO PRONTO
ONDA 0:    40/100   ⚠️ PARCIAL
ONDA 1:    60/100   ⚠️ PARCIAL
ONDA 2:    65/100   ⚠️ PARCIAL  
ONDA 3:    70/100   ✅ PRONTO PARA LICITAÇÃO
T10:       85+/100  🏆 DIFERENCIAL COMPETITIVO
```

### Métricas Específicas
| Métrica | Alvo ONDA 0 | Alvo ONDA 3 | Atual |
|---|---|---|---|
| GIS Funcional | ✅ MVT+CRS+Bbox | ✅ Cluster+MultiPolygon | ❌ trưởng |
| CTM Completo | 6/10 features | 10/10 features | 6/10 |
| Processos | 0 modules | 5+ modules | 0 |
| Tributação | Mock | Real | Mock |
| Testes | - | 70%+ coverage | ~30% |
| Performance | - | <2s map load | Unknown |
| Multi-tenant | - | 100% proved | ❌ |

---

## 🚨 RISCOS E CONTINGÊNCIAS

### Riscos de Alto Impacto

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| 1 | **Falha em resolver blockers** | Média | **CATASTRÓFICO** | Sprint dedicado ONDA 0 |
| 2 | **Dados SP não disponíveis** | Alta | **CRÍTICO** | Usar dataset sintético + adaptador |
| 3 | **Orçamento insuficiente** | Média | **CRÍTICO** | Priorizar T8, adiar T10 |
| 4 | **Equipe sobrecarregada** | Alta | **ALTO** | Contratar consultor especializado |
| 5 | **Mudança em requistos de licitação** | Baixa | **ALTO** | Monitorar editais Novamente |

### Plano de Contingência

Se **ONDA 0 não completar em 4 semanas:**
1. Estender sprint por 2 semanas
2. Reduzir escopo (ex: adiar T8-GIS-MVT para T8-GIS-BBOX + GeoJSON otimizado)
3. Buscar ajuda externa (consultoria GIS especializada)

Se **Orçamento insuficiente:**
1. Priorizar apenas ONDA 0 + ONDA 3 (blockers + provas)
2. Adiar diferenciais (T10) para mencapai fase 2
3. Focar em prefeituras pequenas (<50k parcelas)

---

## ✅ CHECK-IN DE FINAL DE SPRINT

### Sprint atual (2026-04-28 → 2026-05-28) - ONDA 0

- **Itens entregues:** (a preencher)
- **Itens movidos para próximo sprint:** (a preencher)
- **Mudanças na matriz de maturidade:** (a preencher)
- **Decisões tomadas:** (a preencher)
- **Lições aprendidas:** (a preencher)
- **Score atualizado:** (a preencher)

---

## 📚 REFERÊNCIAS

- [01-MATURITY-MATRIX.md](./01-MATURITY-MATRIX.md) - Scorecard completo
- [02-BACKLOG.md](./02-BACKLOG.md) - Itens detalhados T8-T10
- [04-PROGRESS-LOG.md](./04-PROGRESS-LOG.md) - Histórico de progresso
- [05-CLEANUP-INVENTORY.md](./05-CLEANUP-INVENTORY.md) - Inventário de limpeza
- [06-TESTING-STRATEGY.md](./06-TESTING-STRATEGY.md) - Estratégia de testes
- [11-GAP-ANALYSIS-PRIME.md](./11-GAP-ANALYSIS-PRIME.md) - Diagnóstico completo (novo)

---

## 💡 NOTAS FINAIS

> **Atualizado por:** Mistral Vibe (Principal GovTech Product Strategist + Principal GIS Architect + Principal QA Auditor)
> **Data:** 2026-04-28
> **Modo:** DEEP BRAINSTORM + GAP ANALYSIS vs GeoPixel-class
> **Contexto:** Esta análise revelou que FlyDea está ** ~6 meses de distância** de competir com GeoPixel em licitações.
> **Próxima Ação:** Executar **ONDA 0** de forma **DEDICADA** e **FOCADA**. Nada novo entra até ONDA 0 estar 100% completa.

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
