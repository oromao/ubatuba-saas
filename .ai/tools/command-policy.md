# Command Policy — FlyDea

## Categorias:
1. READ_ONLY (Permitido)
2. LOCAL_VALIDATION (Permitido)
3. PLAN_DRY_RUN (Permitido com cuidado)
4. MUTATING_INFRASTRUCTURE (Proibido sem aprovação)
5. DESTRUCTIVE (Proibido sem dupla aprovação)

## READ_ONLY
- pwd, ls, find com maxdepth
- rg/grep direcionado
- git status, git log
- npm test, npx playwright test (existing tests)
- node scripts/verify-clean.mjs

## LOCAL_VALIDATION
- npm run lint
- npm run build
- npm run test
- terraform fmt -check (se disponível)
- terraform validate (se disponível)

## PLAN_DRY_RUN
- terraform plan
- npx playwright test --dry-run

## MUTATING_INFRASTRUCTURE
- terraform apply
- kubectl apply real
- docker compose up -d (produção)
- db:migrate produção

## DESTRUCTIVE
- terraform destroy
- kubectl delete
- db:reset produção
- rm -rf dados

Exigir para qualquer comando mutável: plano, blast radius, rollback, risco, ambiente, aprovação do Paulo.
