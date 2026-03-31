# FlyDea Multi-Agent Architecture
Esta pasta detalha como o sistema de inteligência artificial (LLMs e Copilots atuando de forma autônoma) no monorepo atua.
- **Claude:** Use o `/CLAUDE.md` e sintonize papéis na `.claude/agents`.
- **Codex (Cursor):** O Cursor irá checar as regras base no `.cursorrules` (já contido no topo do repo), e no topo de todos ele deve ser instruído a consultar o `AGENTS.md`.
- **Antigravity CLI:** Executará setups completos referenciando `.agents/skills`.
**Handoffs:** Vide `handoff.md` e scripts atrelados para gerenciar limites cognitivos de janela entre plataformas.\n