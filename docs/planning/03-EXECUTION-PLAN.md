# 03 — Execution Plan

> Plano de execução vivo. Fonte primária para a próxima tarefa de qualquer agente.
> ÚLTIMA REVISÃO: `2026-05-01` por `OpenCode (GeoSampa sprint)`

---

## 1. Estado Atual Consolidado

- **Maturidade (Weighted):** 85.2% (Tier: Municipal-Grade Competitivo)
- **Backlog Status:** 30+ itens DONE. Nova fase: GeoSampa + Demo Real.
- **Blockers:** Playwright E2E (3 testes quebrados), PDF templates oficiais, SHP import.
- **Infra:** Docker-dev estável; 155 unit tests; 330 parcels no banco (300 SP + 30 demo).
- **Demo live:** http://labspaulo.site/ — login: admin@demo.local / Admin@12345

---

## 2. Próximos 5 Itens Obrigatórios (Top Priority)

| ID | Tarefa | Objetivo | Impacto |
|---|---|---|---|
| **T10-GEOSAMPA-IMPORT** | Importar lotes reais GeoSampa via WFS | Substituir dados sintéticos por lotes fiscais reais de SP. | CRÍTICO |
| **T10-PLAYWRIGHT-FIX** | Corrigir 3 testes E2E quebrados | CI verde, demo validada automaticamente. | HIGH |
| **T10-PDF-TEMPLATE** | PDF templates oficiais com PDFKit | Certidões com formatação profissional (brasão, QR code). | HIGH |
| **T10-DASHBOARD-GRAPHS** | Gráficos interativos no Dashboard | KPIs visuais para demo de prefeitura. | MEDIUM |
| **T10-SHP-IMPORT** | Suporte a Shapefile (.shp) | Importar dados de outras prefeituras. | MEDIUM |

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
