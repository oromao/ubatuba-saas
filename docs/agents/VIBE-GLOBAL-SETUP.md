# VIBE Global Setup - FlyDea

## Overview

This document describes the global Vibe CLI configuration for the FlyDea GovTech project. This setup provides MCPs (Model Context Protocol servers) and Skills that work across all projects while respecting FlyDea-specific conventions.

## Configuration Location

- **Global Config**: `~/.vibe/config.toml`
- **MCP Servers**: `~/.vibe/mcp_servers/*.toml`
- **Skills**: `~/.vibe/skills/*.toml`
- **Backups**: `~/.vibe/backups/YYYY-MM-DD/`

## MCP Servers

### 1. Filesystem (Required)
- **Purpose**: Controlled file system access for reading/writing files
- **Config**: `~/.vibe/mcp_servers/filesystem.toml`
- **Permissions**: Read code files, write docs/configs
- **Denied**: `.env`, `node_modules/`, `.git/`, `.vibe/`

### 2. Shell / Terminal (Required)
- **Purpose**: Run build, tests, lint, and scripts
- **Config**: `~/.vibe/mcp_servers/shell.toml`
- **Allowed**: git, npm, next, nest, yarn, pnpm, jest, vitest, playwright, eslint, prettier, typescript
- **Denied**: sudo, interactive shells, debuggers

### 3. Git (Required)
- **Purpose**: Git operations (diff, status, commits, history)
- **Config**: `~/.vibe/mcp_servers/git.toml`
- **Allowed**: status, diff, log, branch, checkout, pull, push, add, commit, reset, stash
- **Repositories**: `/Users/paulo/Documents/*`

### 4. Playwright / Browser (Required)
- **Purpose**: Browser automation for E2E tests, smoke tests, visual validation
- **Config**: `~/.vibe/mcp_servers/playwright.toml`
- **Browsers**: chromium, firefox, webkit
- **Allowed URLs**: localhost, 127.0.0.1
- **Viewport**: 1280x720 (desktop), 375x667 (mobile)

### 5. HTTP / Fetch (Desirable)
- **Purpose**: Test APIs and endpoints
- **Config**: `~/.vibe/mcp_servers/http.toml`
- **Methods**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Allowed URLs**: localhost, 127.0.0.1, *.local, api.*
- **Max Response**: 10MB

### 6. Context7 / Docs (Desirable)
- **Purpose**: Access updated library documentation
- **Config**: `~/.vibe/mcp_servers/context7.toml`
- **Sources**: npm, pypi, maven, go, rust
- **Rate Limit**: 20 req/min, 100 req/hour
- **Auto Start**: false (start on demand only)

## Skills

### Priority 1 (Always Active)

| Skill | Description | Priority |
|-------|-------------|----------|
| `get-shit-done` | Minimal analysis, maximum execution | 1 |
| `anti-loop` | Prevent endless analysis loops | 1 |
| `verification-before-completion` | Always verify before claiming done | 2 |
| `planning-manager` | Maintain execution plan and backlog | 1 |

### Priority 2 (High)

| Skill | Description | Priority |
|-------|-------------|----------|
| `systematic-debugging` | Structured debugging workflow | 2 |
| `qa-hardening` | Quality assurance and hardening | 2 |
| `e2e-real-user-validation` | E2E user flow validation | 2 |
| `gis-govtech-review` | GIS-specific validation for GovTech | 2 |

### Priority 3 (Medium)

| Skill | Description | Priority |
|-------|-------------|----------|
| `context-economy` | Minimal context usage | 3 |
| `test-first` | Write tests before implementation | 3 |
| `documentation-architect` | Structured documentation | 3 |
| `performance-check` | Performance validation | 3 |
| `repo-cleanup` | Archive, don't delete | 4 |

## FlyDea-Specific Rules

### Core Principles
1. **Filesystem is the ONLY source of truth**
2. **ALWAYS read files before editing**
3. **Never scan entire repo without necessity**
4. **Never create loop files without authorization**
5. **Do not touch product code without explicit task**
6. **Do not break build**
7. **Never delete files; archive when necessary**
8. **Every change needs validation**
9. **Every configuration needs documentation**

### Maturity Vocabulary
- **REAL**: UI -> API -> DB, persisted, tested, reviewed
- **PARTIAL**: works in part, fails >=1 REAL criterion
- **ZOMBIE**: exists but not navigable / no flow / no test
- **FAKE**: pretends to be real (mock data, dead buttons)
- **DEAD**: unused, unreferenced, unloaded

### First Execution Package (MANDATORY)
Until ALL pass E2E, NOTHING NEW enters:
- [ ] login + hydrated session, no blank screen
- [ ] `/app/dashboard` with real data
- [ ] `/app/maps` with fallback + interaction
- [ ] `/app/ctm/parcelas` search + detail + update
- [ ] `/app/ctm/logradouros` list + detail
- [ ] `/app/ctm/vistorias` create + status change

