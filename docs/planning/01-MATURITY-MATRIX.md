# 01 — Maturity Matrix

> Scorecard de maturidade por domínio. Escala 0-5.
> Atualize ao final de cada sprint ou quando houver mudança material.
> Última atualização: `2026-04-20` por `Codex (parcel E2E proof stabilized)`

---

## Escala

| Score | Significado |
|---|---|
| **0** | Não existe |
| **1** | Página/endpoint existe mas não funciona |
| **2** | Funciona em caminho feliz, sem teste, sem persistência garantida |
| **3** | Funciona, tem persistência, mas cobertura de teste é parcial |
| **4** | Funciona, persistido, testado, resiliente a falhas previsíveis |
| **5** | Municipal-grade: auditável, performático em escala, multi-tenant-seguro, com E2E estável |

## Matriz atual vs alvo

| # | Domínio | Agora | Alvo Q2/2026 | Alvo Q4/2026 | Próxima ação (ref T) |
|---|---|:-:|:-:|:-:|---|
| 1 | GIS / WebGIS | 3 | 4 | 5 | T3-GIS-SCALE |
| 2 | CTM / lifecycle de parcela | 4 | 4 | 5 | T2-PARCEL-E2E |
| 3 | Parcel search/detail UX | 4 | 4 | 5 | T2-PARCEL-E2E |
| 4 | Imports (GeoJSON / CSV / externos) | 3 | 4 | 4 | T3-IMPORT-PROOF |
| 5 | Tributação / IPTU / PGV / valor venal | 4 | 4 | 5 | T2-TAX-INTEG |
| 6 | Vistorias / workflows de campo | 4 | 4 | 4 | T2-INSPECT-E2E |
| 7 | Mobile / uso em campo | 2 | 3 | 4 | T4-MOBILE |
| 8 | Portal cidadão / serviço público | 2 | 3 | 4 | T3-CITIZEN |
| 9 | Dashboards / observatório | 3 | 4 | 4 | T3-DASH-PROOF |
| 10 | Relatórios / exportações / PDFs | 4 | 4 | 4 | T2-REPORTS |
| 11 | Notificações / cartas / comunicação | 2 | 3 | 4 | — |
| 12 | Aprovações / compliance / workflows | 2 | 3 | 4 | — |
| 13 | Segurança / RBAC / multi-tenant / auditoria | 3 | 4 | 5 | T4-AUDIT |
| 14 | UX / navegação / usabilidade operador | 4 | 4 | 5 | T1-ROUTE-PROOF, T3-EMPTY-STATES |
| 15 | Testes / qualidade / release readiness | 4 | 4 | 5 | T1 inteiro |
| 16 | Automation / memory / DevEx | 4 | 5 | 5 | T4-HOOKS-OS |

## Heatmap resumo

```
MADURO (≥3):      GIS, CTM, parcel search, imports, tributação, vistorias,
                  dashboards, relatórios, RBAC
IMATURO (2):      Mobile, portal cidadão, notificações, aprovações, UX, testes
AUSENTE (0-1):    — (nenhum módulo ausente no baseline)
```

## Histórico de mudanças

| Data | Agente | Domínio | De → Para | Motivo |
|---|---|---|---|---|
| 2026-04-20 | Codex | CTM / lifecycle de parcela | 3 → 4 | Busca → detalhe → edição → reload com persistência real passou |
| 2026-04-20 | Codex | Parcel search/detail UX | 3 → 4 | Lista real, detalhe e edição com payload persistido validado |
| 2026-04-20 | Codex | Relatórios / exportações / PDFs | 3 → 4 | Clique no detalhe da parcela + leitura binária do PDF validada |
| 2026-04-20 | Codex | Tributação / IPTU / PGV / valor venal | 3 → 4 | Dashboard/executive and parcel statistics match on IPTU totals |
| 2026-04-20 | Codex | Vistorias / workflows de campo | 3 → 4 | E2E create → status → history → vínculo com parcela passou |
| 2026-04-20 | Codex | Automation / memory / DevEx | 3 → 4 | Hooks nativas + launcher fallback passaram a acionar bootstrap/write-back automaticamente |
| 2026-04-17 | Codex | UX / navegação / usabilidade operador | 3 → 4 | Smoke do menu provou navegação sem tela vazia nas rotas visíveis |
| 2026-04-17 | Codex | Testes / qualidade / release readiness | 3 → 4 | Smoke do menu e da hidratação passaram com seed local reproduzível |
| 2026-04-17 | Codex | UX / navegação / usabilidade operador | 2 → 3 | Estado explícito de redirecionamento + prova E2E de hidratação sem tela em branco |
| 2026-04-17 | Codex | Testes / qualidade / release readiness | 2 → 3 | Novo E2E de hidratação cobre o fluxo de sessão inicial |
| 2026-04-17 | Claude (bootstrap) | — | — | Baseline inicial a partir da auditoria em `docs/planning/reference/` |

<!--
Exemplo de entrada futura:
| 2026-05-03 | Codex | GIS | 3 → 4 | E2E de fitBounds + overlay validado em 3 navegadores, ref T3-GIS-SCALE |
-->

---

## Mesclado de `docs/requirements-matrix.md` em 2026-04-17

- Requisitos com teste associado devem alimentar a matriz de maturidade e a estratégia de testes.
- Itens de integração tributária, CTM, mobile, cartas, compliance e RBAC já estão mapeados no backlog vivo.
