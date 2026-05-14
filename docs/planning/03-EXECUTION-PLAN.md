# 03 — Execution Plan

> Plano de execução vivo. Fonte primária para a próxima tarefa de qualquer agente.
> ÚLTIMA REVISÃO: `2026-05-01` por `OpenCode (GeoSampa sprint)`

---

## 1. Estado Atual Consolidado

- **Maturidade (Weighted):** 73% (reajustado — superestimativa anterior de segurança/infra)
- **Harness Maturity:** REAL (5/5) — 11 agentes (gov+GIS+devops+compliance), 7 queues, 12 pipelines, 17 testes
- **Backlog Status:** 30+ itens DONE. Nova fase: GeoSampa + Demo Real.
- **Blockers:** Playwright E2E (3 testes quebrados), PDF templates oficiais, SHP import.
- **Infra:** Docker-dev estável; 155 unit tests; 330 parcels no banco (300 SP + 30 demo).
- **Demo live:** http://172.233.188.166:3000 — login: admin@demo.local / Admin@12345

---

## 2. Próximos 5 Itens Obrigatórios (Top Priority)

| ID | Tarefa | Objetivo | Impacto |
|---|---|---|---|---|
| ~~**T11-F1-QA**~~ | ~~QA bugs pendentes (QA-005 seed data, QA-008, QA-010, QA-011, QA-014)~~ | ✅ `DONE` | CRÍTICO |
| ~~**T11-F2-SHP**~~ | ~~T10-SHP-IMPORT (Shapefile .shp)~~ | ✅ `DONE` | HIGH |
| ~~**T11-F2-CLUSTER**~~ | ~~T8-GIS-CLUSTER (Supercluster)~~ | ✅ `DONE` | HIGH |
| ~~**T11-F3-LGPD**~~ | ~~LGPD consent + direito ao esquecimento~~ | ✅ `DONE` | HIGH |
| ~~**T11-F3-TESTS**~~ | ~~Playwright coverage + testes módulos críticos~~ | ✅ `DONE` (29 novos testes, 7 suites) | MEDIUM |
| ~~**T11-F3-SENTRY**~~ | ~~ErrorLog MongoDB (free)~~ | ✅ `DONE` | MEDIUM |

---

## 3. Próximos 15 Itens Planejados (Sequência de Ataque)

1.  `T8-PROCESS-ALVARA` (Módulo de Alvarás e Licenciamento)
2.  `T8-CERT-SIGN` (Assinatura digital em documentos)
3.  `T8-MUNICIPAL-CFG` (Configurações de tenant/prefeitura)
4.  `T9-API-CONTRACT` (Documentação OpenAPI/Swagger)
5.  `T9-OBSERVABILITY` (Logs e Alertas)
6.  `T2-MULTI-TENANT-PROOF` (Teste de penetração/isolamento)
7.  `T9-LGPD-DATA` (Ciclo de vida de dados pessoais)
8.  ~~`T5-SP-UNIT` (Aumentar cobertura unitária em GIS/Tax)~~ `DONE`
9.  `T8-GIS-CLUSTER` (Agrupamento visual de parcelas)
10. `T10-OBSERVATORIO` (Painel executivo com BI real)
11. `T8-CIDADAO-156` (Integração com 156 nacional)
12. `T9-TENANT-ONBOARD` (Automação de setup de prefeitura)
13. `T5-STABLE-CI` (Eliminar flakiness em testes E2E)
14. `T9-RBAC-ACTIONS` (Controle granular por botão/ação)
15. `T10-OFFLINE-FULL` (Sincronização mobile robusta)

---

## 4. Parallel Execution Rules (Multi-agent Coordination)

Para permitir que múltiplas IAs trabalhem em paralelo, as tarefas são classificadas por risco de colisão.

### Safe to parallelize (Independent modules)
- Documentação isolada (ex: módulos específicos em `docs/`)
- Testes unitários de módulos diferentes (ex: `parcels.spec.ts` vs `vistorias.spec.ts`)
- Módulos backend independentes (ex: `citizen-156` vs `pgv`)
- Módulos frontend independentes (ex: `/app/reurb` vs `/app/ambiental`)
- Fixtures separadas

### Do NOT parallelize (Global impact)
- `AGENTS.md`
- Core planning files (`02-BACKLOG`, `03-EXECUTION-PLAN`, etc. — exceto para registrar sua própria tarefa)
- `docs/planning/11-ACTIVE-LOCKS.md` (requer acesso atômico)
- `package.json` e `pnpm-lock.yaml`
- `docker-compose.yml`
- Database schemas e migrations
- Auth/RBAC global
- `apiFetch` ou global API client
- Configuração global de navegação (`nav-config.ts`)

## Task claiming protocol

1.  **Check:** Ver próxima tarefa no Execution Plan.
2.  **Verify:** Consultar `11-ACTIVE-LOCKS.md`.
3.  **Claim:** Se livre e não houver conflito de arquivos, criar lock.
4.  **Execute:** Registrar arquivos pretendidos e iniciar.
5.  **Validation:** Rodar testes e atualizar docs.
6.  **Release:** Encerrar lock e atualizar planejamento.

---

## 5. Marcos de Entrega (Milestones)

- **Marco A: Demo Controlada (Score > 40)** — Capaz de mostrar um fluxo real em dataset de SP.
- **Marco B: POC com Prefeitura Pequena (Score > 60)** — Operacional para teste piloto real.
- **Marco C: Prova Técnica Licitável (Score > 75)** — Atende requisitos de editais médios/grandes.
- **Marco D: Municipal-Grade (Score > 85)** — Competitivo contra GeoPixel em escala nacional.

---

## 5. O que NÃO fazer agora

- ❌ NÃO implementar novas funcionalidades de IA (Chatbot, Blockchain, etc.) até o core T2/T3 estar DONE.
- ❌ NÃO fazer refactors estéticos de UI sem ganho funcional/prova de teste.
- ❌ NÃO adicionar novas dependências pesadas sem aprovação do Paulo.
- ❌ NÃO ignorar falhas em testes de CI para "ganhar tempo".

---

## 6. Critérios de Parada (Stop Criteria)

- Pare se: encontrar vazamento de dados entre tenants (T9-MULTI-TENANT-PROOF falhar).
- Pare se: a performance do mapa degradar para > 5s de carregamento (T8-GIS-MVT é obrigatório).
- Pare se: houver divergência material entre o cálculo do sistema e o cálculo legal (T8-TRIB-IPTU).

---

> **Atenção Agente:** A próxima tarefa deve ser preferencialmente o primeiro item do Top 5 acima.
