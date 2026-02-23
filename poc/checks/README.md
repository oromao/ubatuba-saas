# Checks automatizados PoC

## Executar
```bash
node poc/checks/run-checks.mjs
```

Com checks autenticados (fluxos principais):
```bash
POC_ACCESS_TOKEN=<JWT> POC_TENANT_ID=<TENANT_ID> node poc/checks/run-checks.mjs
```

## Resultado
- Saida no terminal com status por endpoint.
- Persistencia em `poc/checks/last-result.json` para evidencia da PoC.
