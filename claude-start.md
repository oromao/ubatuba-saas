# Claude Start

- Read [`AGENTS.md`](/Users/paulo/Documents/ubatuba-saas/AGENTS.md) first.
- Brain root: `/Users/paulo/Documents/Obsidian Vault/brain`
- Native Claude hook: `~/.claude/settings.json` → `~/.claude/hooks/load-brain.sh` and `~/.claude/hooks/save-brain.sh`
- Session bootstrap: `python3 /Users/paulo/Documents/Obsidian Vault/brain/scripts/start_agent.py --agent claude --cwd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" --action "session start" --focus "load brain, refresh CAG, and continue" --json`
- Session write-back: `python3 /Users/paulo/Documents/Obsidian Vault/brain/scripts/session_writeback.py --agent claude --cwd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" --action "session stop" --focus "write back durable memory and close the loop" --json`
- Project memory: `brain/projects/<project>.md`
- Active context: `brain/CAG/current-project.md`, `brain/CAG/current-context.md`, `brain/CAG/current-goals.md`
