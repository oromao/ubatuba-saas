# QA AUDIT REPORT — FlyDea GovTech
> Auditor: Principal QA Engineer + SDET
> Data: 2026-05-01
> Sistema: http://172.233.188.166:3000

---

## 1. MAPA DO SISTEMA TESTADO

### 1.1 Frontend — 44 rotas (todas 200 OK)
```
PÚBLICAS (5):  /login, /cidadao, /mobile, /forgot-password, /reset-password
PORTAL OIDC (3): /portal/oidc/start, /portal/oidc/callback, /portal/exchange
APP AUTENTICADA (36): /app/dashboard, /app/maps, /app/ctm/* (6), /app/pgv/* (4),
  /app/vistorias (3), /app/alerts, /app/observatorio, /app/certidoes,
  /app/processes, /app/modulos/* (5), /app/reurb, /app/profile,
  /app/notifications, /app/cartas, /app/integracoes, /app/auditoria,
  /app/relatorios, /app/assets, /app/aprovacao, /app/levantamentos,
  /app/monitoramento, /app/ambiental, /app/156, /app/poc
```

### 1.2 Backend — 38 módulos, ~120 endpoints
```
Core: Auth, Tenants, Users, Memberships, Projects
CTM: Parcels (CRUD + import + geojson + mvt), Logradouros, Vistorias,
     UrbanFurniture, Subdivision
GIS: Bbox, Viewport, MVT Tiles, Clusters, CRS Convert
PGV: Zones, Faces, Factors, FactorSets, Versions, Valuations,
     Simulations, IPTU
Maps: Layers, Areas, MapFeatures, OSM (roads, buildings)
Ops: Alerts, Assets, Cemetery, Environment, Monitoring, PublicWorks,
     PermitsWorks, PermitsBusiness, Citizen156, Mobile, Surveys
Docs: Certificates, NotificationsLetters, Processes, Reports
Infra: Health, Metrics, Dashboard, Observatory, Compliance,
       TaxIntegration, IntegrationHub, Uploads, POC
```

---

## 2. FLUXOS TESTADOS

| Fluxo | Status | Observação |
|---|---|---|
| Login (sucesso) | ✅ | Token JWT + refresh retornados |
| Login (senha errada) | ✅ | Retorna 401 |
| Login (tenant errado) | ✅ | Retorna 401 |
| Login (campos vazios) | ✅ | Retorna 400 com validação |
| Login (SQL injection) | ✅ | 400 — safe |
| Login (XSS) | ✅ | 400 — safe |
| Dashboard KPIs | ⚠️ | /dashboard/kpi retorna {} vazio |
| Dashboard Executive | ✅ | 5 seções populadas |
| Parcels list (2530 itens) | ✅ | Paginação via bbox |
| Parcels geojson (bbox SP) | ✅ | 823 features retornados |
| GIS bbox query | ✅ | 823 features, 10 queries concorrentes OK |
| GIS clusters | ✅ | 282 clusters no zoom 12 |
| IPTU cálculo | ✅ | R$ 577.537,60 (aliquota 0.5%) |
| IPTU parcel inexistente | ❌ | 500 (CastError ObjectId) |
| Citizen call create | ✅ | Protocolo gerado, status ABERTO |
| Citizen protocol lookup | ✅ | Retorna status e histórico |
| Citizen rate limit | ✅ | Bloqueia após 9+ req/min |
| Certificate issue | ✅ | SHA-256 + RSA signature + QR code |
| Certificate validate | ✅ | Retorna valid + signatureValid |
| Vistorias list | ⚠️ | 0 vistorias — empty state |
| Subdivisions list | ⚠️ | 0 — empty state (novo módulo) |
| Parcel import (válido) | ✅ | 500 imported, 0 errors |
| Parcel import (inválido) | ✅ | 400 com mensagem |
| Auth guards (no token) | ✅ | 401 em endpoints protegidos |
| Auth guards (public routes) | ✅ | Health/Metrics acessíveis sem token |
| Refresh token | ✅ | 401 para token inválido |
| CORS headers | ✅ | Access-Control-Allow-Origin configurado |
| Load test (10 concurrent) | ✅ | Todos 200 |

---

## 3. BUGS ENCONTRADOS

### CRÍTICOS (4)

| ID | Bug | Severidade | Impacto |
|---|---|---|---|
| BUG-001 | Dashboard KPIs retorna {} vazio | CRÍTICA | Painel executivo sem dados para tomada de decisão |
| BUG-002 | Vistorias: 0 registros — módulo sem dados | CRÍTICA | Fluxo de fiscalização inoperante na demo |
| BUG-003 | IPTU lança 500 com parcelId inválido | CRÍTICA | Crash do servidor em vez de 404 amigável |
| BUG-004 | Parcels detail com ID inválido lança 500 | CRÍTICA | CastError ObjectId não tratado |

### ALTOS (3)

| ID | Bug | Severidade | Impacto |
|---|---|---|---|
| BUG-005 | Vários módulos sem dados (empty state) | ALTA | Demo parece vazia: Permits=0, Tax=0, Zones=0, Cemetery=0, Env=0, Mobile=0, Surveys=0, Compliance=0 |
| BUG-006 | Health reporta "degraded" constantemente | ALTA | Sinaliza sistema não saudável em produção |
| BUG-007 | Erro 500 genérico para inputs inválidos | ALTA | Experiência ruim, sem mensagem útil |

### MÉDIOS (4)

