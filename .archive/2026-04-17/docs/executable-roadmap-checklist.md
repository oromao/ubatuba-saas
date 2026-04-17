# Executable Roadmap Checklist

This checklist is the working order for hardening FlyDea into a licitation-grade municipal platform.
It is organized to reduce competitive risk first, then improve demo strength, then raise product maturity.

## Rules of Execution

- Do not open a new module unless it closes a real competitive gap.
- Prefer depth over breadth.
- Every item must end with evidence in code, test, build, or documentation.
- If a module is weak, keep it out of the flagship demo until it is defensible.
- No "10/10" claims without proof.

## Sprint 1 - Institutional Risk

### P0. Identity and Federated Access
- [ ] Finalize OIDC-ready institutional handoff flow
- [ ] Define external IdP mapping for tenant, profile, secretary, and permissions
- [ ] Add issuer/JWKS/refresh/logout readiness notes
- [ ] Keep local fallback login working
- [ ] Add audit events for authorize, callback, exchange, logout
- [ ] Add e2e proof for portal -> session -> RBAC -> dashboard -> logout

Acceptance criteria:
- [ ] Portal entry flow is demonstrable
- [ ] Session and RBAC remain valid after handoff
- [ ] Logout works coherently
- [ ] Build and tests pass

### P0. Tenant Isolation and RBAC
- [ ] Verify cross-tenant access is blocked in APIs and UI
- [ ] Add isolation tests for critical modules
- [ ] Review route permissions for all app screens
- [ ] Ensure secretary/profile access rules are explicit

Acceptance criteria:
- [ ] No cross-tenant leakage in critical flows
- [ ] RBAC rules are covered by tests

### P0. Audit and Traceability
- [ ] Strengthen audit trails for critical writes
- [ ] Expose history/timeline per entity where missing
- [ ] Make workflows explainable in the UI
- [ ] Add exportable evidence where useful

Acceptance criteria:
- [ ] Critical flows have a readable history
- [ ] Audit events are test-covered

## Sprint 2 - Field Operations

### P0. Offline Mobile
- [x] Harden local queue status handling
- [x] Keep retry manual and automatic
- [x] Track `lastError` and `lastAttemptAt`
- [x] Keep parcel version/state with offline records
- [x] Add conflict handling that is visible to the user
- [x] Preserve attachments/evidence offline until sync
- [x] Expose a compact mobile operations summary in the UI

Acceptance criteria:
- [ ] Offline capture works
- [ ] Sync works after reconnect
- [ ] Conflicts are visible and recoverable
- [ ] Evidence is not lost
- [x] The mobile screen shows queue health at a glance

### P0. Evidence Lifecycle
- [x] Keep evidence linked to the inspected object
- [x] Persist evidence metadata consistently
- [x] Show evidence in the operational flow after sync
- [x] Cover partial sync failure cases

Acceptance criteria:
- [x] Evidence can be captured offline and synced later
- [x] Evidence remains tied to its object

## Sprint 3 - Territory Monitoring

### P1. Monitoring Pipeline
- [x] Expose source breakdown
- [x] Expose type breakdown
- [x] Expose operational timeline
- [x] Keep triage/assign/close stages consistent
- [x] Make the dashboard operationally readable
- [x] Expose source mode and adapter readiness
- [x] Make evidence and notification stages explicit in the workflow

Acceptance criteria:
- [x] The monitoring flow is alert -> triage -> field -> outcome
- [x] The dashboard shows what is active, critical, and recent

### P1. External Feed Preparation
- [x] Keep adapter seams ready for remote feeds
- [x] Normalize event source inputs
- [x] Keep timeline and classification stable for future integrations

Acceptance criteria:
- [x] Integration points are present and documented

## Sprint 4 - Observatory

### P1. Analytical Observability
- [ ] Keep comparisons by period
- [ ] Keep comparisons by neighborhood/street/zone
- [ ] Keep discrepancy cards
- [ ] Keep CTM + PGV + monitoring cross-reading
- [ ] Add exportable CSV already in use

Acceptance criteria:
- [ ] Observatory is clearly decision-oriented
- [ ] Export supports demo and licitation response

