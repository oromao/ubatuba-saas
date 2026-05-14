# Arquitetura FlyDea (REVISADA)

## Stack REAL
```
Frontend: Next.js 14 (App Router), TypeScript, MapLibre GL
Backend:  NestJS (modular), TypeScript, Mongoose 7
Database: MongoDB 7 (ODM: Mongoose, índices: 2dsphere para GIS)
GIS:      GeoServer 2.24.2 (WMS/WFS), geojson-vt + vt-pbf (MVT tiles)
Cache:    Redis 7
Storage:  MinIO (S3-compatible) para GeoTIFFs
Infra:    VPS (Docker Compose — nginx + mongo + redis + minio + geoserver + api + web)
```

## Arquitetura Multi-tenant
```
[apps/web] ──HTTP──> [apps/api] ──Mongoose──> [MongoDB (tenantId em toda collection)]
    │                     │
    │              [JwtAuthGuard]
    │              [TenantGuard (x-tenant-id)]
    │              [RolesGuard (RBAC)]
    │              [GeoServer WMS/WFS]
    │              [MinIO S3]
```

## Stack de Dados SP
```
GeoSampa WFS ──> scripts/geosampa-import.cjs ──> storage/geosampa-setor-*.geojson ──> MongoDB (parcels)
OSM Overpass  ──> scripts/download-real-data.sh ──> storage/sp-real-parcels.geojson  ──> MongoDB
SP Mapas      ──> layers.service.ts (50+ layers) ──> GeoJSON URLs externas ──> MapLibre GL
```

## Entidade Central: Parcela (MongoDB Schema)
```
{
  tenantId: ObjectId,
  geometry: { type: "Polygon", coordinates: [...] },  ← 2dsphere index
  sqlu: string,              // Sistema de Licenciamento Urbanístico
  inscricaoImobiliaria: string,
  setor: string, quadra: string, lote: string,
  enderecoPrincipal: { logradouro, bairro, cidade, cep },
  areaTerreno: number, areaConstruida: number,
  iptuLancado: number, iptuPago: number,
  zoneamento: string,
  statusCadastral: string,
  geometryOrigem: string,     // GEO_SAMPA, OSM, MANUAL
}
```

## Módulos Core (38 existentes)
| Módulo | Status | Rotas |
|---|---|---|
| `gis` | ✅ | /gis/bbox, /gis/cluster, /gis/mvt, /gis/transform |
| `ctm/parcels` | ✅ | CRUD, /geojson, /tiles, /import, /subdivision |
| `ctm/logradouros` | ✅ | CRUD |
| `ctm/vistorias` | ✅ | CRUD + workflow |
| `pgv/zones` | ✅ | CRUD zonas de valor |
| `pgv/faces` | ✅ | CRUD faces de quadra |
| `pgv/factors` | ✅ | CRUD fatores (terreno, construção) |
| `pgv/valuations` | ✅ | Cálculo de valor venal |
| `pgv/simulations` | ✅ | Cenários what-if |
| `pgv/iptu` | ✅ | Cálculo IPTU (valor × alíquota) |
| `reurb` | ✅ | Projetos de regularização |
| `layers` | ✅ | Camadas GIS (50+ SP zoneamento) |
| `map-features` | ✅ | Features no mapa |
| `auth` | ✅ | JWT, RBAC, OIDC |
| `tenants` | ✅ | Multi-tenant config |
