# 10 — Repository Cleanup Plan

> **Purpose**: Clean, organize, and document the repository for better human/AI understanding
> **Owner**: Documentation Architect
> **Status**: IN_PROGRESS
> **Created**: 2026-04-28

---

## ClassificationLegend

| Classification | Description | Risk |
|---|---|---|
| KEEP | Core project files, actively used | LOW |
| MOVE_TO_DOCS | Documentation files in wrong location | LOW |
| MOVE_TO_SCRIPTS | Utility scripts in wrong location | LOW |
| ARCHIVE | Old/obsolete files, not referenced | LOW |
| DELETE_CANDIDATE | Empty or redundant files | MEDIUM |
| UNKNOWN | Needs investigation | HIGH |

---

## PHASE 1: Root Level Files

### LOGS (Archive)

| File | Size | Last Modified | Classification | Reason | Destination | Risk |
|------|------|----------------|---------------|--------|-------------|------|
| api.log | 477KB | Apr 2 | ARCHIVE | Large dependency installation log | .archive/repo-cleanup/2026-04-28/logs/ | LOW |
| web.log | 585KB | Apr 2 | ARCHIVE | Large frontend build log | .archive/repo-cleanup/2026-04-28/logs/ | LOW |
| api-dev.log | 0B | Apr 2 | DELETE_CANDIDATE | Empty file | DELETE | LOW |
| api-server.log | 0B | Apr 2 | DELETE_CANDIDATE | Empty file | DELETE | LOW |
| dev.log | 0B | Apr 2 | DELETE_CANDIDATE | Empty file | DELETE | LOW |
| web-dev.log | 12KB | Apr 16 | ARCHIVE | Old development log | .archive/repo-cleanup/2026-04-28/logs/ | LOW |
| web-server.log | 0B | Apr 2 | DELETE_CANDIDATE | Empty file | DELETE | LOW |

### EXECUTIVE SUMMARIES (Archive - Redundant)

| File | Size | Last Modified | Classification | Reason | Destination | Risk |
|------|------|----------------|---------------|--------|-------------|------|
| SUMARIO_EXECUTIVO_FINAL.md | 6.4KB | Apr 10 | ARCHIVE | Duplicate of planning docs | .archive/repo-cleanup/2026-04-28/docs/ | LOW |
| ENTREGAVEIS_FINAIS.md | 9.4KB | Apr 10 | ARCHIVE | Duplicate of planning docs | .archive/repo-cleanup/2026-04-28/docs/ | LOW |
| RAIOX_SISTEMA_REAL.md | 18KB | Apr 10 | ARCHIVE | Old system comparison | .archive/repo-cleanup/2026-04-28/docs/ | LOW |

### IMPROVEMENT TRACKERS (Archive)

| File | Size | Last Modified | Classification | Reason | Destination | Risk |
|------|------|----------------|---------------|--------|-------------|------|
| IMPROVEMENTS_SUMMARY.md | 9.8KB | Mar 31 | ARCHIVE | Tracked in planning/04-PROGRESS-LOG.md | .archive/repo-cleanup/2026-04-28/docs/ | LOW |
| TYPESCRIPT_FIXES_SUMMARY.md | 3.7KB | Mar 31 | ARCHIVE | Tracked in planning/04-PROGRESS-LOG.md | .archive/repo-cleanup/2026-04-28/docs/ | LOW |

### AGENT STARTERS (Archive - Redundant with docs/agents)

| File | Size | Last Modified | Classification | Reason | Destination | Risk |
|------|------|----------------|---------------|--------|-------------|------|
| claude-start.md | 1.2KB | Apr 24 | ARCHIVE | Superseded by docs/agents/00-AGENT-QUICKSTART.md | .archive/repo-cleanup/2026-04-28/agents/ | LOW |
| CLAUDE.md | 759B | Apr 17 | ARCHIVE | Superseded by docs/agents/00-AGENT-QUICKSTART.md | .archive/repo-cleanup/2026-04-28/agents/ | LOW |
| codex-start.md | 895B | Apr 24 | ARCHIVE | Superseded by docs/agents/00-AGENT-QUICKSTART.md | .archive/repo-cleanup/2026-04-28/agents/ | LOW |
| gemini-start.md | 913B | Apr 24 | ARCHIVE | Superseded by docs/agents/00-AGENT-QUICKSTART.md | .archive/repo-cleanup/2026-04-28/agents/ | LOW |
| GEMINI.md | 759B | Apr 17 | ARCHIVE | Superseded by docs/agents/00-AGENT-QUICKSTART.md | .archive/repo-cleanup/2026-04-28/agents/ | LOW |

