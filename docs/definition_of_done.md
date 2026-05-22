# Definition of Done (DoD)

## General Criteria
- **Código compilado** sem erros de lint.
- **Testes unitários** cobrem ≥ 80 % das linhas modificadas.
- **Testes de integração** executam com sucesso em pipeline CI.
- **Documentação** atualizada (README, Swagger, Guia de Implantação).
- **Revisão de código** aprovada por pelo menos um reviewer.
- **Deploy** em ambiente de staging sem regressões.
- **Checklist de segurança** concluído (pen‑test, auditoria de LGPD).

## Sprint‑Specific DoD
| Sprint | Critério específico |
|---|---|
| Sprint 0 – Setup | – Monorepo configurado com `package.json` workspaces.\n– Pipeline CI/CD (`.github/workflows/ci.yml`) rodando com sucesso.\n– Board de tarefas criado (arquivo `TASK_BOARD.md`).\n– Scripts de bootstrap (`setup.sh`) funcionais. |
| Sprint 1 – GIS Import | – Wrapper GDAL implementado e testado.\n– Serviço REST `/reproject` devolve GeoJSON no CRS solicitado.\n– Validação topológica (polígonos válidos) incluída. |
| Sprint 2 – Mobile Inspection | – App React‑Native criado, rodando offline.\n– Sync bidirecional com API back‑end.\n– Assinatura digital RSA‑SHA256 aplicada às vistorias. |
| ... | *(continua para cada sprint)* |

## Acceptance Checklist (per task)
1. Código mergeado em `develop`.
2. Pipeline CI passa em verde.
3. Testes automatizados executados.
4. Documentação gerada/atualizada.
5. Deploy em staging validado.
