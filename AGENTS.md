# AGENTS.md — FlyDea

Single source of truth for all AI agents (Codex CLI, Claude Code, Gemini CLI, Cursor).
If any other instruction conflicts → THIS FILE WINS.

---

# 0. CORE PRINCIPLE

This is an EXECUTION SYSTEM, not an audit system.

Agents MUST:
- fix real problems
- implement real features
- validate end-to-end
- maintain plan continuity across sessions
- continue automatically

Agents MUST NOT:
- re-audit endlessly
- over-analyze
- produce theoretical output
- skip the end-of-session plan update

---

# 1. IDENTITY (one line)

FlyDea is a multi-tenant municipal govtech SaaS with core in **GIS + CTM + taxation**.
The **parcel/lot is the central entity** and must connect to map, cadastre, IPTU/PGV, inspections, reports, processes.
Frontend: Next.js (App Router). Backend: NestJS (modular).
Reference competitor: GeoPixel (maturity calibration).

---

# 2. SOURCE OF TRUTH

Filesystem is the ONLY source of truth.

- ALWAYS read files before editing
- NEVER assume file content
- NEVER hallucinate code
- NEVER trust naming (files, routes, UI labels)

Not proven via filesystem → mark as NOT PROVEN.

---

# 3. MANDATORY READ ORDER (start of every session)

Before first write, read in this order:

1. `AGENTS.md` (this file)
2. `docs/planning/00-PROJECT-CONTEXT.md`
3. `docs/planning/07-DEFINITIONS.md`
4. `docs/planning/01-MATURITY-MATRIX.md`
5. `docs/planning/02-BACKLOG.md`
6. `docs/planning/03-EXECUTION-PLAN.md`
7. Last 10 entries of `docs/planning/04-PROGRESS-LOG.md`
8. `docs/planning/05-CLEANUP-INVENTORY.md` (status section only)
9. `docs/planning/06-TESTING-STRATEGY.md`

After the first load: read narrow, per-task. Do NOT re-read the full stack mid-session.

---

# 4. EXECUTION LOOP

1. Identify next REAL task from `02-BACKLOG.md` (respect priority T1 → T4)
2. Read minimal files (filesystem + only the planning file relevant to the task)
3. Patch code
4. Validate (test / log / proof)
5. Update plan (§14)
6. Continue

Rules:
- small, closed tasks
- one Writer at a time
- no pause between tasks unless §16 allows

---

# 5. MATURITY VOCABULARY (use these exactly)

- **REAL** — UI → API → DB, persisted, tested, reviewed
- **PARTIAL** — works in part, fails ≥1 REAL criterion
- **ZOMBIE** — exists but not navigable / no flow / no test
- **FAKE** — pretends to be real (mock data, dead buttons, fallback masking absence of backend)
- **DEAD** — unused, unreferenced, unloaded

Full criteria in `docs/planning/07-DEFINITIONS.md`.
Never say "ready", "working", "done" — use the labels above.

---

# 6. REAL FUNCTIONALITY RULE

A feature is REAL only if ALL of:
- works frontend → backend → database
- produces visible result
- usable by a real municipal operator
- no mock, demo, or fake data as primary behavior
- has automated test covering the flow

Any fail → NOT REAL → mark PARTIAL and open a backlog item.

---

# 7. USER FLOW VALIDATION (First Execution Package)

Until ALL of these pass E2E, NOTHING NEW enters:
- login + hydrated session, no blank screen
- `/app/dashboard` with real data
- `/app/maps` with fallback + interaction
- `/app/ctm/parcelas` search + detail + update
- `/app/ctm/logradouros` list + detail
- `/app/ctm/vistorias` create + status change

Mandatory E2E beyond First Execution Package:
- generate PDF (certidão / report)
- tax integration (parcel tax visible + coherent with dashboard)
- citizen portal flow
- parcel ↔ map ↔ tax ↔ inspection graph coherence

Failed flow → NOT PROVEN.

---

# 8. DOMAIN CONSISTENCY (parcel graph)

Every parcel MUST:
- appear on the map
- be searchable
- be editable
- link to inspection(s)
- link to tax data
- link to reports / processes

If not → INCONSISTENT SYSTEM → log in `05-CLEANUP-INVENTORY.md`.

---

# 9. NO FAKE MODULES

If a module is:
- UI without backend
- backend without UI wiring
- endpoint without flow
- mock pretending real

Then:
- implement minimum real version, OR
- HIDE from nav, OR
- ARCHIVE to `.archive/YYYY-MM-DD/`

Never leave FAKE visible in nav.

---

# 10. DEBUGGING MODE

1. find the boundary (where it breaks)
2. reproduce deterministically
3. isolate root cause (not symptom)
4. fix the minimal point
5. add regression test

No guessing. No speculative refactor.

---

# 11. ARCHITECTURE RULE

- respect existing modules
- no large refactors without explicit approval from Paulo
- prefer safe production fixes
- no unnecessary redesign

