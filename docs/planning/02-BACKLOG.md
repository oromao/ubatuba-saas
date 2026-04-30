# 02 — Backlog Priorizado

> Backlog organizado por tier de prioridade e domínio governamental.
> ÚLTIMA REVISÃO: `2026-04-30` por `OpenCode (T8 sprint)`

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

### Multi-agent Fields (Opcional)
- **Owner:** Agente responsável pela tarefa.
- **Lock:** `livre` | `CLAIMED` | `IN_PROGRESS` | `VALIDATING` | `BLOCKED` | `STALE`.
- **Parallel:** `sim` | `não` (Indica se pode rodar em paralelo).
- **Files:** Lista de arquivos/módulos sob lock.

---

## 🛠️ T0 — Planning Hygiene / Execution Control

| ID | Título | Status | Parallel | Owner | Lock |
|---|---|---|---|---|---|
| **T0-BACKLOG-DEDUP** | Deduplicação e normalização do backlog | `DONE` | não | - | - |
| **T0-STATUS-RECONCILE** | Reconciliar status Matrix vs Backlog vs Filesystem | `DONE` | não | OpenCode | — |
| **T0-MULTIAGENT-LOCKS** | Implementar protocolo de locks multiagente | `DONE` | não | Gemini CLI | — |
| **T0-DONE-RULES** | Definir critérios de "DONE" Municipal-Grade | `DONE` | não | - | - |
| **T0-AGENT-HANDOFF** | Normalizar template de handoff entre agentes | `DONE` | não | - | - |

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
| **T2-PARCEL-E2E** | Prova real Search/Detail/Update SP-compatible | `DONE` | M | CTM |
| **T2-DATA-RECONCILE** | Conciliação de dados reais (GeoSampa vs IPTU) | `DONE` | L | Dados |
| **T2-GIS-SCALE** | Estabilidade de mapa com 10k+ geometrias | `DONE` | M | GIS |
| **T2-MULTI-TENANT** | Prova de isolamento total de dados entre tenants | `DONE` | M | Segurança |
| **T2-MIGRATIONS** | Sistema de migrações de banco (T9-DB-MIGRATIONS) | `DONE` | M | Infra |

---

## 🟨 T3 — Parity / Competitive Readiness (GeoPixel-class)

| ID | Título | Status | Esforço | Impacto |
|---|---|---|---|---|
| **T8-GIS-MVT** | Implementar Vector Tiles (MVT) para 50k+ | `DONE` | XL | CRITICAL |
| **T8-GIS-CRS** | Conversão CRS UTM (31983) ↔ WGS84 | `DONE` | M | CRITICAL |
| **T8-GIS-BBOX** | Carregamento por Viewport (BBOX) | `DONE` | M | CRITICAL |
| **T8-CTM-COMPLETO** | Workflow de Desmembramento/Loteamento | `DONE` | L | CRITICAL |
| **T8-TRIB-IPTU** | Engine de Cálculo IPTU real (Planta de Valores) | `DONE` | L | CRITICAL |
| **T8-PROCESS-ALVARA** | Módulo de Alvarás e Licenciamento Obras | `DONE` | XL | CRITICAL |
| **T8-CERT-SIGN** | Assinatura Digital em Certidões (T8-DOC-SIGNATURE) | `DONE` | M | CRITICAL |
| **T8-MUNICIPAL-CFG** | Configurações Municipais (Brasão, Leis, Alíquotas) | `DONE` | M | HIGH |

---

## 🟦 T9 — Governance, Compliance & Quality

| ID | Título | Status | Esforço | Tipo |
|---|---|---|---|---|
| **T9-API-CONTRACT** | Documentação OpenAPI (Swagger) completa | `DONE` | M | Doc |
| **T9-OBSERVABILITY** | Logs centralizados, métricas e alertas | `DONE` | M | Ops |
| **T9-LGPD-DATA** | Ciclo de vida de dados e trilha de auditoria | `DONE` | L | Legal |
| **T9-TENANT-ONBOARD** | Fluxo automatizado de criação de nova prefeitura | `DONE` | M | SaaS |
| **T9-EDITAL-MATRIX** | Matriz de aderência a editais típicos | `DONE` | S | Product |
| **T9-RBAC-ACTIONS** | Permissões granulares por ação/botão | `TODO` | M | Sec |

---

## 🧪 T5 — Proof & Test Hardening

| ID | Título | Status | Agente |
|---|---|---|---|
| **T5-SP-SMOKE** | Smoke test em 30+ rotas com dados reais | `DONE` | Claude |
| **T5-SP-UNIT** | >70% coverage em módulos críticos (CRS, Geom) | `DONE` | Kimi/OpenCode |
| **T5-STABLE-CI** | Zero flakiness em CI com Playwright | `DONE` | - |

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
