# Geopixel Kill Gap Matrix

| Domain | Expected feature | Current evidence | Status | Competitive impact | Action |
| --- | --- | --- | --- | --- | --- |
| Portal coexistence | Signed deep links, SSO exchange, fallback local login | `/auth/portal/exchange`, `/integration-hub/portal-link`, `/portal/exchange` | PARCIAL | High | Integrate with real municipal IdP / portal gateway |
| Monitoring territorial | Alert -> triage -> assign -> close | `/monitoring/events/:id/triage`, `/assign`, `/close`, `/monitoring/dashboard` | PARCIAL | High | Add real feeds and richer evidence pipeline |
| Mobile field ops | Offline-first queue and sync | `/mobile/ctm-sync`, IndexedDB queue, auto-sync, status badges | PARCIAL | High | Add deeper conflict resolution and attachment lifecycle |
| Dashboard | Persistent widget layout | `/dashboard/layout` | PARCIAL | Medium | Add persona presets and comparative widgets |
| CTM/PGV/Monitoring | Core cadastre + valuation + observatory + monitoring summary | `/ctm/*`, `/pgv/*`, `/observatory/market`, `/monitoring/dashboard` | ATENDE/PARCIAL | High | Add richer discrepancy and scenario tools |
| Certidions/processes | Issuance and public validation | `/certificates/validate` | ATENDE | High | Add official templates and more workflows |
