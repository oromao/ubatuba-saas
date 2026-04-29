# 02 — Backlog Priorizado

> Backlog organizado por tier de prioridade e domínio governamental.
> ÚLTIMA REVISÃO: `2026-04-29` por `Gemini CLI (Consolidação & Deduplicação)`

---

## Legenda

| Status | Significado |
|---|---|
| `TODO` | Não iniciado |
| `IN_PROGRESS` | Em execução |
| `BLOCKED` | Bloqueado (ver notas) |
| `PARTIAL` | Funciona mas falta prova/critério Municipal-Grade |
| `DONE` | Provado por teste + revisão do Paulo |
| `MERGED` | Duplicado, consolidado em outro ID |

| Prioridade | Domínio |
|---|---|
| **T0** | Planejamento & Controle |
| **T1** | Survival (Critical Fixes) |
| **T2** | Robustness (Municipal Core) |
| **T3** | Parity (GeoPixel-class) |
| **T4** | Differentiation (Advantage) |
| **T9** | Governance & Compliance |

---

## 🛠️ T0 — Planning Hygiene / Execution Control

| ID | Título | Status | Prioridade | Esforço |
|---|---|---|---|---|
| **T0-BACKLOG-DEDUP** | Deduplicação e normalização do backlog | `DONE` | CRITICAL | S |
| **T0-STATUS-RECONCILE** | Reconciliar status Matrix vs Backlog vs Filesystem | `IN_PROGRESS` | CRITICAL | S |
| **T0-DONE-RULES** | Definir critérios de "DONE" Municipal-Grade | `DONE` | CRITICAL | S |
| **T0-AGENT-HANDOFF** | Normalizar template de handoff entre agentes | `DONE` | HIGH | S |

---

## 🔴 T1 — Survival / Credibility Blockers

| ID | Título | Status | Agente | Prova |
|---|---|---|---|---|
| **T1-AUDIT-FIXES** | Correção de botões, rotas 404 e redirecionamentos | `DONE` | Claude/Gemini | Playwright Smoke |
| **T1-HYDRATION** | Estabilizar hidratação e impedir tela branca | `DONE` | - | E2E Navigation |
| **T1-DEVSERVER** | Eliminar fragilidade de dev server / cache | `DONE` | Codex | `verify:clean` |

---

## 🟧 T2 — Robustness / Municipal Operation (Active Roadmap)

| ID | Título | Status | Esforço | Domínio |
|---|---|---|---|---|
| **T2-PARCEL-E2E** | Prova real Search/Detail/Update SP-compatible | `PARTIAL` | M | CTM |
| **T2-DATA-RECONCILE** | Conciliação de dados reais (GeoSampa vs IPTU) | `TODO` | L | Dados |
| **T2-GIS-SCALE** | Estabilidade de mapa com 10k+ geometrias | `DONE` | M | GIS |
| **T2-MULTI-TENANT** | Prova de isolamento total de dados entre tenants | `PARTIAL` | M | Segurança |
| **T2-MIGRATIONS** | Sistema de migrações de banco (T9-DB-MIGRATIONS) | `TODO` | M | Infra |

---

## 🟨 T3 — Parity / Competitive Readiness (GeoPixel-class)

| ID | Título | Status | Esforço | Impacto |
|---|---|---|---|---|
| **T8-GIS-MVT** | Implementar Vector Tiles (MVT) para 50k+ | `TODO` | XL | CRITICAL |
| **T8-GIS-CRS** | Conversão CRS UTM (31983) ↔ WGS84 | `DONE` | M | CRITICAL |
| **T8-GIS-BBOX** | Carregamento por Viewport (BBOX) | `DONE` | M | CRITICAL |
| **T8-CTM-COMPLETO** | Workflow de Desmembramento/Loteamento | `TODO` | L | CRITICAL |
| **T8-TRIB-IPTU** | Engine de Cálculo IPTU real (Planta de Valores) | `TODO` | L | CRITICAL |
| **T8-PROCESS-ALVARA** | Módulo de Alvarás e Licenciamento Obras | `TODO` | XL | CRITICAL |
| **T8-CERT-SIGN** | Assinatura Digital em Certidões (T8-DOC-SIGNATURE) | `TODO` | M | CRITICAL |
| **T8-MUNICIPAL-CFG** | Configurações Municipais (Brasão, Leis, Alíquotas) | `TODO` | M | HIGH |

---

## 🟦 T9 — Governance, Compliance & Quality

| ID | Título | Status | Esforço | Tipo |
|---|---|---|---|---|
| **T9-API-CONTRACT** | Documentação OpenAPI (Swagger) completa | `TODO` | M | Doc |
| **T9-OBSERVABILITY** | Logs centralizados, métricas e alertas | `TODO` | M | Ops |
| **T9-LGPD-DATA** | Ciclo de vida de dados e trilha de auditoria | `TODO` | L | Legal |
| **T9-TENANT-ONBOARD** | Fluxo automatizado de criação de nova prefeitura | `TODO` | M | SaaS |
| **T9-EDITAL-MATRIX** | Matriz de aderência a editais típicos | `DONE` | S | Product |
| **T9-RBAC-ACTIONS** | Permissões granulares por ação/botão | `TODO` | M | Sec |

---

## 🧪 T5 — Proof & Test Hardening

| ID | Título | Status | Agente |
|---|---|---|---|
| **T5-SP-SMOKE** | Smoke test em 30+ rotas com dados reais | `DONE` | Claude |
| **T5-SP-UNIT** | >70% coverage em módulos críticos (CRS, Geom) | `TODO` | - |
| **T5-STABLE-CI** | Zero flakiness em CI com Playwright | `PARTIAL` | - |

---

## 💤 Future / Parking Lot (De-prioritized)

- `T10-IA-INCONSISTENCIAS` (ML para detecção de anomalias territoriais)
- `T10-BLOCKCHAIN-AUDIT` (Imutabilidade via Blockchain)
- `T10-IOT-INTEGRATION` (Sensores de campo)
- `T10-CHATBOT-156` (Atendimento via LLM)
- `T10-FISCAL-IA` (Score de risco para fiscalização)

---

## 📉 Histórico de Consolidação (MERGED Items)

- `T8-GIS-BBOX` (Mistral) → `T8-GIS-BBOX` (Consolidado)
- `T8-GIS-CRS` (Mistral) → `T8-GIS-CRS` (Consolidado)
- `T5-SP-TEST-PROOF` → `T5-SP-SMOKE`
- `T1-AUDIT-VISTORIAS` → `T1-AUDIT-FIXES`
- `T1-AUDIT-PORTAL-CIDADAO` → `T1-AUDIT-FIXES`
- `T1-AUDIT-ROUTING` → `T1-AUDIT-FIXES`
- `T1-AUDIT-CTM-EQUIPAMENTOS` → `T1-AUDIT-FIXES`

---

> Notas: A prioridade atual é fechar o **T2 Robustness** e avançar no **T8 GIS (MVT)** para garantir escala municipal.
