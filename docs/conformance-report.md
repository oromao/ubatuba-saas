# Conformance Report (E2E + Licitacao)

## Resumo executivo
- Execução principal de aderência: `runId 20260220173034`
  - Arquivo: `/Users/paulo/sass/poc/checks/full-qa-licitacao-report.json`
  - Resultado técnico: **105/105** checks (**100%**)
  - Aderência licitação: **13/13** requisitos do edital-base (**100%**)
- Execução smoke por perfil (Playwright runner):
  - Arquivo: `test-results/playwright-report.json`
  - Resultado: **3/3** testes (`@smoke @roles`) aprovados

## Cobertura por perfil
- **ADMIN**
  - Pode criar/editar/excluir entidades críticas (assets/processos/map-features/zonas/faces/etc.)
  - Fluxos completos: levantamentos, integrações, cartas, compliance, mapas
- **GESTOR**
  - Pode operar módulos de negócio e criar projeto
  - Bloqueios validados: deleções administrativas específicas (ex.: assets/processes)
- **OPERADOR**
  - Pode operar CTM/PGV/mobile sync
  - Bloqueios validados: criação de projeto e criação de versão PGV
- **CAMPO (OPERADOR)**
  - Pode usar mobile sync e criar registros operacionais permitidos
- **LEITOR**
  - Pode consultar dados
  - Bloqueios validados: criação de parcelas/map-features, escrita compliance, mobile write
  - Busca global restringe itens sensíveis (ex.: “Parcelas” não aparece)

## Resultado por requisito
- Status detalhado por requisito: `/Users/paulo/sass/docs/requirements-matrix.md`
- Síntese:
  - PASSOU: 18
  - MANUAL: 2
  - NÃO COBERTO: 1
  - FALHOU: 0

## Falhas, bugs e gaps
- Bugs funcionais bloqueantes encontrados no run final: **nenhum**.
- Gaps não-funcionais:
  - Execuções headless sem contexto WebGL podem falhar em telas de mapa (limitação de ambiente).
  - Deploy cloud real (infra produtiva) exige validação manual em ambiente externo.
- Ponto ambíguo de edital/documentação:
  - Escopo “SFTP completo” versus implementação atual classificada como stub técnico.

## Evidências
- Relatório completo licitação:
  - `/Users/paulo/sass/poc/checks/full-qa-licitacao-report.json`
  - `/Users/paulo/sass/poc/checks/full-qa-licitacao-report.md`
- Screenshots completos:
  - `/Users/paulo/sass/poc/checks/full-qa-screens`
- Smoke runner artifacts:
  - `test-results/artifacts`
  - `playwright-report`

## Recomendações
1. Rodar smoke em todo PR e suite de requisitos em merge/main.
2. Executar mapa em agente com display/WebGL quando possível (`PW_HEADLESS=false`).
3. Evoluir cobertura runner-based para reduzir dependência de scripts monolíticos.
4. Tratar requisito SFTP com decisão formal (expandir implementação ou ajustar escopo contratual).
