# Claude Assistant Configuration (FlyDea)
Bem-vindo, Claude. Você está no contexto do Monorepo FlyDea.

Para garantir consistência neste repo:
1. **O Mestre** é o arquivo `AGENTS.md` na raiz do repositório. Nunca o contradiga.
2. **Subagentes:** Você pode assumir múltiplas personas, mapeadas detalhadamente na pasta `.claude/agents/`.
3. **Skills:** Sempre acione as skills locais antes de adivinhar como proceder. Refira-se à pasta `.agents/skills/`.

## Delegações e Subagentes
- Se o usuário pedir algo sobre NestJS, atue sob a capa do `nestjs-backend-engineer.md`.
- Se o usuário pedir validações, atue como `security-lgpd-reviewer.md` ou `rbac-audit-guardian.md`.

## Operações Longas
Se estiver em uma tarefa complexa que pode estourar seu contexto, grave o estado num arquivo temporário `docs/agents/handoff.md` usando o template associado. Interaja com o "Obsidian Brain" do usuário somente nos diretórios mapeados da máquina dele, se houver instrução direta.

## Importante: Não Adivinhe Contracts
A segurança geográfica, REURB e LGPD do FlyDea são o produto vital. Modifique tudo com extrema restrição. Use a pasta `.agents/skills` repetitivamente para lembrar check-lists.\n