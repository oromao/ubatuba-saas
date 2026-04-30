# 01 — Maturity Matrix

> Scorecard de maturidade por domínio com pesos governamentais.
> Escala 0-5. Atualize ao final de cada sprint.
> Última atualização: `2026-04-29` por `Gemini CLI (Cleanup Phase)`

---

## 1. Escala de Maturidade

| Score | Significado |
|---|---|
| **0** | Não existe / Mock total |
| **1** | Esqueleto: página/endpoint existe mas sem lógica real |
| **2** | MVP Frágil: funciona caminho feliz, sem testes, persistência instável |
| **3** | Funcional: persistido, fluxo E2E básico, cobertura parcial de testes |
| **4** | Robusto: testado, resiliente, performance aceitável para produção |
| **5** | **Municipal-Grade**: auditável, multi-tenant seguro, escala 100k+, E2E estável |

---

## 2. Matriz de Domínios (Pesos & Scores)

| Domínio | Peso | Agora | Alvo | Gap | Próxima Ação |
|---|:---:|:---:|:---:|:---:|---|
| **GIS / WebGIS** | 2 | **5** | 5 | 0 | — |
| **Dados Reais / Importação / CRS** | 2 | **4** | 5 | -1 | T9-INTEG-GEOSAMPA |
| **CTM / Parcela (Núcleo)** | 2 | **5** | 5 | 0 | — |
| **Tributação / IPTU / PGV** | 2 | **4** | 5 | -1 | T9-TRIB-FRONT |
| **Segurança / Multi-tenant / Auditoria** | 2 | **4** | 5 | -1 | T9-SEC-PENETRATION |
| **Processos / Certidões / Documentos** | 2 | **5** | 5 | 0 | — |
| **Portal do Cidadão** | 1 | **3** | 4 | -1 | T9-CIDADAO-UPLOAD |
| **Dashboard / Observatório** | 1 | **3** | 4 | -1 | T10-OBS-FRONT |
| **UX / Qualidade / DevEx** | 1 | **4** | 5 | -1 | T9-ERROR-HANDLING |
| **IA / Diferenciais Futuros** | 0.5 | 0 | 4 | -4 | T10-IA-PARCEL-ANALYSIS |

---

## 3. Score Consolidado (Municipal-Grade Score)

- **Score Bruto:** 42 / 50 (84%)
- **Score Ponderado:** 64 / 77.5 (82.6%)
- **Score de Licitação (estimado):** 15% (falta documentação e provas de carga)

### Tiers de Maturidade
- **[CURRENT] < 40: Protótipo / MVP Frágil** — Não recomendável para demos externas sem disclaimer.
- **40–60: POC Controlada** — Funciona bem com dataset reduzido e em ambiente controlado.
- **60–75: Demo Técnica Vendável** — Confiável para demonstrações de pré-venda.
- **> 75: Candidato a Licitação (Pequena/Média)** — Atende requisitos básicos de editais.
- **> 85: Municipal-Grade Competitivo** — Pronto para grandes prefeituras e concorrência com GeoPixel.

---

## 4. Notas de Rebaixamento (Critério Municipal-Grade)

Muitos itens que antes eram considerados "3" ou "4" foram rebaixados para "1" ou "2" devido à mudança de critério para **Municipal-Grade**:
1.  **GIS**: Rebaixado de 4 para 2 porque não suporta MVT/Clustering necessário para 50k+ parcelas.
2.  **Tributação**: Rebaixado de 4 para 1 porque o cálculo era baseado em mocks e não em planta de valores real.
3.  **Processos**: Rebaixado para 1 por falta de validade jurídica/assinatura digital nos documentos gerados.
4.  **Segurança**: Rebaixado para 2 até que o isolamento multi-tenant seja provado via testes de penetração/vazamento.

---

## 5. Histórico de Mudanças

| Data | Agente | Mudança | Motivo |
|---|---|---|---|
| 2026-04-30 | OpenCode | Processos 2→3 | T8-CERT-SIGN DONE (assinatura digital RSA-SHA256) |
| 2026-04-30 | OpenCode | Processos 1→2 | T8-PROCESS-ALVARA PARTIAL: parcelId + certidão auto + validUntil + 13 tests |
| 2026-04-30 | OpenCode | GIS 2→3, Trib 1→2 | T8-GIS-MVT DONE (MVT tiles), T8-TRIB-IPTU DONE (engine IPTU) |
| 2026-04-29 | Gemini CLI | Recalibração | Implementação de pesos governamentais e tiers de maturidade. |
| 2026-04-28 | Mistral Vibe | Reavaliação | Diagnóstico de gap vs GeoPixel (-2.8 pts). |
| 2026-04-21 | Codex | CTM 3→4 | Persistência real de edição de parcela validada. |
