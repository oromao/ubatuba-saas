# 00 — Repository Map

> **Purpose**: Quick reference for where everything lives in the repository
> **Audience**: New developers, AI agents, external contributors
> **Version**: 1.0

---

## Folder Structure Overview

```
/ubuntu-saas/
├── AGENTS.md                          # ⭐ PROJECT RULES - READ FIRST
├── apps/                              # Core applications
│   ├── api/                           # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/               # Domain modules (ctm, tax, gis, etc.)
│   │   │   ├── common/               # Shared utilities, guards, filters
│   │   │   ├── config/               # Configuration
│   │   │   └── main.ts               # Entry point
│   │   └── test/                     # Backend tests
│   └── web/                           # Next.js Frontend
│       ├── app/                       # App Router routes
│       ├── components/               # React components
│       ├── lib/                       # Utilities, hooks
│       └── test/                     # Frontend tests
├── docs/                              # Documentation
│   ├── agents/                       # AI agent guides
│   │   └── 00-AGENT-QUICKSTART.md    # ⭐ READ SECOND
│   ├── architecture/                 # Architecture docs
│   │   ├── 00-REPO-MAP.md            # This file
│   │   └── 01-DECISIONS.md           # Architecture decisions
│   └── planning/                     # Project planning
│       ├── 00-PROJECT-CONTEXT.md     # Project context
│       ├── 01-MATURITY-MATRIX.md     # Feature maturity tracking
│       ├── 02-BACKLOG.md             # Task backlog
│       ├── 03-EXECUTION-PLAN.md      # Current execution plan
│       ├── 04-PROGRESS-LOG.md        # Progress history
│       ├── 05-CLEANUP-INVENTORY.md   # Cleanup tracking
│       ├── 06-TESTING-STRATEGY.md    # Testing approach
│       ├── 07-DEFINITIONS.md         # Component definitions
│       └── 10-REPO-CLEANUP-PLAN.md   # Repository cleanup plan
├── scripts/                          # Utility scripts
│   ├── verify-clean.mjs             # Clean state verification
│   ├── check-users.js                # User data check
│   ├── check-geojson-logic.js        # GeoJSON validation
│   ├── check-geojson-logic.ts        # GeoJSON validation (TS)
│   ├── seed-users-simple.js         # User seeding
│   └── dispatch-*.sh                 # Multi-agent dispatch scripts
├── tests/                           # Integration/E2E tests
│   ├── e2e/                         # Playwright E2E tests
│   └── unit/                        # Unit tests
├── test/                            # Test fixtures & data
│   └── fixtures/                    # Test data files
├── infra/                           # Infrastructure as Code
│   └── docker/                      # Docker configurations
├── .archive/                        # Archived files (DO NOT READ)
├── storage/                         # Local data storage
├── templates/                       # Template files
├── docker-compose.yml               # Docker Compose
├── package.json                     # Project root package
├── pnpm-lock.yaml                   # PNPM lockfile
├── start.sh                         # Startup script
└── .gitignore                       # Git ignore rules
```

---

## What Each Folder Does

### 🎯 `apps/` - Core Applications

| Folder | Technology | Purpose | Tests |
|--------|------------|---------|-------|
| `apps/api/` | NestJS + TypeScript + MongoDB | Backend API, business logic | Jest (backend/) |
| `apps/web/` | Next.js 14 (App Router) + React | Frontend UI | Playwright (tests/) |

**Module Structure (apps/api/src/modules/)**
- `ctm/` - Cadastro Territorial Multi (parcels, roads, inspections)
- `gis/` - Geographic Information System (maps, layers, spatial queries)
- `tax/` - Tributação (IPTU, PGV, tax calculations)
- `auth/` - Authentication & Authorization
- `users/` - User management
- `tenants/` - Multi-tenant management
- `reports/` - Report generation
- `imports/` - Data import (GeoJSON, CSV, external)

