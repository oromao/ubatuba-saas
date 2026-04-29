# 06 — Testing Strategy

> Pirâmide de testes e níveis de prova para Municipal-Grade.
> Regra: **sem teste, sem DONE**.

---

## 1. Níveis de Prova (P-Levels)

| Nível | Tipo | Ferramenta | Objetivo |
|---|---|---|---|
| **P0** | Static | ESLint / TSC | Garantir integridade de tipos e estilo. |
| **P1** | Unit | Jest / Vitest | Lógica pura, helpers GIS, cálculos tributários. |
| **P2** | Integration | NestJS / Supertest | API + DB Real (Compose), fluxos sem UI. |
| **P3** | E2E Happy Path | Playwright | Fluxo principal do usuário com dados válidos. |
| **P4** | E2E Edge Cases | Playwright | Erros, permissões negadas, dados vazios. |
| **P5** | Performance | k6 / Playwright | Carga (100+ usuários), 10k+ geometrias. |
| **P6** | Security | Custom Scrutiny | Multi-tenant isolation, RBAC penetration. |
| **P7** | Real Data Proof | Script / Manual | Prova com dataset real de SP (50k+ parcelas). |
| **P8** | Demo Script | Manual / Playwright | Validação do roteiro de apresentação/edital. |

---

## 2. Requisitos Mínimos por Domínio

| Domínio | Mínimo Exigido |
|---|---|
| **GIS / WebGIS** | P1, P2, P3, P5 (Scale), P7 (Real Data) |
| **CTM / Parcela** | P1, P2, P3, P7 (Real Data) |
| **Tributação / IPTU** | P1, P2, P7 (Coerência Legal) |
| **Multi-tenant / RBAC** | P1, P2, P4, P6 (Isolation) |
| **Certidões / Docs** | P2, P3, P8 (Assinatura Digital) |
| **Portal do Cidadão** | P2, P3, P4 (Edge Cases) |
| **Processos / Workflows** | P1, P2, P3, P4 |
| **Imports / ETL** | P1, P2, P7 (Dirty Data Handling) |

---

## 3. Gates de Release

Um release só vai para staging/prod se:
1. **P0 & P1:** 100% Verdes.
2. **P2 & P3:** 100% Verdes nos fluxos críticos (Login, Parcela, Mapa).
3. **P6 (Multi-tenant):** Nenhuma falha crítica de isolamento.
4. **P7 (Scale):** Mapa carrega 10k+ itens em < 3s.

---

## 4. Anti-patterns Proibidos

- ❌ Mock de banco de dados em testes P2/P3.
- ❌ Ignorar flakiness em CI ("rodar de novo até passar").
- ❌ Testar apenas UI sem verificar o estado persistido no banco.
- ❌ Usar `localStorage` para simular estados complexos de backend.

---

> Nota: A cobertura de 100% é exigida apenas para helpers de domínio de risco (GIS, Tax, RBAC).
