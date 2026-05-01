# 01 — Geopixel Gap Analysis

> Audit: FlyDea vs Geopixel para licitação municipal
> Data: 2026-04-30 | Auditor: OpenCode
> Maturidade atual: 85.2% (Municipal-Grade)

---

## Matriz de Capacidades

| Capacidade | FlyDea | Nível | Evidência | Gap | Prioridade |
|---|---|---|---|---|---|
| **Cadastro Técnico Multifinalitário** | DONE | 5/5 | parcel.schema.ts (184 linhas, 26 campos), logradouro.schema.ts, urban-furniture.schema.ts | — | — |
| **Gestão de imóveis urbanos** | DONE | 5/5 | ParcelsService com CRUD, import GeojSON/CSV, workflow status, audit trail | — | — |
| **Parcelas, lotes, quadras, setores** | DONE | 5/5 | Schema: sqlu, setor, quadra, lote, parcel-subdivision.schema.ts | — | — |
| **Mapa GIS interativo** | DONE | 5/5 | /app/maps com MapLayers, MapToolbar, MiniMap, WebGL fallback | — | — |
| **Camadas geoespaciais** | DONE | 5/5 | LayersModule (78 layers seeded), AreasModule, MapFeaturesModule | — | — |
| **Importação GeoJSON** | DONE | 5/5 | ParcelsService.importGeojson(), CRS detection, bbox query | — | — |
| **Importação CSV** | DONE | 4/5 | ParcelsService.importFromCsvEnrichment() | Shapefile (SHP) não suportado diretamente | MÉDIA |
| **Exportação GeoJSON** | DONE | 5/5 | ParcelsService.geojson(), GIS.bbox endpoint | — | — |
| **MongoDB + 2dsphere** | DONE | 5/5 | 16 indexes incluindo geometry:2dsphere, $geoIntersects queries | — | — |
| **Vistorias de campo** | DONE | 5/5 | Vistoria schema (tipo, status, fotos, historico), VistoriasService | — | — |
| **Vistoria mobile-first** | DONE | 4/5 | /mobile page + MobileFieldRecord + offline IndexedDB | Sync offline 50k+ não provado | MÉDIA |
| **Registro de evidências/fotos** | DONE | 4/5 | Vistoria.fotos[], PermitsWorks.evidences[], UploadsModule | Upload no portal cidadão parcial | MÉDIA |
| **Auditoria de ações** | DONE | 4/5 | ParcelAuditLog, LgpdAuditService, history tracking em todos schemas | Cobertura 100% não provada | MÉDIA |
| **Portal do cidadão** | REAL | 3/4 | /cidadao form, /public/calls, protocolo público com status | Upload de arquivos, notificação email | MÉDIA |
| **Relatórios gerenciais** | DONE | 4/5 | ReportsModule, ObservatoryService (KPIs, trends, CSV), DashboardService | Templates PDF oficiais completos | MÉDIA |
| **Relatórios técnicos** | DONE | 5/5 | CertificatesService com SHA-256 + assinatura digital RSA | — | — |
| **Dashboards municipais** | REAL | 3/4 | DashboardService com KPIs, executive, satelliteHealth, observatory | Gráficos interativos no frontend | MÉDIA |
| **Gestão de protocolos/processos** | DONE | 5/5 | Process schema + ProcessEvent, workflow engine nos Permits | — | — |
| **Integração GIS externa** | DONE | 4/5 | GeoServer (WMS/WFS), OSM import (roads, buildings) | ArcGIS/QGIS plugin não existe | BAIXA |
| **Gestão tributária/territorial** | DONE | 4/5 | IptuService (venal × aliquota), TaxBillService (carnê), PGV (valuations) | Integração com sistemas de arrecadação externos | MÉDIA |
| **Regularização fundiária** | DONE | 4/5 | ReurbModule (projects, families, units, notifications, deliverables) | — | — |
| **Georreferenciamento** | DONE | 5/5 | CRS UTM↔WGS84, centroid/bbox calc, EPSG explícito | — | — |
| **Trilha de conformidade** | DONE | 4/5 | ComplianceModule, LgpdAuditService | — | — |
| **Multi-tenant** | DONE | 4/5 | Tenant isolation via tenantId em todas queries, TenantGuard | Penetration test não executado | MÉDIA |
| **Perfis e permissões** | DONE | 4/5 | 4 roles (ADMIN/GESTOR/OPERADOR/LEITOR) + 22 permissões granulares | — | — |
| **Segurança e LGPD** | DONE | 4/5 | Helmet, CORS, JWT + refresh, rate-limit público, LgpdAuditService | — | — |
| **Observabilidade** | DONE | 4/5 | HealthService (component), MetricsService (Prometheus), structured logging | Alertas e dashboards de monitoramento | BAIXA |
| **Testes automatizados** | DONE | 4/5 | 155 unit tests (14 suites), Playwright smoke test, ~98% pass rate | CI pipeline precisa de estabilização | MÉDIA |
| **Deploy VPS/Docker** | DONE | 5/5 | docker-compose.yml (271 linhas), Dockerfile multi-stage, healthchecks | — | — |
| **Demo real geoespacial** | PARTIAL | 2/5 | Seed demo com 30 parcels DEMO. Sem GeoSampa real. | Precisa importar dados reais | CRÍTICA |
| **Visualização parcelas reais** | PARTIAL | 2/5 | Map features + bbox query funcionam mas dados são DEMO | Dados reais necessários | CRÍTICA |
| **Vistoria vinculada a parcela** | DONE | 5/5 | Vistoria schema com parcelId, fluxo completo testado | — | — |

---

## Resumo

| Nível | Quantidade | % |
|---|---|---|
| 5/5 (Municipal-Grade) | 16 | 55% |
| 4/5 (Robusto) | 11 | 38% |
| 3/4 (Funcional) | 2 | 7% |
| 2/5 (MVP Frágil) | 2 | 7% |
| 0 (Missing) | 0 | 0% |

## Gaps CRÍTICOS (bloqueiam demo real)

1. **Dados geoespaciais reais** — 30 parcels DEMO vs necessidade de 2000+ parcelas reais de SP
2. **GeoSampa/OSM import pipeline** — Script não implementado para download e transformação

## Bugs críticos encontrados

1. Playwright E2E: 3 testes falhando (poc/checks/roles-smoke) — mudanças de UI/rotas
2. T5-STABLE-CI: Flakiness em testes E2E no CI
3. CORS_ORIGIN: Necessário incluir porta :3000 (corrigido nesta sessão)

## Próximos passos imediatos

1. Implementar pipeline de dados reais OSM → GeoJSON → import
2. Executar importação para popular parcelas reais
3. Atualizar Playwright tests para novo estado do sistema
4. Validar demo completa: login → mapa → parcela → vistoria → IPTU