| ID | Bug | Severidade | Impacto |
|---|---|---|---|
| BUG-008 | GeoJSON bbox inválido causa 500 (Point coords must be finite) | MÉDIA | Deveria retornar 400 com validação |
| BUG-009 | Citizen call sem campos obrigatórios retorna 500 (Mongoose ValidationError) | MÉDIA | Deveria retornar 400 com mensagem clara |
| BUG-010 | PGV Zones lista vazia (3 zones no banco mas não retornam) | MÉDIA | Filtro de tenant/project pode estar errado |
| BUG-011 | Observatory: 2530 parcels mas só 30 valuations (2% coverage) | MÉDIA | Dados inconsistentes para demo |

### BAIXOS (3)

| ID | Bug | Severidade | Impacto |
|---|---|---|---|
| BUG-012 | Playwright E2E: 3 testes smoke quebrados | BAIXA | CI/CD não confiável |
| BUG-013 | Health memory degraded (heap > 95%) | BAIXA | Threshold muito restritivo |
| BUG-014 | Inverted bbox retorna 0 features silenciosamente | BAIXA | Sem feedback de erro |

---

## 4. INCONSISTÊNCIAS FUNCIONAIS

1. **Dashboard KPIs vs Observatory**: KPIs vazio mas Observatory retorna 2530 parcels. Duas fontes de verdade.
2. **GIS geojson vs Parcels list**: Geojson retorna 823 (com bbox), list retorna 2530 (total). Ambos corretos mas inconsistência sem bbox pode confundir.
3. **PGV Zones**: 3 zones no MongoDB mas endpoint retorna 0. TenantId ou projectId mismatch.
4. **Observatory**: 30 valuations para 2530 parcels = 1.2% cobertura de avaliação venal.

---

## 5. BACKLOG ESTRUTURADO

### Correções Imediatas (Sprint 0)

| ID | Título | Esforço | Arquivos |
|---|---|---|---|
| FIX-001 | Tratar CastError ObjectId com 404 em vez de 500 | 30min | tenants.service.ts, parcels controller |
| FIX-002 | Health service: ajustar threshold de memory degraded | 10min | health.service.ts |
| FIX-003 | Dashboard KPIs: investigar e corrigir endpoint vazio | 1h | dashboard.service.ts |
| FIX-004 | Citizen call: capturar ValidationError e retornar 400 | 30min | public-calls.controller.ts |
| FIX-005 | GeoJSON bbox: validar coords antes de MongoDB | 30min | parcels.repository.ts |

### Próxima Sprint (Sprint 1)

| ID | Título | Esforço |
|---|---|---|
| SPR1-001 | Criar seed data para PGV Zones (3 zonas com aliquotas reais) | 2h |
| SPR1-002 | Popular vistorias demo (5+ vinculadas a parcelas reais) | 1h |
| SPR1-003 | Corrigir Playwright smoke tests | 2h |
| SPR1-004 | Adicionar validação global 400 para parâmetros inválidos | 1h |
| SPR1-005 | Popular módulos vazios com seed data (Permits, Tax, Cemetery) | 3h |

---

## 6. PLANO DE EXECUÇÃO

```
FASE 1 (HOJE) — Correções de crash
├── BUG-003: IPTU parcel inválido → 404
├── BUG-004: Parcel ID inválido → 404
├── BUG-007: Capturar ValidationErrors → 400
├── BUG-008: Validar bbox coords → 400
└── BUG-009: Validar campos obrigatórios → 400

FASE 2 (AMANHÃ) — Dados para demo
├── SPR1-001: Seed PGV zones
├── SPR1-002: Criar vistorias demo
├── SPR1-005: Popular módulos vazios
└── BUG-001: Corrigir Dashboard KPIs

FASE 3 (ESTA SEMANA) — Qualidade
├── BUG-006: Ajustar health thresholds
├── SPR1-003: Corrigir Playwright
├── BUG-010: Corrigir PGV zones query
└── BUG-011: Melhorar cobertura de valuations
```

---

## 7. RISCOS DE PRODUÇÃO

1. **500 errors vazando para o cliente** — 5 endpoints retornam 500 para inputs inválidos. Em produção, isso expõe stack traces e causa má experiência.
2. **Dashboard sem dados** — Prefeitura não confia em sistema que mostra "vazio" no painel principal.
3. **Demo parece vazia** — 12 dos 38 módulos estão sem dados. Cliente acha que o sistema não funciona.
4. **Health "degraded"** — Monitoramento falso positivo pode gerar alertas incorretos.
5. **Rate limiting funciona mas mensagem em pt-BR** — "Muitas solicitacoes" sem acentos.

---

## 8. VEREDITO FINAL

| Dimensão | Nota | Comentário |
|---|---|---|
| **Backend API** | 8.5/10 | APIs sólidas, auth funciona, GIS excelente. Bugs: 500 em edge cases. |
| **Frontend** | 7/10 | Todas as rotas carregam, mas navegação não testada visualmente. |
| **Dados** | 6/10 | 2530 parcelas reais (GeoSampa) é excelente. Mas 12 módulos vazios. |
| **Segurança** | 9/10 | JWT + refresh, RBAC, CORS, rate-limit, XSS/SQL safe. |
| **Observabilidade** | 6/10 | Health/métricas existem mas health mostra falso positivo. |
| **Testes** | 7/10 | 155 unit tests sólidos. Playwright E2E precisa de correções. |
| **Demo readiness** | 7/10 | Funcional mas 12 módulos vazios prejudicam percepção. |

**NOTA GERAL: 7.2/10 — SÓLIDO, mas precisa de polimento para demo de prefeitura.**
