# 09 — Multi-Agent Parallel Execution Handbook

> Guia para **Claude**, **Codex**, **Gemini** trabalharem em paralelo sem conflito.
> Atualizado: `2026-04-24`

---

## 🚀 Como Usar Este Handbook

**Se você é uma IA:**
1. Leia sua seção (Claude / Codex / Gemini)
2. Escolha um T1 item do backlog que **não está BLOCKED nem IN_PROGRESS**
3. Siga o workflow para o seu tipo
4. Commit + update backlog + notifique no progress log

**Se você é Paulo:**
1. Leia "Overview" e "Orchestration"
2. Dispatch IAs para items específicos conforme necessário
3. Monitore `docs/planning/04-PROGRESS-LOG.md` para conflitos

---

## 📍 Overview: T1-AUDIT Parallelization

4 bloqueadores críticos, 4 possíveis paralelos:

| Item | Tipo | IA Ideal | Esforço | Status |
|---|---|---|---|---|
| **T1-AUDIT-PORTAL-CIDADAO** | Backend API | Codex | 6h | TODO |
| **T1-AUDIT-VISTORIAS** | Frontend Component | Claude | 4h | TODO |
| **T1-AUDIT-ROUTING** | Next.js Router | Gemini | 5h | TODO |
| **T1-AUDIT-CTM-EQUIPAMENTOS** | Frontend Page | Claude | 3h | TODO |

---

## 👤 Claude's Workflow (Frontend, UX Focus)

### Your Strengths
- React component design
- UX/empty states excellence
- Test writing (Playwright)
- Clear, concise commits

### Your T1 Items (Pick 1)

#### T1-AUDIT-VISTORIAS (4h)
**Workflow:**
1. Start `/app/ctm/vistorias/page.tsx` — find the button, check onClick handler
2. Use React DevTools to inspect component tree
3. If handler missing: implement it to open modal
4. If modal missing: create modal component based on pattern from existing modals
5. Write Playwright test: button click → modal opens → form fields render → save → backend call
6. Commit with message: `[T1-AUDIT-VISTORIAS] Fix survey creation button`
7. Update backlog status → DONE
8. Add entry to 04-PROGRESS-LOG.md

**Testing:**
```bash
pnpm playwright test --grep "survey creation button" -g "responds to click"
```

**Validation before DONE:**
- ✅ No console errors
- ✅ Playwright E2E passes
- ✅ Manual browser test passes
- ✅ API endpoint responds (check with curl first)

---

#### T1-AUDIT-CTM-EQUIPAMENTOS (3h)
**Workflow:**
1. Check if `/app/ctm/equipamentos/page.tsx` exists
2. If not: create it using `/app/ctm/vistorias/page.tsx` as template
3. Add route to `nav-config.ts` if not present
4. Ensure page loads without 404
5. Add table placeholder (empty state is OK at this stage)
6. Write Playwright test: navigate to route → page loads → 200 status
7. Commit: `[T1-AUDIT-CTM-EQUIPAMENTOS] Create equipamentos page`
8. Update backlog → DONE

**Testing:**
```bash
pnpm playwright test --grep "equipamentos route" -g "loads without 404"
```

---

### Claude's Communication Protocol

**Starting a task:**
```
POST to memory/claude-work.md:
- Date: 2026-04-24
- Task: T1-AUDIT-VISTORIAS
- Estimated: 4h
- Status: IN_PROGRESS
```

**When done:**
```
COMMIT MESSAGE FORMAT:
[T1-AUDIT-{ITEM}] Brief description

- What you changed
- Why
- Validation (test output)

Closes: T1-AUDIT-{ITEM}
```

**Update backlog:**
In `docs/planning/02-BACKLOG.md`:
```
### T1-AUDIT-VISTORIAS
- **Status:** `DONE` (was TODO)
- **Agente:** Claude (2026-04-24)
```

**Notify:** Add line to `04-PROGRESS-LOG.md` top:
```
### 2026-04-24 — Claude — T1-AUDIT-VISTORIAS
- **Status muda:** TODO → DONE
- **Feito:** [paste your work summary]
- **Arquivos alterados:** [list]
- **Testes adicionados:** [list or "nenhum"]
- **Prova:** [test output or link]
- **Próximo:** [what's next]
- **Notas:** [anything useful for next agent]
```

