# 04 — Progress Summary

> Resumo consolidado do progresso real. Use este arquivo para uma visão rápida.
> O log detalhado histórico continua em `04-PROGRESS-LOG.md`.
> Última atualização: `2026-05-22` por `Antigravity (Demo Seed Ingestion QA-005)`

---

## 1. Estado Atual

- **Fase:** Municipal-Grade (T8/T9/T10 — GeoSampa sprint).
- **Maturidade real estimada:** ~73% (reajustado em 2026-05-14 — peso de segurança/infra estava sub-representado). Harness 5/5.
- **Demo live:** http://172.233.188.166:3000
- **Login:** admin@demo.local / Admin@12345 / tenant: demo
- **Parcelas no banco:** 330 (300 SP importadas + 30 demo originais)

---

## 2. Itens DONE (Confiáveis / Municipal-Grade)

- **QA-011-OBSERVATORY-VALUATIONS:** Corrigido schema PGV no demo seed — valuations agora usam `parcelId` + `versionId` no lugar de `sqlu`, elevando cobertura do observatório de ~2% para 100% na demo. 28 testes verdes.
- **QA-005-DEMO-SEED-INGESTION:** Ingestao de dados reais consistentes e geograficamente coerentes para 18 colecoes sob o tenant demo no MongoDB, eliminando "empty states" e alimentando as telas de 8+ modulos adicionais na demonstracao.
- **QA-001-DASHBOARD-RESILIENCE:** Blindagem total a falhas concorrentes e timeouts nos stubs/queries das APIs de KPIs do Dashboard no NestJS, e correção cirúrgica de tipos TypeScript no `permits-works`. 5 testes unitários Jest verdes comprovando resiliência.
- **T10-DASHBOARD-GRAPHS:** Componentes dinâmicos e responsivos `<DonutChart />` e `<HorizontalBarChart />` desenvolvidos usando SVG puro e Tailwind (zero libs externas pesadas) e integrados com sucesso ao painel executivo (CTM, secretarias e saúde de satélites).
- **T1-AUDIT-FIXES:** Botões de vistorias, rotas 404 e redirecionamentos corrigidos e provados via Playwright.
- **T1-HYDRATION:** Eliminação de telas brancas e loaders infinitos no menu principal.
- **T2-GIS-SCALE:** Mapa aguenta 10k+ geometrias (testado via seed de 10k).
- **T8-GIS-CRS:** Conversão de coordenadas UTM/WGS84 operacional.
- **T8-GIS-BBOX:** Carregamento de dados por viewport (bbox) funcionando.
- **T5-SP-UNIT:** 84% cobertura de testes unitários no GisService (>70% target).
- **T8-GIS-MVT:** MVT Vector Tiles implementado com geojson-vt + vt-pbf. 7 testes.
- **T8-TRIB-IPTU:** Engine de cálculo IPTU: valor venal (PGV) × alíquota (zona). 8 testes.
- **T8-PROCESS-ALVARA:** Alvarás com parcelId, certidão auto, 13 testes. PARTIAL (falta assinatura digital).
- **T9-OVERVIEW-PDF:** Documento comercial/técnico premium compilado em PDF com screenshots de alta fidelidade obtidos em http://labspaulo.site/.

---

## 3. Itens PARTIAL (Funciona mas falta critério)

- **T2-MULTI-TENANT:** Isolamento básico existe mas falta prova de estresse e penetração.
- **T2-PARCEL-E2E:** Busca e detalhe funcionam, mas edição com dados reais complexos (SP) ainda instável.
- **T3-CITIZEN:** Portal 156 funcional mas sem integração com sistema nacional.

---

## 4. Falsos Positivos Conhecidos (Fake/Mock)

- **Tributação (IPTU/PGV):** Atualmente usa dashboard baseado em estatísticas de seed; falta o engine de cálculo real.
- **Auditoria:** Existe a página mas o audit trail não cobre 100% das ações de escrita no banco.
- **Mobile:** Página `/mobile` existe mas o sync offline total não foi provado com 50k+ itens.

---

## 5. Rebaixamentos de Maturidade (Cleanup Phase)

Os seguintes domínios foram rebaixados de 4 para 2/1 por não atenderem ao critério **Municipal-Grade**:
- **GIS:** Rebaixado até que MVT Tiles esteja funcional.
- **Processos:** Rebaixado até que alvarás tenham assinatura digital.
- **Tributação:** Rebaixado até que o cálculo seja baseado em lei municipal real.

---

## 6. Próximos 5 Itens (Short-term focus)

1. `T10-SHP-IMPORT` (Importação Shapefile) — EM EXECUÇÃO
2. `T8-PROCESS-ALVARA` (Assinatura digital + PDF completo)
3. `T9-API-CONTRACT` (Documentação OpenAPI/Swagger)
4. `T9-OBSERVABILITY` (Logs centralizados e Alertas)
5. `T8-GIS-CLUSTER` (Agrupamento visual de parcelas)

---

## 7. Últimas Provas Importantes

- **Data:** 2026-04-28
- **Prova:** Playwright smoke test passou em 30 rotas.
- **Evidência:** `tests/e2e/fullscan/menu-smoke.spec.ts`

---

## 8. Multiagent Status (Coordination)

- **Active Locks File:** `docs/planning/11-ACTIVE-LOCKS.md`
- **Current Rule:** Check and create a lock before writing any code or docs.
- **Isolation:** One Writer per task; avoid editing locked files/modules.
- **Stale Lock Threshold:** 4 hours.
- **Parallel Work:** Safe for independent modules (e.g., CTM vs Reurb).

## 9. Harness Status (AI Coordination Layer)

- **Maturity:** REAL (5/5) — 11 agentes, 7 queues, 12 pipelines, cobertura total de domínios
- **Agentes:** 3 domínios novos — GIS Guardian, DevOps Guardian, Compliance Guardian
- **Bus CLI:** `.ai/harness.sh` — start, agent, send, queue, pipeline, status, validate
- **Queues:** 7 (pipeline.default, alerts, tasks, planning.sync, gis.operations, infra.deploy, compliance.audit)
- **Pipelines:** 12 (inclui GIS: deploy, CRS; Infra: deploy, rollback; Compliance: audit, LGPD clean)
- **Planning Bridge:** `.ai/runtime/planning-bridge.sh` — sync harness events ↔ planning docs
- **DLQ:** Dead Letter Queue automática para mensagens não processadas
- **Cobertura:** Governance + GIS + DevOps + Compliance + Negócio + Execução + QA

---

> Nota: Este arquivo é atualizado ao final de cada sprint.
