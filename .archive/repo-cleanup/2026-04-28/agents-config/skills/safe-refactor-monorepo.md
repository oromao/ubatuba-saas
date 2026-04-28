# Skill: Safe Refactoring
**Objetivo:** Refatorar código sem causar downtime no Monorepo (apps/web + apps/api).
**Passos:** 
1. Analise dependentes do endpoint no NextJS.
2. Modifique APIs do Nest e execute lint.
3. Altere hooks no Web App e garanta build status.
**Risco:** Quebrar Build Typescript Omit/Pick em monorepos.\n