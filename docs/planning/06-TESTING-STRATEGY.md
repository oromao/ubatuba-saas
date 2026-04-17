# 06 — Testing Strategy

> Pirâmide de testes e cobertura alvo por módulo.
> Regra: **sem teste, sem DONE**.

---

## Pirâmide

```
                  ┌───────────┐
                  │    E2E    │  Playwright — 1 por fluxo crítico
                  └───────────┘
              ┌───────────────────┐
              │   Integração      │  API + DB real (docker/compose)
              └───────────────────┘
        ┌───────────────────────────────┐
        │    Unitários                  │  Jest/Vitest — helpers críticos
        └───────────────────────────────┘
      ┌───────────────────────────────────┐
      │         Smoke (boot + menu)       │  Playwright leve — toda rota do nav
      └───────────────────────────────────┘
```

## Cobertura obrigatória por tipo

### Smoke (roda em cada PR)
- [x] Boot do frontend
- [x] Boot do backend
- [ ] `/health` endpoints
- [ ] `/app/dashboard` carrega conteúdo (não loader)
- [ ] `/app/maps` carrega mapa (ou fallback explícito)
- [ ] `/app/ctm/parcelas` carrega lista
- [ ] `/app/ctm/logradouros` carrega lista
- [ ] `/app/ctm/vistorias` carrega lista
- [ ] **Todas** as rotas de `nav-config.ts` — para cada uma: "não mostra loader persistente por >3s"

### E2E críticos (roda em cada PR + nightly)
- [ ] Login → dashboard persiste na sessão
- [ ] Busca de parcela → abre detalhe → edita → persiste (`T2-PARCEL-E2E`)
- [ ] Mapa abre → interage (pan, zoom, fitBounds) → clica em parcela
- [ ] Criar vistoria → mudar status → ver no histórico (`T2-INSPECT-E2E`)
- [ ] Gerar PDF de certidão (`T2-REPORTS`)
- [ ] Tributação: ver tributo de parcela coerente com dashboard (`T2-TAX-INTEG`)
- [ ] Portal cidadão: abrir solicitação (`T3-CITIZEN`)

### Integração (backend)
- [ ] Auth round-trip (login + refresh + 401 redirect)
- [ ] Parcelas: list/search/detail/update — contra DB real
- [ ] Logradouros: list/detail
- [ ] Dashboard: endpoints retornam dados do banco
- [ ] Reports/certidões
- [ ] Uploads
- [ ] Workflow/process transitions
- [ ] PGV: zonas/faces/fatores/valuations CRUD

### Unitários (alvos prioritários)
- [ ] Helpers de GIS (geometry, bbox, centroid, fitBounds edge cases)
- [ ] Validação de geometria (Polygon/MultiPolygon malformados)
- [ ] Transições de workflow
- [ ] Mapeamento tributo ↔ parcela
- [ ] Route guards (RBAC + isAppRouteAllowed)
- [ ] Abstrações de upload/storage

## Critério de cobertura

- **100% nos arquivos alterados** em cada PR crítico (não no repo inteiro — isso é cosmético).
- **100% nos helpers de domínio de risco** (GIS, tributo, workflow, RBAC).
- O restante: cobertura crescente por sprint, rastreada na matriz de maturidade.

## Stack oficial (a confirmar com Paulo)

- **E2E / Smoke:** Playwright
- **Integração backend:** Jest + testcontainers ou docker-compose dedicado
- **Unitários backend:** Jest
- **Unitários frontend:** Vitest + Testing Library
- **CI:** GitHub Actions com gates por tipo

## Gates de release

Um release só vai para staging/prod se:

1. Smoke 100% verde.
2. Todos os E2E críticos verdes.
3. Integração 100% verde.
4. Zero `TODO[PARTIAL]:` novo sem item correspondente no `02-BACKLOG.md`.
5. `04-PROGRESS-LOG.md` atualizado pelo agente da última sessão.

## Anti-patterns proibidos

- ❌ Teste que faz `expect(page).toBeTruthy()` e nada mais.
- ❌ Snapshot como única prova.
- ❌ Mock de backend em teste marcado como "E2E".
- ❌ `sleep(5000)` para contornar race condition — corrige a condição.
- ❌ Smoke que só verifica status 200 — precisa verificar conteúdo real.

---

## Mesclado de `docs/executable-roadmap-checklist.md` em 2026-04-17

- Gates institucionais: identidade, tenant isolation, audit traceability.
- Reforço para não tratar demo/localStorage como prova.

## Mesclado de `docs/requirements-matrix.md` em 2026-04-17

- Requisitos com testes associados para CTM, PGV, mobile, cartas, compliance, RBAC e navegação.
- A matriz de requisitos serve como insumo para smoke, integração e E2E críticos.
