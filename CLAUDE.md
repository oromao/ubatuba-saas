# CLAUDE.md

This file provides guidance to Claude Code when working with this
repository.

------------------------------------------------------------------------

# FlyDea --- Municipal Geo-Intelligence SaaS

FlyDea is a Brazilian SaaS platform for Municipal Geo-Intelligence
(GeoInteligência Municipal).

It supports:

-   CTM (Cadastro Territorial Multifinalitário)
-   PGV (Planta Genérica de Valores)
-   Environmental monitoring
-   Digital approval workflows
-   GIS data import/export (GeoJSON, CSV)
-   Multi-tenant municipal deployments

Domain language (UI, DTOs, validation messages) is **Brazilian
Portuguese**.

------------------------------------------------------------------------

# Monorepo Structure

npm workspaces monorepo:

-   `apps/api` → NestJS backend (MongoDB, Redis optional, MinIO,
    GeoServer)
-   `apps/web` → Next.js 14 frontend (App Router, Tailwind, shadcn/ui)

------------------------------------------------------------------------

# Development Commands

  Action               Command
  -------------------- -------------------------------------------
  Dev (both apps)      `npm run dev`
  API only             `npm run dev -w apps/api`
  Web only             `npm run dev -w apps/web`
  Build all            `npm run build`
  Test API             `npm run test -w apps/api`
  Lint                 `npm run lint`
  Docker full stack    `docker compose up --build`
  Docker dev profile   `docker compose --profile dev up --build`
  Run migrations       `docker-compose run --rm migrate`

Ports: - API: 4000 - Web: 3000

------------------------------------------------------------------------

# System Architecture

## Multi-Tenancy

All requests must be scoped to a tenant.

Tenant resolution: - `x-tenant-id` header OR - JWT `tenantId` claim

`TenantGuard` sets `request.tenantId`.

Never trust client-provided tenantId without validation.

Use `@Public()` only when explicitly intended.

------------------------------------------------------------------------

## Global Guards (Execution Order)

JwtAuthGuard → TenantGuard → RolesGuard

Roles: - ADMIN - GESTOR - OPERADOR - LEITOR

Use `@Roles(...)` decorator for role restrictions.

------------------------------------------------------------------------

## API Response Conventions

Success responses are wrapped by `ResponseInterceptor`:

``` json
{
  "data": {},
  "meta": { "timestamp": "ISO_DATE" }
}
```

Errors follow RFC 7807-like structure:

``` json
{
  "type": "error_type",
  "title": "Error Title",
  "status": 400,
  "detail": "Detailed message",
  "instance": "/api/path"
}
```

Do not bypass these conventions.

------------------------------------------------------------------------

# GIS Stack

-   GeoServer → WMS raster serving
-   MinIO → GeoTIFF storage
-   MapLibre GL JS → frontend rendering
-   TerraDraw → drawing/editing
-   Turf.js → geometry utilities
-   MongoDB → 2dsphere indexes
-   GeoJSON → vector format (RFC 7946)

------------------------------------------------------------------------

# Geo Rules

-   Coordinate order: `[longitude, latitude]`
-   BBOX format: `minLng,minLat,maxLng,maxLat`
-   Always return valid GeoJSON FeatureCollection
-   Polygons must be closed (first = last coordinate)
-   Use MongoDB 2dsphere indexes for spatial queries
-   Never return raw Mongo geometry objects
-   Always serialize to GeoJSON Feature
-   Respect tenantId in all spatial queries

------------------------------------------------------------------------

# Security Rules

-   Never expose password or sensitive fields
-   Always apply JwtAuthGuard unless endpoint is @Public()
-   Apply @Roles('ADMIN') for privileged operations
-   Never trust client-provided tenantId
-   Do not disable guards unless explicitly instructed

------------------------------------------------------------------------

# How Claude Should Work Here

-   Make small, incremental changes
-   List modified files and explain impact
-   Never break multi-tenancy
-   Respect guards and interceptors
-   Maintain API response structure
-   Preserve GeoJSON correctness
-   Do not refactor unrelated modules
-   Ask clarification if domain logic is ambiguous
