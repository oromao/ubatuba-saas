# 09 — Edital Matrix (Aderência a Requisitos Públicos)

> Avaliação de aderência do FlyDea a requisitos típicos de editais municipais de GIS/CTM/Tributação.
> ÚLTIMA REVISÃO: `2026-04-29` por `Gemini CLI (Cleanup Phase)`

---

## 1. Matriz de Aderência

| Requisito Típico | Domínio | Status | Prova Existente | Gap Principal | Backlog Ref | Criticidade |
|---|---|---|---|---|---|---|
| **WebGIS em Escala** | GIS | `PARTIAL` | Viewport Bbox | Falta MVT/Tiles para 100k+ | `T8-GIS-MVT` | **BLOQUEIO** |
| **Transformação CRS** | GIS | `DONE` | Unit Tests | - | - | ALTA |
| **CRUD de Parcelas** | CTM | `REAL` | E2E Detail/Edit | Workflow de desmembramento | `T8-CTM-COMPLETO` | ALTA |
| **Cálculo de IPTU** | Tax | `FAKE` | Mock Dashboard | Engine de cálculo real | `T8-TRIB-IPTU` | **BLOQUEIO** |
| **Emissão Certidões** | Doc | `PARTIAL` | PDF Generator | Assinatura digital oficial | `T8-CERT-SIGN` | ALTA |
| **Portal do Cidadão** | Portal | `REAL` | 156 Flow | Integração 156 Nacional | `T8-CIDADAO-156` | MÉDIA |
| **Multi-tenancy** | Sec | `PARTIAL` | Tenant Guard | Prova de estresse/vazamento | `T2-MULTI-TENANT` | **BLOQUEIO** |
| **Auditoria LGPD** | Sec | `PARTIAL` | Audit Logs | Cobertura 100% de ações | `T9-LGPD-DATA` | ALTA |
| **Alvarás/Habite-se**| Proc | `FAKE` | Esqueleto UI | Lógica de workflow real | `T8-PROCESS-ALVARA` | **BLOQUEIO** |
| **Mobile Offline** | Mob | `REAL` | Sync E2E | Escala com dataset 50k+ | `T10-OFFLINE-FULL` | MÉDIA |

---

## 2. Resumo de Gaps para Licitação

Para ser considerado **LICITATION-READY**, o sistema deve resolver os 4 bloqueios críticos acima:
1.  **Escala GIS:** Implementar `T8-GIS-MVT` para suportar bases reais de grandes municípios.
2.  **Lógica Tributária:** Implementar `T8-TRIB-IPTU` para provar que o sistema pode substituir o legado.
3.  **Processos Administrativos:** Implementar `T8-PROCESS-ALVARA` para cobrir o ciclo de obras.
4.  **Segurança Hard:** Provar `T2-MULTI-TENANT` para garantir isolamento jurídico entre prefeituras.

---

## 3. Observações Comerciais

- **Vantagem:** O núcleo GIS é moderno e performático para o que já foi provado.
- **Vantagem:** A arquitetura multi-tenant SaaS é um diferencial contra sistemas desktop/on-premise legados.
- **Risco:** A ausência de cálculo tributário real impede a participação em editais de "Gestão Tributária Completa".
- **Risco:** Sem assinatura digital, as certidões emitidas não têm validade jurídica para o cidadão.

---

> Nota: Esta matriz deve ser atualizada sempre que um marco de maturidade (A-D) for atingido.