### 📚 `docs/` - Documentation

| Folder | Purpose | Priority |
|--------|---------|----------|
| `docs/agents/` | AI agent guides & rules | HIGH |
| `docs/architecture/` | Architecture & repo structure | HIGH |
| `docs/planning/` | Project planning & tracking | HIGH |

**What to Read (Priority Order)**
1. `AGENTS.md` (root) - **MANDATORY FIRST**
2. `docs/agents/00-AGENT-QUICKSTART.md` - Project overview
3. `docs/planning/03-EXECUTION-PLAN.md` - Current tasks
4. `docs/planning/04-PROGRESS-LOG.md` - Recent progress
5. `docs/architecture/00-REPO-MAP.md` - This file
6. `docs/planning/01-MATURITY-MATRIX.md` - Feature status
7. `docs/planning/02-BACKLOG.md` - Task queue

**DO NOT READ (unless referenced)**
- `.archive/` - Archived files (dead)
- Old docs in `.archive/docs/`
- Old agent configs in `.archive/`

### 🔧 `scripts/` - Utility Scripts

| Script | Purpose |
|--------|---------|
| `verify-clean.mjs` | Verify clean repo state |
| `check-geojson-logic.js` | Validate GeoJSON processing |
| `check-users.js` | Check user data consistency |
| `seed-users-simple.js` | Seed initial users |
| `dispatch-*.sh` | Multi-agent orchestration |

### 🧪 `tests/` & `test/` - Testing

| Folder | Type | Framework | Location |
|--------|------|-----------|----------|
| `tests/e2e/` | E2E (Playwright) | Playwright | Cross-app |
| `tests/unit/` | Unit tests | Jest | Backend |
| `apps/api/test/` | Backend tests | Jest | Backend only |
| `test/fixtures/` | Test data | N/A | Shared |

**Key Test Commands**
```bash
# Backend build + test
npm run build -w apps/api
npm run test -w apps/api

# Frontend build + test  
npm run build -w apps/web
pnpm test:e2e:smoke

# Full test suite
pnpm test
pnpm test:e2e:fullscan:all
```

### ⚙️ `infra/` - Infrastructure

| Folder | Purpose |
|--------|---------|
| `infra/docker/` | Docker configurations |

### 🗃️ `.archive/` - Archived Files

**DO NOT READ** - These are dead/old files kept for historical reference only.

```
.archive/
├── repo-cleanup/                    # Repository cleanup archives
│   └── 2026-04-28/                 # Cleanup from this phase
│       ├── logs/                   # Old log files
│       ├── docs/                   # Old documentation
│       ├── agents/                 # Old agent configs
│       ├── brainstorm/             # Old brainstorm notes
│       └── ...
└── ...                             # Other dated archives
```

---

## Where Code Lives

### Backend (NestJS)

```
apps/api/src/
├── modules/
│   ├── ctm/
│   │   ├── parcels/                # Parcel entity + operations
│   │   ├── logradouros/            # Road/Street entity
│   │   └── vistorias/              # Inspections
│   ├── gis/
│   │   ├── layers/                # Map layers
│   │   ├── spatial/               # Spatial queries
│   │   └── tiles/                 # Vector tiles
│   ├── tax/
│   │   ├── iptu/                  # IPTU calculations
│   │   └── pgv/                   # PGV (Tax on property transfer)
│   └── auth/
│       ├── guards/                # RBAC guards
│       └── strategies/            # Auth strategies
├── common/
│   ├── decorators/                # Custom decorators
│   ├── filters/                   # Exception filters
│   ├── guards/                    # Global guards
│   └── utils/                     # Shared utilities
├── config/                        # Configuration modules
└── main.ts                        # Application entry
```

### Frontend (Next.js)

