# FlyDea / São Paulo SaaS - Project Gap Context

Last updated: 2026-04-17

## Purpose
This file is the persistent working context for future Codex sessions on this repository.
It captures the verified gap baseline, what has already been remediated, and what still needs execution.

## Ground Truth
- The system has a decent technical base but is not municipal-grade yet.
- Do not restart broad brainstorming or full audits from here.
- Treat this file as the execution backlog baseline.
- If a fact is not proven in code, mark it `NOT PROVEN`.

## Verified Baseline
- Backend build passes.
- Frontend build passes.
- Backend lint still fails broadly outside touched files.
- Browser/UI E2E remains partially proven: `/app/maps` draw flow reached authenticated state after fixing the auth/session boundary, but several long-running Playwright flows are still inconclusive.
- REURB regression was verified and fixed in the regression spec boundary.
- Tax integration had fake-success SFTP behavior.
- REURB export had dummy GeoJSON behavior.
- Upload boundary was fragile and needed production-hardening.
- GIS/CTM remains partially operational and still needs stronger proof on CRS/SRID/import/consistency.

## Already Remediated
- REURB regression spec now sends `x-lgpd-purpose`, so the test reaches domain validation instead of failing with `403`.
- Tax integration SFTP no longer fakes success; it now returns an explicit error contract.
- REURB dossier export no longer ships fake GeoJSON plant data; it now emits an explicit `NAO_IMPLEMENTADA` placeholder.
- Upload controller now uses disk-backed staging instead of memory-only handling.
- Upload service now persists staged files safely and removes the staging file after copy.
- Playwright auth helpers for maps / REURB / integration flows now use `sessionStorage`, matching the app's real auth contract.
- Authenticated `/app/maps` draw E2E proof passed once the session boundary was aligned.

## Remaining High-Priority Gaps
1. Finish or shorten the still-long Playwright flows that remain inconclusive after the auth/session fix:
   - `maps-smoke`
   - `reurb-flow`
   - `critical-flows`
   - any other helper that still assumes `localStorage`
2. REURB regression re-check if any assertion still depends on the old session helper path.
3. Backend lint hardening in critical modules.
4. Remove the highest-risk `any`, dead vars, and unsafe `ts-ignore` in:
   - CTM
   - PGV
   - REURB
   - tax-integration
   - uploads
   - observatory / monitoring
5. GIS hardening:
   - CTM parcel GeoJSON import contract
   - CRS/SRID proof path
   - bbox / centroid consistency
   - map ↔ cadastro ↔ backend consistency
6. Honest handling of any remaining demo/stub behavior.
7. Browser validation for core routes after backend stability improves.

## GeoPixel Gap Summary
GeoPixel is ahead in:
- CTM depth and integration
- fiscal / tributary integration
- PGV / value-related workflows
- territorial monitoring and alerting
- citizen service and municipal process breadth
- field/mobile operational maturity
- auditability / traceability

FlyDea current state:
- promising module coverage
- several real flows exist
- still too much partial behavior, boundary fragility, and unproven production readiness

## Working Rules for Future Sessions
- Start from the highest-priority verified open task.
- Inspect only the necessary files.
- Patch code immediately.
- Add or update tests with every meaningful fix.
- Run the narrowest validation that proves the change.
- Move to the next task automatically if unblocked.
- Do not claim production readiness without proof.

## Recommended Next Tasks
1. Shorten or finish the remaining long E2E flows with the correct `sessionStorage` auth helper.
2. REURB regression re-check only if the helper change exposed a failure.
3. Backend lint hardening in critical municipal modules.
