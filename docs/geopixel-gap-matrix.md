# Geopixel Gap Matrix

Legend:
- `ATENDE`
- `ATENDE PARCIALMENTE`
- `NÃO ATENDE`
- `PENDENTE DE EVIDÊNCIA`

| Feature expected publicly | Municipal need | Current system | Gap | Competitive risk | Priority | Action | Acceptance evidence |
|---|---|---|---|---|---|---|---|
| CTM core | Mandatory | Parcels, streets, furniture, map, editing, history | Partial UX consolidation | Medium | P0/P1 | Unify timelines and discrepancy views | `/ctm/*`, geojson, audits |
| PGV core | Mandatory | Zonas, faces, factors, valuations, exports | Simulação/analytics limited | Medium | P1 | Improve scenario comparison | `/pgv/*`, valuations export |
| Monitoring of alterations | Common bid differentiator | Alerts + monitoring modules with stage transitions, evidence lifecycle, filters, dashboard and adapter seams | Official external ingestion still missing | High | P1 | Connect real imagery/event feeds into the prepared seams | Alert stages, evidence, geo data, adapter readiness |
| Environmental monitoring | Defense civil use | Environmental cases + alerts with source mode, notification stage, evidence stage and adapter readiness | No official external feeds in production | High | P1 | Connect INMET/INPE/CEMADEN into the prepared adapters | Event pipeline + alerting |
| Digital works permit | Eliminatory in many bids | Minimum permit flow | Missing richer SLA/signature/portal | High | P1 | Expand workflow and integration prep | Permit endpoints + PDF |
| Business permit | Eliminatory in many bids | Minimum permit flow | Missing richer workflow | High | P1 | Expand workflow and integration prep | Permit endpoints + PDF |
| Observatory | Sales differentiator | Dashboard + observatory with comparative rows, coverage indicators and CSV export | Advanced analytics still limited versus mature suites | Medium | P2 | Add richer exports/charts and persona-specific reads | `/dashboard/executive`, `/observatory/market` |
| Mobile field app | Operational | PWA/minimum offline queue | Offline sync partial | High | P1 | Strengthen offline sync & evidence capture | `/mobile`, queue sync |
| Environmental licensing | Public sector need | Minimal environmental cases | Workflow depth limited | Medium | P1 | Add OS, laudos, tasks, map views | `/app/ambiental` |
| Certificates and validation | Eliminatory | Certificate issuance + public validation | Template/portal polish missing | Low | P0 | Template pack + public portal adapter | Validation endpoint + PDF |
| 156 citizen service | Common in municipalities | Minimum calls + linkage | Citizen portal/backoffice split missing | Medium | P1 | Separate public/citizen view | `/app/156` |
| Public works | Competitive add-on | Minimum works flow | Map/indicators missing | Medium | P2 | Add executive indicators | `/app/obras-publicas` |
| Cemetery | Competitive add-on | Minimum plots flow | Map/reporting missing | Low | P2 | Add map and reports | `/app/cemiterio` |
| Portal coexistence | Contractual reality | Deep links + route guards | Integration hub with adapters and portal links | Partial | High | P0 | Formalize SSO and external portal contract | `/integration-hub/adapters`, `/integration-hub/portal-links` |
| Audit & RBAC | Eliminatory | Tenant guard + roles guard | Secretary-level granularity partial | Medium | P0 | Extend claims by department | Guards, route rules |
| Documentation for bid | Eliminatory | Strong but still partial | No formal proof pack consolidated | High | P0 | Create bid pack and evidence index | Docs + screenshots + checks |
