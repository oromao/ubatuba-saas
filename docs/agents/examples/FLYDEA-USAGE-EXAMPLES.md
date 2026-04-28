# FlyDea Usage Examples

## Example 1: Planning Session

**Scenario**: Start daily work, identify next task

```
User: Vibe, inicie uma sessao de planejamento para o FlyDea

Vibe (using planning-manager skill):
1. Read AGENTS.md
2. Read docs/planning/00-PROJECT-CONTEXT.md
3. Read docs/planning/02-BACKLOG.md
4. Identify T1 tasks
5. Show:
   - T1: [ ] Fix login session hydration (BLOCKING)
   - T2: [ ] Implement parcel search API
   - T3: [ ] Add GIS validation to import

User: Trabalhe na T1

Vibe: 
- Read docs/planning/04-PROGRESS-LOG.md (last 10 entries)
- Read relevant files
- Mark task as IN_PROGRESS
- Execute
```

## Example 2: Debugging a Bug

**Scenario**: User reports "login session not persisting"

```
User: Vibe, debug do problema: login nao mantem sessao

Vibe (using systematic-debugging skill):
1. Reproduce: Try login flow
2. Identify boundary: Session lost after page refresh
3. Read files:
   - grep(pattern="session", path="src/auth")
   - read_file(path="src/auth/session.ts")
4. Find: Missing persist: true in NextAuth config
5. Fix with search_replace
6. Test: Verify session persists
7. Add regression test
8. Update plan
```

## Example 3:GIS Validation

**Scenario**: Validate parcel geometry import

```
User: Vibe, valide a importacao de geometrias do CTM

Vibe (using gis-govtech-review skill):
1. Check CRS: read_file(path="src/gis/import.ts")
2. Validate: grep(pattern="EPSG", path="src/gis")
3. Test geometry: Check for valid Polygon/MultiPolygon
4. Calculate bbox: Verify bbox calculation
5. Check centroid: Verify centroid calculation
6. Report: All geometries valid, CRS explicit
7. If issues: Open backlog item
```

## Example 4: E2E Flow Validation

**Scenario**: Validate First Execution Package

```
User: Vibe, valide o First Execution Package

Vibe (using e2e-real-user-validation skill):
1. Check list:
   - [x] login + hydrated session
   - [ ] /app/dashboard with real data
   - [ ] /app/maps with fallback
   - [ ] /app/ctm/parcelas search + detail + update
2. For each pending:
   - Read relevant code
   - Check API endpoint
   - Check DB connection
   - Identify gap
3. Report: 3/6 complete, need dashboard data
4. Open task: Implement dashboard real data
```

## Example 5: Documentation Update

**Scenario**: Add new architecture decision

```
User: Vibe, documente a decisao de usar PostGIS para geometrias

Vibe (using documentation-architect skill):
1. Create: docs/architecture/ADR-001-GIS-BACKEND.md
2. Format: Use template
3. Content:
   - Context: Need spatial queries
   - Decision: PostGIS
   - Alternatives: MongoDB, raw GeoJSON
   - Consequences: Performance, complexity
4. Link from docs/architecture/README.md
5. Verify: No broken links
6. Commit with message: [T3-ADR-001] GIS backend decision
```

## Example 6: Test-First Development

**Scenario**: Add parcel search endpoint

```
User: Vibe, implemente search de parcelas com teste primeio

Vibe (using test-first skill):
1. Create test: src/tests/api/parcels/search.test.ts
2. Test: POST /api/parcels/search
3. Run: npm test -- --testPathPattern=search
4. Fail: Endpoint not implemented
5. Implement: src/api/parcels/search/route.ts
6. Pass: Test green
7. Refactor if needed
8. Update plan
```

## Example 7: Performance Check

**Scenario**: Map rendering slow with 10k parcels

```
User: Vibe, o mapa esta lento com 10k parcelas

Vibe (using performance-check skill):
1. Measure: Time to render 10k geometries
2. Threshold: > 1s (FAIL)
3. Identify: No clustering implemented
4. Fix: Add clustering with Supercluster
5. Verify: Render time < 500ms
6. Document: Update performance thresholds
```

## Example 8: QA Hardening

**Scenario**: Before production deployment

```
User: Vibe, faça hardening para deploy de producao

Vibe (using qa-hardening skill):
1. Security check:
   - [ ] No hardcoded secrets
   - [ ] Input validation present
   - [ ] RBAC enforced
2. Performance check:
   - [ ] Load test passed
   - [ ] No memory leaks
3. Reliability check:
   - [ ] Error handling complete
   - [ ] Logging configured
4. Testing check:
   - [ ] All tests pass
   - [ ] Edge cases covered
5. Report: All checks pass OR list blockers
```

## Example 9: Context Economy

**Scenario**: Find usage of deprecated API

```
User: Vibe, onde usa a API antiga /api/v1/parcels?

Vibe (using context-economy skill):
1. Use grep (not read entire codebase):
   grep(pattern="/api/v1/parcels", path="src")
2. Result: 3 files found
3. Read only relevant sections:
   read_file(path="src/pages/parcels.tsx", offset=40, limit=20)
4. Stop: Found all usages
5. Report: 3 files, 5 usages
```

## Example 10: Anti-Loop

**Scenario**: Stuck on build error

```
User: Vibe, o build ta quebrando

Vibe (using anti-loop skill):
1. First attempt: Read error, try fix A
2. Same error: STOP
3. Re-read error carefully
4. Identify: Different error message detail
5. Second attempt: Fix B (different approach)
6. Success: Build passes

If still stuck:
- Ask: "Which TypeScript version is configured?"
- Don't: "Let me try 10 different things"
```

## Command Reference

### Filesystem
```
read_file(path="docs/planning/02-BACKLOG.md", limit=50)
write_file(path="docs/new.md", content="...", overwrite=false)
```

### Shell
```
bash(command="npm run build", timeout=120)
bash(command="git status")
bash(command="ls -la docs/planning/")
```

### Git
```
bash(command="git diff HEAD~1")
bash(command="git log --oneline -5")
bash(command="git show abc123")
```

### Search
```
grep(pattern="parcel", path="src/ctm")
grep(pattern="EPGS:3857", path="src/gis")
```

### Replace
```
search_replace(file_path="src/config.ts", content="<<<<<<< SEARCH
old_value
=======
new_value
>>>>>>> REPLACE")
```

### Planning
```
todo(action="read")
todo(action="write", todos=[...])
```

## Quick Commands

```bash
# Start Vibe in FlyDea
cd /Users/paulo/Documents/ubatuba-saas && vibe

# Check Vibe version
vibe --version

# Check config
cat ~/.vibe/config.toml | grep -A 5 mcp_servers

# List MCP files
ls ~/.vibe/mcp_servers/

# List skills
ls ~/.vibe/skills/

# Verify backup exists
ls ~/.vibe/backups/
```