---

## 👤 Codex's Workflow (Backend, API Focus)

### Your Strengths
- NestJS modules (architecture)
- Database schema understanding
- API debugging
- Docker/test environment expertise

### Your T1 Item

#### T1-AUDIT-PORTAL-CIDADAO (6h)
**Workflow:**
1. Check `docker logs ubatuba-saas-api-dev-1` for actual error message
2. Open `apps/api/src/modules/citizen-156/` — inspect:
   - `citizen-156.controller.ts` — POST /api/cidadao/solicitacoes endpoint
   - `citizen-156.service.ts` — business logic
   - `dto/create-citizen-request.dto.ts` — validation rules
3. Reproduce error locally:
   ```bash
   curl -X POST http://localhost:4000/api/cidadao/solicitacoes \
     -H "Content-Type: application/json" \
     -d '{"categoria":"Test","assunto":"Test","descricao":"Test","endereco":"Test"}'
   # Note actual error response
   ```
4. Debug: Is it validation? Database? Missing field? Missing table?
5. Fix and test with curl
6. Write E2E test in `apps/api/test/citizen-requests.e2e.spec.ts`
7. Commit: `[T1-AUDIT-PORTAL-CIDADAO] Fix 500 error on citizen request submission`
8. Update backlog → DONE

**Testing:**
```bash
cd apps/api
npm run test:e2e -- --testNamePattern="citizen request submission succeeds"
```

**Validation before DONE:**
- ✅ curl returns 200 + valid response
- ✅ E2E test passes
- ✅ Database has new record
- ✅ No console errors in Docker logs

---

### Codex's Communication Protocol

**Starting:**
```
POST to memory/codex-work.md:
- Date: 2026-04-24
- Task: T1-AUDIT-PORTAL-CIDADAO
- Estimated: 6h
- Status: IN_PROGRESS
```

**When done:**
Same format as Claude, but focus on API logs and E2E test output.

---

## 👤 Gemini's Workflow (Router, DevEx Focus)

### Your Strengths
- Next.js routing internals
- Middleware debugging
- Configuration management
- Cross-module dependencies

### Your T1 Item

#### T1-AUDIT-ROUTING (5h)
**Workflow:**
1. Identify broken routes:
   - /app/relatorios → redirects to /app/dashboard
   - /app/aprovacao → redirects to /app/dashboard
2. Search for redirect source:
   - `apps/web/src/middleware.ts` — any redirect logic?
   - `apps/web/next.config.js` — rewrites/redirects section?
   - `apps/web/src/app/layout.tsx` or nested layouts — any guards blocking access?
3. Check if page files exist:
   ```bash
   ls -la apps/web/src/app/app/relatorios/page.tsx
   ls -la apps/web/src/app/app/aprovacao/page.tsx
   ```
4. If pages exist but redirect: remove the redirect logic
5. If pages don't exist: create minimal pages (even empty is OK for now)
6. Test navigation:
   ```bash
   curl -L http://localhost:3000/app/relatorios -I | grep Location
   # Should show 200, not redirect
   ```
7. Write E2E test: navigate → page loads → 200 status
8. Commit: `[T1-AUDIT-ROUTING] Fix redirect logic for admin routes`

**Testing:**
```bash
pnpm playwright test --grep "admin routes" -g "load without redirect"
```

---

### Gemini's Communication Protocol

Same as Claude/Codex.

---

## ⚔️ Conflict Resolution

### If two IAs pick the same item

**Rule:** First one to POST to progress log wins.
- If you start T1-AUDIT-VISTORIAS and see it's already IN_PROGRESS, pivot to T1-AUDIT-CTM-EQUIPAMENTOS
- Update memory with what you found so the other IA doesn't duplicate

### If two IAs edit the same file

**Rule:** Last commit wins, but rebase first.
- `git pull --rebase origin integration/consolidate-active-work`
- Resolve conflicts in `02-BACKLOG.md` (typically no real conflict, just status changes)
- `git push`

### If tests fail in CI after your commit

**Your responsibility:**
1. Pull and reproduce locally
2. Fix the test or the code
3. Commit fix with message: `[FIX] T1-AUDIT-{ITEM} — resolve flaking test`
4. Notify other IAs in progress log