### BRAINSTORM DOCS (Archive)

| File | Size | Last Modified | Classification | Reason | Destination | Risk |
|------|------|----------------|---------------|--------|-------------|------|
| FRONTEND_BRAINSTORM.md | 4.0KB | Apr 2 | ARCHIVE | Brainstorm notes, not actionable | .archive/repo-cleanup/2026-04-28/brainstorm/ | LOW |

### TEST SCRIPTS (Archive or MOVE_TO_SCRIPTS)

| File | Size | Last Modified | Classification | Reason | Destination | Risk |
|------|------|----------------|---------------|--------|-------------|------|
| check-geojson-logic.js | 1.9KB | Apr 16 | MOVE_TO_SCRIPTS | Utility script | scripts/geojson-check.js | LOW |
| check-geojson-logic.ts | 2.2KB | Apr 16 | MOVE_TO_SCRIPTS | Utility script | scripts/geojson-check.ts | LOW |
| check-users.js | 1.2KB | Mar 31 | MOVE_TO_SCRIPTS | Utility script | scripts/check-users.js | LOW |
| test-login2.js | 795B | Apr 2 | ARCHIVE | Old test, not in test suite | .archive/repo-cleanup/2026-04-28/tests/ | LOW |
| test-login3.js | 1.0KB | Apr 2 | ARCHIVE | Old test, not in test suite | .archive/repo-cleanup/2026-04-28/tests/ | LOW |
| seed-users-simple.js | 2.9KB | Mar 31 | MOVE_TO_SCRIPTS | Seed script | scripts/seed-users-simple.js | LOW |

### DISPATCH SCRIPTS (MOVE_TO_SCRIPTS)

| File | Size | Last Modified | Classification | Reason | Destination | Risk |
|------|------|----------------|---------------|--------|-------------|------|
| dispatch-t1-multiagent-tmux.sh | 1.0KB | Apr 24 | MOVE_TO_SCRIPTS | Multi-agent dispatch | scripts/dispatch-t1-multiagent-tmux.sh | LOW |
| dispatch-t1-multiagent.sh | 2.8KB | Apr 24 | MOVE_TO_SCRIPTS | Multi-agent dispatch | scripts/dispatch-t1-multiagent.sh | LOW |

### KEEP (Core Files)

| File | Classification | Reason |
|------|---------------|--------|
| AGENTS.md | KEEP | Project rules (root level required) |
| package.json | KEEP | Project configuration |
| pnpm-lock.yaml | KEEP | Dependency lockfile |
| docker-compose.yml | KEEP | Docker configuration |
| docker-compose.override.yml | KEEP | Docker override |
| .env.example | KEEP | Environment template |
| .env | KEEP | Local environment |
| .env.prod | KEEP | Production environment |
| start.sh | KEEP | Startup script |
| playwright.config.js | KEEP | Test configuration |

### DOTFILES (KEEP - Hidden Config)

| File | Classification | Reason |
|------|---------------|--------|
| .loop-agent-state.md | MOVE_TO_DOCS | AI agent state | docs/ai-state/loop-agent-state.md |
| .agents/ | MOVE_TO_DOCS | Agent configs | docs/ai-state/agents/ |
| .ai-dispatch/ | ARCHIVE | Dispatch logs | .archive/repo-cleanup/2026-04-28/ai-dispatch/ |
| .gemini/ | ARCHIVE | Gemeni configs | .archive/repo-cleanup/2026-04-28/gemini/ |
| .claude/ | ARCHIVE | Claude configs | .archive/repo-cleanup/2026-04-28/claude/ |
| .superpowers/ | ARCHIVE | Superpowers configs | .archive/repo-cleanup/2026-04-28/superpowers/ |

---

## PHASE 2: Docs Folder

### EXISTING DOCS TO KEEP

- docs/planning/ (ALL) - Core planning
- docs/agents/ (ALL) - Agent documentation

### DOCS TO ARCHIVE (Redundant/Old)