### Mandatory E2E Beyond First Execution Package
- [ ] Generate PDF (certidao / report)
- [ ] Tax integration (parcel tax visible + coherent with dashboard)
- [ ] Citizen portal flow
- [ ] Parcel <-> map <-> tax <-> inspection graph coherence

## Usage

### Starting Vibe

```bash
# Navigate to FlyDea project
cd /Users/paulo/Documents/ubatuba-saas

# Start Vibe - it will auto-load global config
vibe
```

### Using MCPs

The configured MCPs are automatically available. Use them via Vibe's tool system:

```
# Filesystem operations
read_file(path="docs/planning/02-BACKLOG.md")
write_file(path="docs/new-doc.md", content="...")

# Shell operations  
bash(command="npm run build")
bash(command="git status")

# Git operations
bash(command="git diff")
bash(command="git log --oneline -10")

# Playwright for E2E
# (Available through task delegation)

# HTTP for API testing
# (Available through web_fetch tool)
```

### Using Skills

Skills are automatically activated based on context. To manually invoke:

```
# For planning tasks
Use planning-manager skill

# For debugging
Use systematic-debugging skill

# For QA
Use qa-hardening skill

# For GIS validation
Use gis-govtech-review skill
```

### Daily Workflow

1. **Start Session**
   ```bash
   cd /Users/paulo/Documents/ubatuba-saas
   vibe
   ```
   Read in order:
   - AGENTS.md
   - docs/planning/00-PROJECT-CONTEXT.md
   - docs/planning/02-BACKLOG.md
   - Last 10 entries of docs/planning/04-PROGRESS-LOG.md

2. **Identify Task**
   Pick next REAL task from BACKLOG.md (T1 -> T4 priority)

3. **Execute**
   Use appropriate tools and skills:
   - read_file for code exploration
   - grep for pattern search
   - search_replace for code changes
   - bash for commands

4. **Validate**
   - Run tests: `npm test` or `yarn test`
   - Run lint: `npm run lint`
   - Verify build: `npm run build`

5. **Update Plan**
   Update:
   - docs/planning/02-BACKLOG.md
   - docs/planning/04-PROGRESS-LOG.md
   - docs/planning/03-EXECUTION-PLAN.md

6. **Commit**
   ```bash
   git add .
   git commit -m "[T<n>-<SLUG>] <title>
   
   Generated by Mistral Vibe.
   Co-Authored-By: Mistral Vibe <vibe@mistral.ai>"
   ```

## Validation

### Check MCPs Loaded

```bash
# List MCP servers in config
cat ~/.vibe/config.toml | grep -A 10 "mcp_servers"

# Verify files exist
ls -la ~/.vibe/mcp_servers/
```

### Check Skills Available

```bash
# List enabled skills in config
cat ~/.vibe/config.toml | grep -A 20 "enabled_skills"

# Verify skill files exist
ls -la ~/.vibe/skills/
```

### Test Connectivity

```bash
# Test filesystem
vibe --command "read_file(path='~/.vibe/config.toml', limit=10)"

# Test shell
vibe --command "bash(command='pwd')"

# Test git
vibe --command "bash(command='git status')" /Users/paulo/Documents/ubatuba-saas
```

## Backup

All original configs are backed up in:
```
~/.vibe/backups/2025-04-28/
├── config.toml.bak
├── .env.bak
└── trusted_folders.toml.bak
```

To restore:
```bash
cp ~/.vibe/backups/2025-04-28/*.bak ~/.vibe/
```

## Updates

### Adding New MCP Server

1. Create file: `~/.vibe/mcp_servers/<name>.toml`
2. Add config to `~/.vibe/config.toml` under `mcp_servers` array
3. Restart Vibe

### Adding New Skill

1. Create file: `~/.vibe/skills/<name>.toml`
2. Add name to `enabled_skills` array in `~/.vibe/config.toml`
3. Restart Vibe

### Updating Existing Config

1. Backup current: `cp ~/.vibe/config.toml ~/.vibe/backups/YYYY-MM-DD/`
2. Edit file
3. Validate with: `vibe --config-check`
4. Restart Vibe

## Troubleshooting

### MCP Not Loading
- Check file exists: `ls ~/.vibe/mcp_servers/`
- Check syntax: `vibe --config-check`
- Check Vibe version: `vibe --version`
- Restart Vibe

### Skill Not Active
- Check enabled in config.toml
- Check file exists in ~/.vibe/skills/
- Check file syntax
- Restart Vibe

### Permission Denied
- Check MCP permissions in respective .toml file
- Check file patterns in allowlist/denylist
- Verify path is in trusted_folders.toml

### Commands Not Available
- Check shell MCP allowlist
- Check command is in allowed list
- Verify PATH in shell.toml

## References

- [Vibe Documentation](https://vibe.mistral.ai/)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [FlyDea AGENTS.md](/Users/paulo/Documents/ubatuba-saas/AGENTS.md)
- [FlyDea Planning Docs](/Users/paulo/Documents/ubatuba-saas/docs/planning/)
