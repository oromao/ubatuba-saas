# O Padrão de Handoff (Context Bridge)
Como as LLMs têm memória finita por thread, utilize sempre um roteador de estado ao trocar de tarefas extensas ou ao passar a bola de uma LLM para outra (Ex: Antigravity rodando a shell e Cursor aplicando as linhas editadas).
Use o template em `templates/agents/handoff-template.md`.\n