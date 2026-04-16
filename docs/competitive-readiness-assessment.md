# Competitive Readiness Assessment

Status: live, evidence-based, incremental.

## Executive Verdict

The system is competitive for a municipal GeoIntelligence pilot and can participate in the same class of bidding as Geopixel in a narrower scope.
It is **not yet a full parity replacement** for Geopixel in all public surface areas.

Current stance:
- Can compete on: CTM core, PGV core, maps, certidions, work permits minimum, citizen calls minimum, environmental minimum, public works minimum, cemetery minimum, observatory minimum.
- Still loses on: external integrations, mature portal coexistence, advanced monitoring pipelines, configurable widgets, deeper analytics, and field/offline maturity.

## Repository Inventory

### Frontend
- Next.js App Router
- Layout, sidebar, command palette, route guards
- Pages for dashboard, maps, CTM, PGV, REURB, certidions, permits, monitoring, environment, 156, public works, cemetery, observatory

### Backend
- NestJS with JWT + tenant guard + roles guard
- MongoDB/Mongoose schemas
- Modules for auth, tenants, users, memberships, processes, alerts, assets, dashboard, CTM, PGV, surveys, mobile, REURB, certificates, permits, monitoring, environment, citizen-156, public-works, cemetery, observatory

### Infra / Ops
- Local stack support with MongoDB, Redis, MinIO, GeoServer
- Health check and metrics endpoint
- Cache abstraction
- Object storage abstraction

### Evidence Packs
- `/docs/ubatuba-traceability-matrix.md`
- `/docs/geopixel-public-gap-analysis.md`
- `/docs/ubatuba-prioritized-roadmap.md`
- `/docs/acceptance-checklist.md`
- `/docs/demo-scenarios.md`

## Competitive Conclusion

The product is technically credible for a municipal bid response if the scope is framed correctly.
It is stronger than a simple GIS/cadastro tool because it already includes:
- process flows
- auditability
- certidions
- permits
- environmental and citizen workflows
- executive dashboard
- observatory

But it is still vulnerable in a head-to-head comparison against a mature vendor because:
- some capabilities are minimal operational stubs
- some integrations are simulated or prepared, not production-connected
- advanced reporting and configuration are not yet rich enough
- public sector buying committees will ask for proofs the system only partially has

## Final Honest Position

If the tender is narrowly scoped around Ubatuba-like CTM + PGV + digital workflows, the system can compete.
If the tender expects Geopixel-level breadth across all public modules and mature integrations, it is still behind.
