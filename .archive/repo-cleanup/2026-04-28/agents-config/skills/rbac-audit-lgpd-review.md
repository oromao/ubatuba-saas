# Skill: RBAC e LGPD Code Review
**Quando Usar:** Antes de dar commit em refatorações de Autenticação, Usuários ou Cadastros Familiares (REURB/CTM).
**Validações:**
1. Rota conta com `@Roles('admin', 'operator')` ou similar?
2. Controlador repassa `tenantContext`?
3. Operações mutáveis possuem log explícito e motivo sensível auditável?
**Saída Esperada:** Resumo do "LGPD Check" como aprovado ou reprovado.\n