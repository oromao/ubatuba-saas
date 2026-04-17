# GEMINI.md — FlyDea

This repository uses a **unified agent briefing system**.

**Read `AGENTS.md` first.** It is authoritative for Gemini CLI, Codex CLI, and Claude Code alike.

Planning documents live in `docs/planning/`. Do not invent new planning conventions — update the existing ones.

## Short rules (enforced regardless)

1. Existence ≠ working. Prove with automated tests.
2. Update `docs/planning/02-BACKLOG.md` and append to `docs/planning/04-PROGRESS-LOG.md` at end of every session (see `AGENTS.md` §14).
3. Never delete. Archive to `.archive/YYYY-MM-DD/` and log in `docs/planning/05-CLEANUP-INVENTORY.md`.
4. Final decision owner: **Paulo**. When in doubt, ask.
5. Single Writer active at a time. Reviewer blocks merge if §14 skipped.