---

## 📊 Status Board (Live)

**Location:** `docs/planning/02-BACKLOG.md` → T1 section

Each IA should check BEFORE starting:
```bash
grep -A2 "T1-AUDIT" docs/planning/02-BACKLOG.md | grep "Status:"
```

Legend:
- `TODO` = Available
- `IN_PROGRESS` = Someone working
- `BLOCKED` = Issue preventing work
- `DONE` = Completed, validated

---

## 🔄 Handoff Protocol

When you finish a T1 item:

1. **Commit to git** (see format above)
2. **Update backlog** (status → DONE, add agente name)
3. **Update progress log** (append entry to top)
4. **Add memory note** (if pattern useful)
5. **Notify Paulo** (optional: msg in slack/email/chat)

**Example:**
```
Committed T1-AUDIT-VISTORIAS to main
Updated docs/planning/02-BACKLOG.md (status DONE)
Updated docs/planning/04-PROGRESS-LOG.md (entry added)
No blocking issues found
T1-AUDIT-CTM-EQUIPAMENTOS ready for next agent
```

---

## 🎯 Success Metrics

By end of **2026-04-26** (Friday):

- [ ] All 4 T1-AUDIT items → DONE (or BLOCKED with reason)
- [ ] Deploy tested on VPS
- [ ] Zero merge conflicts
- [ ] Progress log entries for each completion
- [ ] Backlog 100% accurate (status reflects reality)

---

## 📞 Emergency Escalation

**If you hit a blocker:**

1. **Document it:** Add comment to backlog item with reason
2. **Change status to BLOCKED:** Include what's blocking
3. **Notify Paulo:** Send message with item name + blocker
4. **Don't abandon:** Leave note for next IA on what to investigate

**Example:**
```
### T1-AUDIT-PORTAL-CIDADAO
- **Status:** `BLOCKED`
- **Blocked by:** Database table `citizen_requests` does not exist
  - Checked migrations in `apps/api/src/migrations/`
  - No migration file found
  - Needs schema design + migration creation
- **Agente:** Codex
- **Next:** Paulo to decide schema or provide migration
```

---

## 🧠 Knowledge Sharing

**In your progress log entry, include LEARNINGS:**

Bad:
```
- **Feito:** Fixei o button clique
```

Good:
```
- **Feito:** O button não respondia porque onClick estava em wrapper div, não no button element.
  Pattern: usar `<button onClick={handler}>` direto, não wrapper.
```

---

## 💡 Tips for Smooth Parallelization

1. **Check backlog first** — don't duplicate effort
2. **Pull before starting** — get latest code
3. **Commit frequently** — small atomic commits, not one monster commit
4. **Test locally** — before pushing, verify your item works
5. **Communication** — if you find something unexpected, note it in progress log
6. **Rebase if needed** — if merge conflicts appear, fix them before pushing

---

## 📝 Template: Your First T1-AUDIT Task

```bash
# 1. Pick a T1 item (check backlog status first)
# 2. Branch
git checkout integration/consolidate-active-work
git pull origin integration/consolidate-active-work

# 3. Work on your item
# (follow your role's workflow above)

# 4. Test
pnpm playwright test  # or npm run test:e2e

# 5. Commit
git add .
git commit -m "[T1-AUDIT-{ITEM}] Brief fix description

- What you changed
- Testing approach
- Validation result

Closes: T1-AUDIT-{ITEM}"

# 6. Push
git push origin integration/consolidate-active-work

# 7. Update docs/planning/
# Edit 02-BACKLOG.md → status DONE + your name
# Append to 04-PROGRESS-LOG.md → entry with your work

# 8. Final commit to docs
git add docs/planning/02-BACKLOG.md docs/planning/04-PROGRESS-LOG.md
git commit -m "docs: T1-AUDIT-{ITEM} completed"
git push origin integration/consolidate-active-work

# DONE! ✅
```

---

## Questions?

Default answer: **Check backlog.md and progress-log.md first.**

If unclear:
1. Inspect the item's "Depende de:" field (dependencies)
2. Read the DoD (Definition of Done)
3. Check 08-AUDIT-FINDINGS-SUMMARY.md for detailed debugging
