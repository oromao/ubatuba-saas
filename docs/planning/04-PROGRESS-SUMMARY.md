# 04 — Progress Summary

> Resumo consolidado do progresso real. Use este arquivo para uma visão rápida.
> O log detalhado histórico continua em `04-PROGRESS-LOG.md`.
> ÚLTIMA ATUALIZAÇÃO: `2026-04-29` por `Gemini CLI (Cleanup Phase)`

---

## 1. Estado Atual

- **Fase:** Transição de T1 (Survival) para T2 (Robustness).
- **Maturidade:** 37.4% (Tier Protótipo).
- **Ambiente Esperado:** Docker-dev (Local) / Staging (DigitalOcean).

---

## 2. Itens DONE (Confiáveis / Municipal-Grade)

- **T1-AUDIT-FIXES:** Botões de vistorias, rotas 404 e redirecionamentos corrigidos e provados via Playwright.
- **T1-HYDRATION:** Eliminação de telas brancas e loaders infinitos no menu principal.
- **T2-GIS-SCALE:** Mapa aguenta 10k+ geometrias (testado via seed de 10k).
- **T8-GIS-CRS:** Conversão de coordenadas UTM/WGS84 operacional.
- **T8-GIS-BBOX:** Carregamento de dados por viewport (bbox) funcionando.

---

## 3. Itens PARTIAL (Funciona mas falta critério)

- **T2-MULTI-TENANT:** Isolamento básico existe mas falta prova de estresse e penetração.
- **T2-PARCEL-E2E:** Busca e detalhe funcionam, mas edição com dados reais complexos (SP) ainda instável.
- **T3-CITIZEN:** Portal 156 funcional mas sem integração com sistema nacional.

---

## 4. Falsos Positivos Conhecidos (Fake/Mock)

- **Tributação (IPTU/PGV):** Atualmente usa dashboard baseado em estatísticas de seed; falta o engine de cálculo real.
- **Auditoria:** Existe a página mas o audit trail não cobre 100% das ações de escrita no banco.
- **Mobile:** Página `/mobile` existe mas o sync offline total não foi provado com 50k+ itens.

---

## 5. Rebaixamentos de Maturidade (Cleanup Phase)

Os seguintes domínios foram rebaixados de 4 para 2/1 por não atenderem ao critério **Municipal-Grade**:
- **GIS:** Rebaixado até que MVT Tiles esteja funcional.
- **Processos:** Rebaixado até que alvarás tenham assinatura digital.
- **Tributação:** Rebaixado até que o cálculo seja baseado em lei municipal real.

---

## 6. Próximos 5 Itens (Short-term focus)

1. `T0-STATUS-RECONCILE`
2. `T2-DATA-RECONCILE`
3. `T8-GIS-MVT`
4. `T8-CTM-COMPLETO`
5. `T8-TRIB-IPTU`

---

## 7. Últimas Provas Importantes

- **Data:** 2026-04-28
- **Prova:** Playwright smoke test passou em 30 rotas.
- **Evidência:** `tests/e2e/fullscan/menu-smoke.spec.ts`

---

## 8. Multiagent Status (Coordination)

- **Active Locks File:** `docs/planning/11-ACTIVE-LOCKS.md`
- **Current Rule:** Check and create a lock before writing any code or docs.
- **Isolation:** One Writer per task; avoid editing locked files/modules.
- **Stale Lock Threshold:** 4 hours.
- **Parallel Work:** Safe for independent modules (e.g., CTM vs Reurb).

---

> Nota: Este arquivo é atualizado ao final de cada sprint.