### P1. Executive Narrative
- [ ] Keep revenue narrative
- [ ] Keep fiscalization narrative
- [ ] Keep planning narrative
- [ ] Keep the UI concise for secretary/fazenda/planning

Acceptance criteria:
- [ ] The observatory supports executive storytelling

## Sprint 5 - Core Territory

### P1. CTM
- [ ] Review parcel/logradouro/mobiliário linkage
- [ ] Strengthen parcel history where useful
- [ ] Improve discrepancy visibility
- [ ] Keep docs/images/evidence tied to territory

Acceptance criteria:
- [ ] CTM supports technical demo and cadastral reasoning

### P1. PGV
- [ ] Keep valuation rules explicit
- [ ] Keep zone/factor reading defensible
- [ ] Keep scenario and comparison narrative

Acceptance criteria:
- [ ] PGV supports justice-fiscal and revenue narrative

## Sprint 6 - Processes and Services

### P1. Certificates
- [ ] Keep issuance and public validation strong
- [ ] Add templates only when they improve credibility
- [ ] Keep the legal/hash validation story obvious

### P1. Digital Processes
- [ ] Strengthen workflow depth
- [ ] Keep task/requirement handling explicit
- [ ] Keep citizen and internal process views defensible

### P1. Works Permits
- [ ] Keep works permit workflow credible
- [ ] Strengthen stage and return-to-requester handling
- [ ] Keep fees and attachments consistent

### P1. Business Permits
- [ ] Keep company opening/closing credible
- [ ] Strengthen the tax/protocol story where supported

Acceptance criteria:
- [ ] Each service has a believable end-to-end flow

## Sprint 7 - Satellite Modules

### P1/P2. 156
- [x] Keep route, history, attachments, and routing
- [x] Add operational summary for backoffice readability
- [x] Decide whether it stays in the flagship demo

### P1/P2. Environment
- [x] Keep OS, reports, evidence, and traceability
- [x] Add operational summary for backoffice readability
- [x] Decide whether it stays in the flagship demo

### P1/P2. Public Works
- [x] Keep mediation/evidence basics
- [x] Add operational summary for backoffice readability
- [x] Decide whether it stays in the flagship demo

### P1/P2. Cemetery
- [x] Keep mapping and records basics
- [x] Add operational summary for backoffice readability
- [x] Decide whether it stays in the flagship demo

Acceptance criteria:
- [x] Weak modules are either hardened or demoted from the flagship demo
- [x] Satellite modules are positioned as support modules, not flagship differentiators

## Sprint 8 - Institutional Coexistence

### P1. Citizen Portal Coexistence
- [ ] Keep deep links and handoff patterns documented
- [ ] Keep SSO-ready flow consistent
- [ ] Keep portal coexistence explicit in the UI/docs

Acceptance criteria:
- [ ] The product coexists with an existing municipal portal, not duplicates it

## Sprint 9 - Demo and Commercial Readiness

### P2. Executive Dashboard
- [ ] Keep persisted widgets
- [ ] Keep readable views per secretary/profile
- [ ] Keep satellite health visible

### P2. Demo Script
- [ ] Keep the 15-minute demo script current
- [ ] Keep persona-based flow
- [ ] Keep revenue/fiscalization/value narrative sharp

### P2. Licitation Pack
- [ ] Keep battlecard current
- [ ] Keep readiness docs current
- [ ] Keep risk register current

Acceptance criteria:
- [ ] Sales and technical proof can be used together

## Sprint Exit Criteria

Before moving to the next sprint:
- [ ] Build passes
- [ ] Critical tests pass
- [ ] Demo route works locally
- [ ] Relevant docs are updated
- [ ] The gap that was targeted is visibly smaller

## Current Priority Order

1. Identity and federated access
2. Offline mobile and evidence lifecycle
3. Territory monitoring pipeline
4. Observatory analytics and export
5. CTM and PGV depth
6. Certificates and processes
7. Works/business permits
8. Satellite modules
9. Citizen portal coexistence
10. Demo and licitation pack

## Sprint Status

- Sprint 0: completed
- Sprint 1: completed for readiness and demo; pending real municipal IdP federation
- Sprint 2: in progress
- Sprint 7: satellite modules hardened for support/demo, demoted from flagship narrative
