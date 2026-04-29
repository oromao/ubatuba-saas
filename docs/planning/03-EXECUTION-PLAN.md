# 03 — Execution Plan

> Plano de execução vivo. Fonte primária para a próxima tarefa de qualquer agente.
> ÚLTIMA REVISÃO: `2026-04-29` por `Gemini CLI (Cleanup Phase)`

---

## 1. Estado Atual Consolidado

- **Maturidade (Weighted):** 37.4% (Tier: Protótipo / MVP Frágil)
- **Backlog Status:** T1 (Survival) concluído; T2 (Robustness) em progresso.
- **Blockers:** Falta de escala GIS (MVT), falta de cálculo real de IPTU, falta de fluxos de alvará.
- **Infra:** Docker-dev estabilizado; Playwright smoke test cobrindo 30+ rotas.

---

## 2. Próximos 5 Itens Obrigatórios (Top Priority)

| ID | Tarefa | Objetivo | Impacto |
|---|---|---|---|
| **T0-STATUS-RECONCILE** | Reconciliar Status | Alinhar Matrix, Backlog e Código real. | Governança |
| **T2-DATA-RECONCILE** | Conciliação de Dados | Provar integração GeoSampa (mapa) vs IPTU (tributo). | Produto |
| **T8-GIS-MVT** | Implementar MVT Tiles | Permitir escala de 100k+ parcelas sem crash. | Técnico |
| **T8-CTM-COMPLETO** | Workflow Desmembramento | Sair de CRUD simples para gestão territorial real. | Produto |
| **T8-TRIB-IPTU** | Engine de Cálculo IPTU | Substituir mocks por lógica real baseada em PGV. | Produto |

---

## 3. Próximos 15 Itens Planejados (Sequência de Ataque)

1.  `T8-PROCESS-ALVARA` (Módulo de Alvarás e Licenciamento)
2.  `T8-CERT-SIGN` (Assinatura digital em documentos)
3.  `T8-MUNICIPAL-CFG` (Configurações de tenant/prefeitura)
4.  `T9-API-CONTRACT` (Documentação OpenAPI/Swagger)
5.  `T9-OBSERVABILITY` (Logs e Alertas)
6.  `T2-MULTI-TENANT-PROOF` (Teste de penetração/isolamento)
7.  `T9-LGPD-DATA` (Ciclo de vida de dados pessoais)
8.  `T5-SP-UNIT` (Aumentar cobertura unitária em GIS/Tax)
9.  `T8-GIS-CLUSTER` (Agrupamento visual de parcelas)
10. `T10-OBSERVATORIO` (Painel executivo com BI real)
11. `T8-CIDADAO-156` (Integração com 156 nacional)
12. `T9-TENANT-ONBOARD` (Automação de setup de prefeitura)
13. `T5-STABLE-CI` (Eliminar flakiness em testes E2E)
14. `T9-RBAC-ACTIONS` (Controle granular por botão/ação)
15. `T10-OFFLINE-FULL` (Sincronização mobile robusta)

---

## 4. Marcos de Entrega (Milestones)

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
