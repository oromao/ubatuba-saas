# Seed PoC

Arquivos de seed para demonstracao da PoC.

## Conteudo
- `poc-seed.json`: dataset minimo de referencia para demonstracao.

## Uso sugerido
1. Utilizar os endpoints das features para cadastrar os dados base com este arquivo como referencia.
2. Rodar checks automatizados em `poc/checks/run-checks.mjs`.

## Loader automatizado (opcional)
```bash
POC_ACCESS_TOKEN=<JWT> POC_TENANT_ID=<TENANT_ID> node poc/seed/load-seed.mjs
```
