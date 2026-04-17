# Executable Roadmap by Sprints

This roadmap converts the competitive backlog into a sprint plan that minimizes licitation risk first and demo risk second.

## Estimation Scale

- `S`: small, 1-2 focused sessions
- `M`: medium, a few sessions and a couple of test passes
- `L`: large, multiple sessions and cross-module coordination
- `XL`: very large, likely a mini-initiative

## Sprint 0 - Stabilization

### Goal
Keep the platform bootable, testable, and safe to iterate on.

### Deliverables
- Local runbook
- Stable demo credentials
- Build green across web and api
- Critical tests green
- Health checks green

### Dependencies
- None

### Effort
- `M`

### Exit Criteria
- Local boot works
- Build and tests pass
- Demo can be opened locally

---

## Sprint 1 - Institutional Trust

### Goal
Close the highest-risk licitation gap: identity, coexistence, and institutional handoff.

### Deliverables
- OIDC-ready handoff flow
- Session endpoint with institutional context
- Fallback local login
- Logout coherence
- Audit events for the handoff flow
- E2E proof of portal -> session -> RBAC -> dashboard -> logout

### Dependencies
- Sprint 0

### Effort
- `L`

### Exit Criteria
- Handoff works in browser and in e2e
- RBAC remains valid after handoff
- Session context is visible

---

## Sprint 2 - Field Reliability

### Goal
Make mobile field operation credible in low connectivity.

### Deliverables
- Offline queue status
- Retry automatic/manual
- Evidence capture offline
- Sync after reconnect
- Conflict handling
- Evidence lifecycle visible after sync
- Mobile operations summary in the first screen fold

### Dependencies
- Sprint 0

### Effort
- `L`

### Exit Criteria
- Offline -> sync -> backend flow works
- Conflict states are visible and recoverable
- Queue health is readable immediately on the mobile screen

---

## Sprint 3 - Monitoring Operations

### Goal
Make territorial monitoring feel like a real operational desk.

### Deliverables
- Source breakdown
- Type breakdown
- Operational timeline
- Better dashboard cards
- Stage flow consistency
- Adapter seams for external feeds

### Dependencies
- Sprint 0

### Effort
- `M`

### Exit Criteria
- Monitoring dashboard is readable at executive and operator level
- Flow is alert -> triage -> field -> outcome

---

## Sprint 4 - Executive Observatory

### Goal
Turn the observatory into a decision tool, not a simple panel.

### Deliverables
- Comparisons by period
- Comparisons by neighborhood/street/zone
- Discrepancy cards
- Cross-reading CTM + PGV + monitoring
- CSV export
- Executive narrative

### Dependencies
- Sprint 0
- Some pieces of Sprint 3

### Effort
- `M`

### Exit Criteria
- Observatory supports revenue, fiscalization, and planning stories
- Export is available for licensing/demo

---

## Sprint 5 - Territory Core Depth

### Goal
Strengthen the product core around cadastral and fiscal territory.

### Deliverables
- CTM linkage/historic/discrepancy depth
- PGV scenario and comparison depth
- Better territory-to-fiscal cross-reading

### Dependencies
- Sprint 0
- Observability from Sprint 4

### Effort
- `L`

### Exit Criteria
- CTM and PGV can stand up to technical demo scrutiny

---

## Sprint 6 - Processes and Certification

### Goal
Make certificates and digital processes defensible.

### Deliverables
- Strong public certificate validation
- Templates where useful
- Workflow depth for processes
- Works permit depth
- Business permit depth

### Dependencies
- Sprint 0
- Core identity from Sprint 1

### Effort
- `L`

### Exit Criteria
- Certificates and processes have believable end-to-end flows

---

## Sprint 7 - Satellite Modules Decision

### Goal
Either harden or demote weak modules.

### Deliverables
- 156 depth check
- Environmental depth check
- Public works depth check
- Cemetery depth check
- Demo placement decision

### Dependencies
- Sprint 0
- Core identity from Sprint 1

### Effort
- `M`

### Exit Criteria
- Each satellite module is either defensible or removed from flagship demo

---

## Sprint 8 - Institutional Coexistence

### Goal
Make coexistence with an existing municipal portal explicit and easy to explain.

### Deliverables
- Deep links
- Hand-off docs
- Coexistence strategy docs
- SSO readiness narrative

### Dependencies
- Sprint 1

### Effort
- `S`

### Exit Criteria
- A municipality can understand how the product fits beside the current portal

---

## Sprint 9 - Demo and Sales Readiness

### Goal
Package the product for procurement, demo, and proposals.

### Deliverables
- Demo script
- Battlecard
- One-pager
- Readiness matrix
- Risk register
- Product narrative by persona

### Dependencies
- Sprint 4
- Sprint 5
- Sprint 6
- Sprint 7

### Effort
- `M`

### Exit Criteria
- Sales can explain the product without overpromising
- Tech can support the pitch with evidence

---

## Suggested Overall Sequence

1. Sprint 0
2. Sprint 1
3. Sprint 2
4. Sprint 3
5. Sprint 4
6. Sprint 5
7. Sprint 6
8. Sprint 7
9. Sprint 8
10. Sprint 9

## Fastest Competitive Payoff

If speed matters more than perfect sequencing:
1. Sprint 1
2. Sprint 2
3. Sprint 3
4. Sprint 4
5. Sprint 9

That gives the best combination of:
- lower licitation risk
- stronger demo
- better operational credibility
