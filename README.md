# FlyDea - GovTech Multi-Tenant Municipal SaaS

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com/)
[![Status](https://img.shields.io/badge/status-T5%2B%20SP%20Data-yellow.svg)](docs/planning/02-BACKLOG.md)

**FlyDea** is a multi-tenant municipal GovTech SaaS platform focused on **GIS + CTM (Cadastro Territorial Multi) + Taxation (IPTU/PGV)**. The **parcel/lot is the central entity** connecting map, cadastre, taxation, inspections, reports, and processes.

---

## 🏗️ Architecture

| Layer | Technology | Port | Status |
|-------|------------|------|--------|
| Frontend | Next.js 14 (App Router) | 3000 | ✅ Active |
| Backend | NestJS 10 (Modular) | 4000 | ✅ Active |
| Database | MongoDB 7 | 27017 | ✅ Active |
| Cache | Redis 7 | 6379 | ✅ Active |
| Storage | MinIO (S3) | 9000 | ✅ Active |
| GIS Server | GeoServer | 8080 | ✅ Active |
| Reverse Proxy | Nginx | 80/443 | ✅ Active |

---

## ⚡ Quick Start

### Prerequisites
- Node.js >= 18
- Docker + Docker Compose
- pnpm (recommended)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/oromao/ubatuba-saas.git
cd ubatuba-saas
pnpm install
```

### 2. Environment Setup
```bash
# Copy and configure environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit .env files with your configuration
nano .env
nano apps/api/.env
nano apps/web/.env
```

### 3. Run with Docker (Recommended)
```bash
# Start all services (dev profile)
docker compose --profile dev up -d --build

# Or start production profile
docker compose --profile prod up -d --build

# View logs
docker compose logs -f
```

### 4. Access the System
- **Local Dev**: http://localhost:3000
- **API Docs**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

---

## 🚀 Deployment

### Development Mode
```bash
# Start backend (NestJS)
cd apps/api && npm run dev

# In another terminal, start frontend (Next.js)
cd apps/web && npm run dev
```

### Production Build & Run
```bash
# Build everything
pnpm build

# Start API
cd apps/api && npm run start

# Start Web
cd apps/web && npm run start
```

---

## 🗺️ Core Modules

| Module | Path | Description | Status |
|--------|------|-------------|--------|
| **CTM - Cadastro Territorial** | `/app/ctm/*` | Parcels, streets, inspections | ✅ REAL |
| **GIS - Geographic Information** | `/app/maps` | Maps, layers, geometries | ✅ REAL |
| **PGV - Plano Geral de Valores** | `/app/pgv/*` | Valuation zones, factors | ✅ PARTIAL |
| **Taxation - IPTU** | `/app/tax/*` | Property tax management | ✅ PARTIAL |
| **Citizen Portal (156)** | `/app/156` | Citizen requests | ✅ REAL |
| **Inspections** | `/app/ctm/vistorias` | Field inspections | ✅ REAL |
| **Compliance** | `/app/compliance` | Regulatory compliance | ✅ REAL |
| **Reports** | `/app/relatorios` | PDF generation | ✅ REAL |
| **Approval** | `/app/aprovacao` | Process approval | ✅ REAL |
| **Integrations** | `/app/integracoes` | External integrations | ✅ REAL |
| **Alerts** | `/app/alerts` | System alerts | ✅ REAL |
| **Works** | `/app/modulos/obras*` | Public works | ✅ REAL |
| **Business** | `/app/modulos/empresas` | Business permits | ✅ REAL |
| **Cemetery** | `/app/modulos/cemiterio` | Cemetery management | ✅ REAL |
| **Environmental** | `/app/ambiental` | Environmental monitoring | ✅ REAL |
| **Surveys** | `/app/levantamentos` | Field surveys | ✅ REAL |
| **REURB** | `/app/reurb` | Urban regularization | ✅ REAL |
| **Certificates** | `/app/certidoes` | Document certificates | ✅ REAL |
| **Assets** | `/app/assets` | Asset management | ✅ REAL |

---

## 📊 Maturity Matrix

| Tier | Focus | Status | Target |
|------|-------|--------|--------|
| **T1** | Survival / Credibility | ✅ DONE | 2026-04-20 |
| **T2** | Robustness / Municipal Op | ✅ DONE | 2026-04-23 |
| **T3** | Maturity / Competitive Parity | ✅ DONE | 2026-04-24 |
| **T4** | Differentiation / Leadership | ✅ DONE | 2026-04-28 |
| **T5** | Proof & Test Hardening (SP Data) | 🟡 IN PROGRESS | 2026-05-12 |
| **T6** | GIS Performance & Scale | ⏳ TODO | 2026-05-19 |
| **T7** | Real SP Data Integration | ⏳ TODO | 2026-05-26 |
| **T8** | GeoPixel Parity | ⏳ TODO | 2026-06-09 |
| **T9** | AI Differentiation | ⏳ TODO | 2026-06-30 |

Current maturidade score: **2.85/5.0** (MVP fragile → targeting 4.0/5.0 for SP production)

---

## 🎯 First Execution Package (T1+T2) - ✅ DONE

### Validated Flows
- ✅ Login + hydrated session, no blank screen
- ✅ `/app/dashboard` with real data
- ✅ `/app/maps` with fallback + interaction
- ✅ `/app/ctm/parcelas` search + detail + update
- ✅ `/app/ctm/logradouros` list + detail
- ✅ `/app/ctm/vistorias` create + status change

### Validated Features
- ✅ Parcel ↔ Map ↔ Tax ↔ Inspection graph coherence
- ✅ PDF generation (certificates/reports)
- ✅ Tax integration (parcel tax visible + coherent with dashboard)
- ✅ Citizen portal flow
- ✅ Multi-tenant isolation
- ✅ RBAC guards

---

## 🧪 Testing

### Test Structure
```
tests/
├── e2e/                    # End-to-end tests (Playwright)
│   ├── fullscan/           # Full system scans
│   │   ├── menu-smoke.spec.ts     # 28 routes smoke test
│   │   ├── routing-audit.spec.ts
│   │   └── ...
│   ├── user-flows/          # User journey tests
│   └── api/                # API integration tests
├── unit/                   # Unit tests (Jest)
└── fixtures/               # Test data
    └── sp-geosampa-sample.geojson  # Real SP data sample
```

### Run Tests
```bash
# Run all tests
pnpm test

# Run E2E tests (Playwright)
pnpm test:e2e
pnpm test:e2e:full    # Full suite
pnpm test:e2e:smoke  # Smoke tests only

# Run unit tests
cd apps/api && npm test

# Run with coverage
cd apps/api && npm test -- --coverage
```

### Test Status
| Category | Total | Passing | Coverage |
|----------|-------|---------|----------|
| E2E Full | 28+ routes | ✅ All | - |
| E2E Smoke | 28 routes | ✅ All | - |
| Unit (API) | TBD | - | TBD |
| Integration | TBD | - | TBD |

---

## 🛠️ Development

### Project Structure
```
ocrate-saas/
├── apps/
│   ├── api/           # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   │   ├── ctm/     # CTM (Cadastro Territorial)
│   │   │   │   ├── gis/     # GIS services
│   │   │   │   ├── tax/     # Taxation
│   │   │   │   └── ...
│   │   │   └── common/     # Shared utilities
│   │   └── test/        # Backend tests
│   └── web/           # Next.js Frontend
│       ├── src/
│       │   ├── app/     # App Router pages
│       │   ├── lib/     # Shared utilities
│       │   └── components/ # React components
│       └── public/     # Static assets
├── docs/
│   ├── planning/      # Execution plans, backlog
│   ├── agents/        # Agent documentation
│   └── architecture/  # Architecture docs
├── infra/
│   ├── docker/        # Docker configs
│   ├── nginx/         # Nginx configs
│   ├── seeds/         # Database seeds
│   └── scripts/       # Utility scripts
├── tests/            # Cross-cutting tests
└── docker-compose.yml  # Development stack
```

### Scripts
```bash
# Build
npm --prefix apps/api run build
npm --prefix apps/web run build

# Clean
rm -rf .next node_modules/.cache

# Database
npm --prefix apps/api run migrate
npm --prefix apps/api run seed:demo

# Docker
docker compose --profile dev up -d --build
docker compose --profile prod up -d --build
docker compose down -v  # Clean everything
```

---

## 📦 Data Import

### Supported Formats
- ✅ GeoJSON (parcels, streets)
- ✅ CSV (IPTU data, addresses)
- ✅ SHP (via conversion)
- ✅ OSM (via Overpass API)

### Import Commands
```bash
# Import OSM data
npm --prefix apps/api run import:osm

# Seed demo data
npm --prefix apps/api run seed:demo

# Seed REURB data
npm --prefix apps/api run seed:reurb
```

### Fixtures
- `test/fixtures/sp-geosampa-sample.geojson` - Real SP data sample (50k+ lots)
- `test/fixtures/sp-dirty-data-test.geojson` - Dirty data test cases

---

## 🌐 API Documentation

### Base URL
- Development: `http://localhost:4000`
- Production: `https://api.your-domain.com`

### Authentication
All API endpoints require JWT authentication via Bearer token.

```bash
# Login
POST /api/auth/login
{
  "email": "admin@demo.com",
  "password": "admin123",
  "tenant": "demo"
}

# Returns: { accessToken, refreshToken, tenantId }
```

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ctm/parcels` | List all parcels |
| GET | `/api/ctm/parcels/:id` | Get parcel details |
| POST | `/api/ctm/parcels` | Create parcel |
| PUT | `/api/ctm/parcels/:id` | Update parcel |
| GET | `/api/ctm/logradouros` | List streets |
| GET | `/api/maps/tiles/{z}/{x}/{y}` | Get map tiles (MVT) |
| GET | `/api/gis/bbox` | Query by bounding box |
| POST | `/api/ctm/parcels/import` | Import parcels (GeoJSON) |
| GET | `/api/tax/iptu` | Get IPTU data |
| POST | `/api/cidadao/solicitacoes` | Citizen request |

### Swagger UI
Available at: `/api` (when running NestJS in development)

---

## 🌍 GIS & Mapping

### Features
- ✅ Polygon / MultiPolygon support
- ✅ CRS transformation (UTM ↔ WGS84)
- ✅ Centroid / bbox calculation
- ✅ fitBounds with malformed geometry handling
- ✅ Large dataset support (10k+ geometries)
- ✅ Layers and overlays
- ✅ WebGL fallback explicit

### Map Libraries
- MapLibre GL JS (frontend)
- Turf.js (geometry operations)
- MongoDB 2dsphere index (spatial queries)

### CRS Support
- EPSG:4326 (WGS84) - Default
- EPSG:31983 (UTM Zone 23S - Sao Paulo) - Auto-detected
- Custom CRS via configuration

---

## 🏢 Multi-Tenant Architecture

### Tenant Isolation
- ✅ Data: Separate tenantId in all collections
- ✅ Sessions: Tenant-specific JWT tokens
- ✅ RBAC: Role-based access per tenant
- ✅ Storage: Tenant-prefixed buckets

### Tenant Switching
```bash
# In API requests
{
  "tenantId": "your-tenant-id"
}

# In frontend
# Stored in sessionStorage: accessToken, refreshToken, tenantId
```

---

## 🔐 Security

### Authentication
- JWT Bearer tokens
- Refresh token rotation
- Tenant-scoped sessions

### Authorization
- RBAC (Role-Based Access Control)
- Route guards (frontend)
- API guards (backend)

### Data Protection
- 🔐 LGPD compliant (personal data audit trail)
- 🔐 Backup encryption
- 🔐 Secure file uploads

---

## 📈 Monitoring & Observability

### Health Checks
- API: `GET /health`
- MongoDB: Built-in healthcheck
- Redis: Built-in healthcheck

### Logging
- Structured JSON logs
- Error tracking
- Audit trail for critical operations

---

## 💾 Data Model

### Core Entities

#### Parcel (Lote)
```typescript
{
  _id: ObjectId
  sqlu: string          // Unique identifier
  geometry: {           // GeoJSON
    type: "Polygon" | "MultiPolygon"
    coordinates: number[][][]
  }
  tenantId: string
  properties: {
    Matricula: string
    Setor: string
    Quadra: string
    Lote: string
    // ... 50+ properties
  }
  rawProperties: any    // Preserved from import
  createdAt: Date
  updatedAt: Date
}
```

#### Street (Logradouro)
```typescript
{
  _id: ObjectId
  nome: string
  tipo: string
  cep: string
  geometry: {}
  tenantId: string
}
```

#### Inspection (Vistoria)
```typescript
{
  _id: ObjectId
  parceId: ObjectId
  type: string
  status: string
  data: Date
  responsible: ObjectId
  observations: string[]
  tenantId: string
}
```

---

## 🚨 Known Issues & Limitations

### Critical (T5 Focus)
- ⚠️ CRS UTM conversion needed for SP data
- ⚠️ Import deduplication logic needs improvement
- ⚠️ GIS bbox queries need 2dsphere index optimization

### Medium (T6 Focus)
- ⚠️ Vector tiles (MVT) not yet implemented
- ⚠️ Clustering for large datasets needed
- ⚠️ MultiPolygon with holes not fully tested

### Low (T7+ Focus)
- ⚠️ Address canonization for SP data
- ⚠️ IPTU matching with parcel data
- ⚠️ AI-based inconsistency detection

---

## 🤖 Agents & Automation

### Brain OS
- Auto-discovery of project structure
- Session bootstrap and state persistence
- Agent memory across sessions

### Supported Agents
- ✅ Codex CLI
- ✅ Claude Code
- ✅ Gemini CLI
- ✅ Cursor

### Hooks
- Automatic bootstrap on agent start
- Write-back of session state
- Memory persistence

---

## 📞 Support & Contact

### Maintainer
- **Paulo** (Engineering/DevOps, Catanduva-SP)
- Email: paulo@flydea.com (placeholder)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a Pull Request
6. Follow the [Execution Plan](docs/planning/03-EXECUTION-PLAN.md)
7. Update [Progress Log](docs/planning/04-PROGRESS-LOG.md)

### License
MIT License - see [LICENSE](LICENSE) file

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | AI Agent Rules (PRIORITY #1) |
| [00-AGENT-QUICKSTART.md](docs/agents/00-AGENT-QUICKSTART.md) | 2-minute project overview |
| [02-BACKLOG.md](docs/planning/02-BACKLOG.md) | Prioritized task backlog |
| [03-EXECUTION-PLAN.md](docs/planning/03-EXECUTION-PLAN.md) | Current execution plan |
| [04-PROGRESS-LOG.md](docs/planning/04-PROGRESS-LOG.md) | Append-only progress log |
| [01-MATURITY-MATRIX.md](docs/planning/01-MATURITY-MATRIX.md) | Maturity tracking |
| [07-DEFINITIONS.md](docs/planning/07-DEFINITIONS.md) | Maturity vocabulary |

---

## 🎓 Learning Resources

### Comparator Systems
- **GeoPixel** - Reference competitor for maturity calibration
- flyDea targets GeoPixel-class functionality across all modules

### Stack Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://nestjs.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)

---

## 🏆 Benchmarks

### Performance Targets (T6)
- ✅ Large parcel datasets (10k+): Stable
- 🎯 Map rendering: No freeze (>50fps)
- 🎯 Search: <500ms p95
- 🎯 Dashboard load: <2s under load

### GeoPixel Calibration (T8)
- CTM Features: FlyDea 8/10 → Target 10/10
- GIS Features: FlyDea 7/10 → Target 10/10
- Tax Integration: FlyDea 6/10 → Target 10/10
- Inspections: FlyDea 9/10 → Target 10/10
- Citizen Portal: FlyDea 8/10 → Target 10/10

---

## ⚠️ IMPORTANT

**EXISTS ≠ WORKS**

Every feature must be:
1. ✅ UI → API → DB fully connected
2. ✅ Produces visible result
3. ✅ Usable by real municipal operator
4. ✅ No mock/demo as primary behavior
5. ✅ Has automated test covering the flow

Until all criteria are met → feature is **NOT PROVEN** → mark as PARTIAL, ZOMBIE, or FAKE.

---

<div align="center">

**Less talking. More fixing. More validating. More shipping. Plan always updated.**

✨ FlyDea - Building the future of municipal governance ✨
</div>