```
apps/web/
├── app/
│   ├── (auth)/                    # Auth routes group
│   ├── dashboard/                 # Dashboard pages
│   ├── maps/                      # Map-related pages
│   ├── ctm/
│   │   ├── parcelas/              # Parcel pages
│   │   ├── logradouros/           # Road pages
│   │   └── vistorias/             # Inspection pages
│   └── api/                       # API routes (Next.js)
├── components/
│   ├── layout/                    # Layout components
│   ├── maps/                      # Map components
│   ├── ctm/                       # CTM components
│   └── common/                    # Shared components
├── lib/
│   ├── hooks/                     # React hooks
│   ├── utils/                     # Frontend utilities
│   └── api/                       # API client
└── styles/                       # CSS/SCSS
```

---

## What to Ignore

### ❌ Do NOT Read

- **`.archive/`** - Archived files (historical only)
- **`node_modules/`** - Dependencies
- **`.next/`** - Next.js build cache
- **`dist/`** - Compiled output
- **`storage/`** - Local data (runtime only)
- **`test-results/`** - Test output (generated)
- **`playwright-report/`** - Test reports (generated)

### ❌ Do NOT Modify (Unless Explicitly Tasked)

- **`AGENTS.md`** - Project rules (Paulo owns)
- **`package.json` / `pnpm-lock.yaml`** - Dependency management
- **`docker-compose.yml`** - Infrastructure
- **`apps/api/src/main.ts`** - Application entry
- **`apps/web/app/layout.tsx`** - Root layout

### ❌ Do NOT Run (Use pnpm instead)

```bash
# INSTEAD OF this:
npm install
npm run build

# USE this (monorepo):
pnpm install
pnpm build
```

---

## Key Commands

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Build everything | `pnpm build` |
| Build API only | `npm run build -w apps/api` |
| Build Web only | `npm run build -w apps/web` |
| Run backend tests | `npm run test -w apps/api` |
| Run smoke tests | `pnpm test:smoke` |
| Run E2E tests | `pnpm test:e2e:fullscan:all` |
| Start development | `npm run dev` or `./start.sh` |
| Start Docker dev | `docker compose --profile dev up -d --build` |
| Clean build | `rm -rf dist .next node_modules/.cache` |

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| NestJS Modules | kebab-case | `modules/ctm/` |
| Next.js Routes | kebab-case | `app/ctm/parcelas/` |
| Components | PascalCase | `ParcelCard.tsx` |
| Utilities | kebab-case | `gis-helpers.ts` |
| Tests | `*.spec.ts` or `*.test.ts` | `parcel.service.spec.ts` |
| Test fixtures | `*.geojson`, `*.json` | `sp-parcels.geojson` |

---

## Quick Reference: Domain Model

```
Tenant
└── CTM (Cadastro Territorial Multi)
    ├── Parcel (Lote)             ← Central entity
    │   ├── Geometry (Polygon/MultiPolygon)
    │   ├── Owner
    │   ├── Tax Data (IPTU/PGV)
    │   ├── Inspections (Vistorias)
    │   └── Documents
    ├── Road (Logradouro)
    │   ├── Name
    │   ├── Type
    │   └── Geometry
    └── Inspection (Vistoria)
        ├── Type
        ├── Status
        ├── Assigned To
        └── Results

GIS
├── Layers
│   ├── Parcels
│   ├── Roads
│   └── Overlays
├── Spatial Index (2dsphere)
└── Tile Server (MVT)

Tax
├── IPTU
│   ├── Calculation
│   └── Value
└── PGV
    ├── Calculation
    └── Value
```

---

## Getting Help

**If stuck**: Read `AGENTS.md` first, then `docs/agents/00-AGENT-QUICKSTART.md`

**If something doesn't work**: Check `docs/planning/04-PROGRESS-LOG.md` for known issues

**If you need to add a feature**: Check `docs/planning/02-BACKLOG.md` for existing tasks

**If you're not sure where something goes**: Check this file (`docs/architecture/00-REPO-MAP.md`)
