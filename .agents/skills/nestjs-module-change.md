# Skill: NestJS Module Change
**Objetivo:** Adicionar ou alterar módulo back-end.
**Passos:**
1. Gerar Module/Controller/Service.
2. Escrever Mongoose Schema com restrição obrigatória de `tenant`.
3. Anotar `@UseGuards(JwtAuthGuard, RolesGuard)` no Controller.
4. Adicionar testes ao `apps/api/test`.\n