---

# 12. TOKEN ECONOMY (STRICT)

- no long explanations
- no repeated context
- no full-repo scans
- no unnecessary reads
- output MUST be compact (§15)

---

# 13. SUBAGENTS (single writer)

Roles:
- **Inspector** — reads files (narrow, per-task)
- **Debugger** — isolates root cause
- **Writer** — applies patches (ONLY ONE active)
- **Validator** — runs tests
- **Reviewer** — checks regression + confirms §14 done

Rules:
- one Writer at a time
- no overlapping writes
- Writer commits; Reviewer blocks merge if §14 skipped

---

# 14. END-OF-SESSION UPDATE (MANDATORY)

Before closing the session, Writer OR Reviewer MUST:

1. Update status in `docs/planning/02-BACKLOG.md`  
   (TODO → IN_PROGRESS → DONE / PARTIAL / BLOCKED)
2. Append NEW entry at TOP of `docs/planning/04-PROGRESS-LOG.md` (format inside the file)
3. Update `docs/planning/03-EXECUTION-PLAN.md`  
   (what finished, what's next)
4. If classification changed → update `docs/planning/05-CLEANUP-INVENTORY.md`
5. If maturity changed → update `docs/planning/01-MATURITY-MATRIX.md` + history row
6. Commit with format:
   ```
   [T<n>-<SLUG>] <short title>
   Ref: docs/planning/02-BACKLOG.md#<slug>
   Status: DONE | PARTIAL | BLOCKED
   Proof: <path to test / CI link>
   ```

No plan update → session is INCOMPLETE → Reviewer blocks.

---

# 15. OUTPUT FORMAT (every response, compact)

1. task
2. root cause
3. files changed
4. validation (proof)
5. what is fixed
6. NOT PROVEN (what remains)
7. plan update — yes/no + which files
8. next task

No prose essays.

---

# 16. ANTI-STALL RULE

DO NOT STOP.

Continue automatically.

Stop only if:
- real blocker (missing credential, infra failure)
- unsafe change (data loss risk, security risk)
- architectural decision required by Paulo
- §14 incomplete (fix it, then continue)

---

# 17. CLEANUP / ARCHIVE RULE

NEVER delete files.

- Move to `.archive/YYYY-MM-DD/<original-path>/`
- Register in `docs/planning/05-CLEANUP-INVENTORY.md`
- Deletion candidate only after 2 sprints in archive + Paulo approval

---

# 18. LINT / SCOPE RULE

DO NOT clean the entire repo.

Only fix:
- files changed in this task
- critical issues that block §14

---

# 19. GIS HARD REQUIREMENTS

System MUST:
- support Polygon / MultiPolygon
- correct CRS (EPSG explicit)
- correct centroid / bbox
- correct fitBounds (handle malformed geometry)
- handle large datasets (10k+ geometries)
- support layers and overlays
- WebGL fallback explicit (never silent)

GIS must be OPERATIONAL, not visual.

---

# 20. TEST STRATEGY

Pyramid:
- **SMOKE** — boot, health, every nav route
- **UNIT** — services, GIS utils, validations, RBAC guards
- **INTEGRATION** — API + DB, imports, workflows
- **E2E** — real user flows (§7)

Critical feature without test → NOT DONE.

100% coverage applies ONLY to:
- files changed in the PR
- high-risk domain helpers (GIS, tax, workflow, RBAC)

Full-repo coverage is cosmetic — ignore.

---

# 21. PERFORMANCE RULE

System must handle:
- large parcel datasets (10k+)
- map rendering without freeze
- fast search (<500ms p95)
- stable dashboard under load

---

# 22. BENCHMARK (GeoPixel calibration)

Continuously compare with GeoPixel-class systems on:
- CTM
- GIS
- taxation
- inspections
- workflows
- citizen portal
- dashboards
- auditability / multi-tenant

Gap → add item to `02-BACKLOG.md` with tier.

---

# 23. KNOWN RISK AREAS (stricter validation)

- geodata
- tax integration
- uploads
- notifications
- RBAC
- LGPD (personal data audit trail)
- multi-tenant isolation

---

# 24. DEFINITION OF DONE

DONE only if:
- code works (UI → API → DB)
- tests pass (right level, §20)
- flow is REAL (§5, §6)
- plan updated (§14)
- Paulo reviewed (or explicit delegation recorded in log)

NOT DONE if:
- "looks correct"
- "partially works"
- "test later"
- "plan update later"

---

# 25. DECISION OWNER

Final decision on:
- architecture
- module removal
- scope change
- "DONE" acceptance on critical items

→ **Paulo** (engineering/DevOps, Catanduva-SP).

When in doubt → ask. Do not guess architecture.

---

# FINAL RULE

Less talking.
More fixing.
More validating.
More shipping.
Plan always updated.

<claude-mem-context>
# Memory Context

# [flydea] recent context
<!-- auto-updated by claude-mem; do not edit manually -->
</claude-mem-context>