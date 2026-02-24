# Aderencia MVP — Ubatuba CE 24/2025 (REURB-S)

Data: 24/02/2026
Ambiente: local (docker compose dev)

## Resultado executivo
Status geral: **PASSA**

Todos os requisitos MVP do fluxo REURB-S possuem evidencias de teste automatizado (Playwright) no repositório.

## Matriz de aderencia (MVP)

1. Cadastro de Projeto REURB-S — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`

2. Cadastro de familias/beneficiarios e unidades/imoveis — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`

3. Upload e versionamento de documentos por projeto/unidade/familia — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-audit-lgpd.spec.ts`

4. Notificacoes (email) + registro de evidencias — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-guia.spec.ts`

5. Exportacoes tabulares (CSV/XLSX/JSON) + Planilha Sintese — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`

6. Pacote Cartorio/CRF (ZIP com indice e anexos) — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-guia.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`

7. Auditoria e RBAC em todas as acoes — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-rbac.spec.ts`, `tests/e2e/fullscan/reurb-flow.spec.ts`

8. Dossie do projeto (documentos + checklist por etapa) — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-audit-lgpd.spec.ts`

9. Requisitos LGPD (registro de acesso com finalidade) — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-audit-lgpd.spec.ts`

10. Integracao HTTP simples para testes de integracao — **PASSA**
Evidencia: `tests/e2e/fullscan/reurb-rbac.spec.ts`

## Observacoes
- Evidencias foram geradas em execucao local do Playwright com `PW_HEADLESS=false`.
- Para revalidar: `npx playwright test --project=human tests/e2e/fullscan/reurb-*.spec.ts`