| File | Classification | Reason | Destination |
|------|---------------|--------|-------------|
| docs/rbac-report.md | ARCHIVE | Old report | .archive/docs/2026-04-28/ |
| docs/acceptance-checklist.md | ARCHIVE | Old checklist | .archive/docs/2026-04-28/ |
| docs/guia-completo-usuarios-licitacao.md | ARCHIVE | Old guide | .archive/docs/2026-04-28/ |
| docs/executive-one-pager.md | ARCHIVE | Redundant | .archive/docs/2026-04-28/ |
| docs/local-runbook.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/MIGRATIONS_GUIDE.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/alvara-workflow-readiness.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/API_STATUS_CODES.md | ARCHIVE | Reference | .archive/docs/2026-04-28/ |
| docs/integration-guide.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/architecture-decisions.md | MOVE_TO_DOCS | Keep but move | docs/architecture/01-DECISIONS.md |
| docs/user-guide.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/dev-logging.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/integration-institutional.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/ubatuba-ce24-2025-requisitos.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/ubatuba-ce24-2025-aderencia-mvp.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/BACKUP_STRATEGY.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/LOGGING_STRATEGY.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/pgv-fiscal-simulation.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/tenant-ubatuba.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/guia-sistema-ponta-a-ponta.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/guia-ubatuba-ponta-a-ponta.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/idp-integration.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |
| docs/cloud-deploy.md | ARCHIVE | Old | .archive/docs/2026-04-28/ |

---

## PHASE 3: Existing Folders

### KEEP AS-IS

| Folder | Reason |
|--------|--------|
| apps/ | Core application |
| tests/ | Test suite |
| test/ | Test fixtures |
| test-results/ | Test outputs |
| playwright-report/ | Test reports |
| .github/ | GitHub config |
| .vscode/ | VSCode config |
| .git/ | Git repository |
| node_modules/ | Dependencies |
| storage/ | Data storage |
| templates/ | Templates |
| infra/ | Infrastructure |
| poc/ | Proof of concept (active) |
| prompts/ | Prompts (decide: archive or keep) |

### ARCHIVE CANDIDATES

| Folder | Classification | Reason | Destination |
|--------|---------------|--------|-------------|
| .agents/ | ARCHIVE | Moved to docs/ai-state/ | .archive/repo-cleanup/2026-04-28/agents/ |
| .ai-dispatch/ | ARCHIVE | Old dispatch logs | .archive/repo-cleanup/2026-04-28/ai-dispatch/ |
| .gemini/ | ARCHIVE | Old configs | .archive/repo-cleanup/2026-04-28/gemini/ |
| .claude/ | ARCHIVE | Old configs | .archive/repo-cleanup/2026-04-28/claude/ |
| .superpowers/ | ARCHIVE | Old configs | .archive/repo-cleanup/2026-04-28/superpowers/ |

---

## Execution Priority

### HIGH PRIORITY (Safe, No Risk)
1. Empty log files (DELETE)
2. Large log files (ARCHIVE)
3. Agent starter files (ARCHIVE)
4. Executive summaries (ARCHIVE)

### MEDIUM PRIORITY (Verify References)
1. Test scripts (MOVE_TO_SCRIPTS)
2. Dispatch scripts (MOVE_TO_SCRIPTS)
3. Utility scripts (MOVE_TO_SCRIPTS)

### LOW PRIORITY (Careful)
1. Docs cleanup (ARCHIVE old docs)
2. Dotfiles cleanup (ARCHIVE/MOVE)

---

## Validation Checklist

- [ ] All moved files have correct references updated
- [ ] No broken imports/links
- [ ] `npm run build` passes for apps/api
- [ ] `npm run build` passes for apps/web
- [ ] All tests pass
- [ ] No missing file errors

---

## Archive Structure

```
.archive/
  repo-cleanup/
    2026-04-28/
      logs/
        api.log
        web.log
        web-dev.log
      docs/
        SUMARIO_EXECUTIVO_FINAL.md
        ENTREGAVEIS_FINAIS.md
        RAIOX_SISTEMA_REAL.md
        IMPROVEMENTS_SUMMARY.md
        TYPESCRIPT_FIXES_SUMMARY.md
      agents/
        claude-start.md
        CLAUDE.md
        codex-start.md
        gemini-start.md
        GEMINI.md
      brainstorm/
        FRONTEND_BRAINSTORM.md
      tests/
        test-login2.js
        test-login3.js
      ai-dispatch/
        (all contents)
      gemini/
        (all contents)
      claude/
        (all contents)
      superpowers/
        (all contents)
```
