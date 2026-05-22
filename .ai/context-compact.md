# Context Compact — FlyDea (REVISADO)

## Project
- FlyDea: multi-tenant municipal GovTech SaaS
- Core: GIS (geoespacial) + CTM (cadastro técnico) + PGV (planta genérica de valores) + IPTU
- Parcela/lote = entidade central
- **Dados reais de São Paulo** via GeoSampa WFS + OSM Overpass API

## Stack CONFIRMADA
- **Frontend**: Next.js (App Router), TypeScript, MapLibre GL
- **Backend**: NestJS (modular), TypeScript, Mongoose
- **Database**: **MongoDB** com `2dsphere` indexes (NÃO é PostgreSQL/PostGIS)
- **GeoServer**: WMS/WFS integrado (kartoza/geoserver:2.24.2)
- **Object Storage**: MinIO (S3-compatible) para GeoTIFFs
- **Cache**: Redis
- **Auth**: JWT + RBAC (admin/gestor/operador/leitor) + OIDC
- **Infra**: Terraform (skeleton — ECS + ECR + CloudWatch)
- **Testes**: Playwright (E2E, 31 files) + Vitest (unit, 70+ files)
- **Monorepo**: pnpm workspaces (apps/*)
- **Local dev**: Docker Compose (mongo, redis, minio, geoserver)

## O que JÁ EXISTE (maduro)
| Domínio | Status | Detalhes |
|---|---|---|
| **CTM** | ✅ Avançado | Parcela CRUD, geometria, import CSV/GeoJSON, desmembramento, MVT tiles, audit trail |
| **PGV** | ✅ Completo | Zonas, faces, fatores, versões, valuations, simulações, assessments |
| **IPTU** | ✅ Implementado | Cálculo valor venal × alíquota, batch, por parcela |
| **GIS** | ✅ Integrado | GeoServer, MVT tiles (geojson-vt + vt-pbf), transformação CRS (WGS84 ↔ UTM 23S) |
| **REURB** | ✅ Funcional | Projetos, documentos, planilhas, export ZIP, validação |
| **Multi-tenant** | ✅ Maduro | 2300+ referências, TenantGuard, x-tenant-id, isolamento por collection |
| **Auth** | ✅ Completo | JWT, RBAC (4 perfis), OIDC, password reset, refresh token |
| **Dados SP** | ✅ Reais | GeoSampa 5 setores fiscais, OSM buildings, 50+ camadas zoneamento |
| **GeoServer** | ✅ Integrado | WMS/WFS, workspace por tenant, publicação GeoTIFF |

## 🔴 Deploy: VPS (Docker Compose) — MODO DEV EM PRODUÇÃO

**VPS**: `172.233.188.166` | 7 dias uptime | 15GB RAM, 315GB SSD

### Stack rodando (profile DEV — não PROD)
| Container | Porta | Status | Nota |
|---|---|---|---|
| `ubatuba-saas-api-dev-1` | **4000** | Up 6d | NestJS em modo dev (hot reload) |
| `ubatuba-saas-web-dev-1` | **3000** | Up 6d | Next.js em modo dev |
| `ubatuba-saas-geoserver-1` | **8080** | Up 7d | WMS/WFS |
| `ubatuba-saas-minio-1` | **9000/9001** | Up 7d | S3-compatible |
| `ubatuba-saas-mongodb-1` | **27017** | Up 7d | Dados GIS/CTM |
| `ubatuba-saas-mongo-express-1` | **8081** | Up 7d | 🚨 Admin DB UI pública |
| `ubatuba-saas-redis-1` | **6379** | Up 7d | Cache |

### 🔴 Problemas de segurança críticos
1. **Mongo Express (8081) exposto publicamente** — qualquer um pode acessar o banco
2. **Sem HTTPS** — tudo em HTTP puro (portas 3000, 4000, 8080, 8081, 9000)
3. **Sem nginx** — profile dev não inclui reverse proxy
4. **Secrets hardcoded** no `.env.prod` (`root:rootpass`, `minioadmin`, `JWT_SECRET`)
5. **Serviços expostos diretamente**: 3000, 4000, 8080, 8081, 6379, 27017, 9000, 9001
6. **Sem backup automatizado** — sem crontab

### Outros projetos na VPS
- `/opt/ubatuba-saas/` — versão alternativa do projeto
- `/opt/flydea/` — deploy flydea
- `/root/flydea-financial-manager/` — outro projeto

## Roadmap 2026-2027
- **Sprint 0**: 🔴 Seguranca VPS (7 itens urgentes)
- **Sprint 1**: Deploy prod + CI/CD + CTM/GIS com dados SP
- **Sprint 2**: PGV real + IPTU + Alvaras
- **Sprint 3**: Processos + Mobile + Satelite baseline
- **Sprint 4**: Satelite avancado + Ambiental
- **Sprint 5**: OMI + Zelador.IA + Qualidade

## Foco Imediato (Sprint 0)
1. 🔴 SEC-001: Remover Mongo Express da exposicao publica
2. 🔴 SEC-004: Migrar para profile prod (nginx reverse proxy)
3. 🔴 SEC-005: HTTPS/SSL
4. 🔴 SEC-006: Rotacionar senhas
5. SEC-007: Firewall VPS
6. CI/CD GitHub Actions
