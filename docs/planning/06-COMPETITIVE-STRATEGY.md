# 06 — Competitive Strategy vs GeoPixel

> Documento vivo. Atualizar ao fim de cada sprint ou mudança material no posicionamento.
> Última atualização: `2026-04-24` por `Claude (audit consolidation)`

---

## 1. Análise Competitiva: FlyDea vs GeoPixel

### GeoPixel (Referência de Mercado)

**Fortalezas:**
- ✅ WebGIS enterprise consolidado (Cesium, cartografia própria, 10+ anos de UX)
- ✅ CTM maduro (ciclo completo de parcela/logradouro/mobiliário, importação robusta)
- ✅ IPTU/PGV estável e auditado em produção
- ✅ Mobile nativo (iOS/Android) para vistorias em campo
- ✅ Portal cidadão produção-ready
- ✅ E2E CI/CD automatizado
- ✅ Backup/DR documentado e testado
- ✅ Relação de confiança com +30 prefeituras (precedente forte em licitação)

**Vulnerabilidades:**
- ⚠️ Stack proprietário → vendor lock-in
- ⚠️ Menos modular (monólito) → customizações custosas
- ⚠️ Overhead de manutenção em stack fechada

---

### FlyDea (Nossa Posição)

**Fortalezas:**
- ✅ Modular (NestJS + Next.js) → personalizações ágeis
- ✅ Stack aberto (PostgreSQL, dados em SQL padrão) → sem lock-in
- ✅ Bom progresso em domínios core (CTM 4/5, GIS 3/5, Tributação 4/5)
- ✅ Infraestrutura moderna (Docker, Kubernetes-ready)
- ✅ Prova de conceito sólida em Ubatuba (município real)

**Gaps Críticos Identificados (Auditoria 2026-04-24):**

| Módulo | Gap | Impacto para Licitação | Status |
|---|---|---|---|
| **Vistorias** | Botão não funciona | Fiscalização parada | T1-AUDIT-VISTORIAS |
| **Portal Cidadão** | Erro 500 em envio | Porta de entrada bloqueada | T1-AUDIT-PORTAL-CIDADAO |
| **Roteamento** | Múltiplas rotas redirecionam | Admin inacessível | T1-AUDIT-ROUTING |
| **CTM Equipamentos** | Rota 404 | Mobiliário não catalogável | T1-AUDIT-CTM-EQUIPAMENTOS |
| **Mobile** | Apenas proof-of-concept (2/5) | Não há app para campo | T4-MOBILE (DONE) mas necessita desglamorização |
| **CI/CD** | Nenhuma prova E2E automatizada | Risco de regressão | (Fora do backlog atual) |
| **Compliance** | Sem auditoria visível | Prefeitura reluta | T4-AUDIT (PARTIAL) |
| **UX** | Empty states, wizard incompleto | Operador confuso | T3-EMPTY-STATES (DONE) |

---

## 2. Decisão Estratégica: Qual Brecha Fechar Primeiro?

### Opção A: Mobile First (Vistorias em Campo)
**Objetivo:** Demonstrar fiscalização mobile robusta em Ubatuba
- **Pró:** Diferencial claro vs GeoPixel no campo (offline-first, app nativo)
- **Contra:** 6-8 semanas; backend de sincronização complexo
- **Impacto em licitação:** Médio (mobile é nice-to-have, não bloqueador)

### Opção B: Reliability & Compliance (CI/CD + Backup + Auditoria)
**Objetivo:** Provar "operacional confiável" em nível municipal
- **Pró:** Sinaliza maturidade institucional; fecha maior brecha vs GeoPixel
- **Contra:** Invisível para o cidadão/operador (não vende bem)
- **Impacto em licitação:** ALTO (prefeituras exigem SLA, recuperação de falha, trilha legal)

### Opção C: Balanced (40% cada) — Operacional rápido
**Objetivo:** Fechar 4 T1-AUDIT items + estabilizar mobile proof + melhorar UX
- **Pró:** Amplitude; credibilidade rápida em múltiplas frentes
- **Contra:** Nada fica muito profundo
- **Impacto em licitação:** Médio-Alto (cobre base mas não domina)

---

## 3. Recomendação (Paulo)

**Opção recomendada: C (Balanced) com foco em T1-AUDIT primeiro**

**Racional:**
1. **T1-AUDIT items (semana 1-2):** Fechar 4 bloqueadores críticos deixa o sistema operacional.
   - T1-AUDIT-VISTORIAS (vistoria funciona → fiscalização proof)
   - T1-AUDIT-PORTAL-CIDADAO (cidadão envia → channel aberto)
   - T1-AUDIT-ROUTING (admin navega → confiança interna)
   - T1-AUDIT-CTM-EQUIPAMENTOS (rota restaurada)

2. **T2-AUDIT + T1-DEVSERVER stabilization (semana 2-3):**
   - Dados de teste (T2-AUDIT-TEST-DATA) → validação de fluxos reais
   - Menu fixes (T2-AUDIT-MENU-FIXES) → UX coerente
   - Feedback visual (T2-AUDIT-FEEDBACK-VISUAL) → confiança do operador

3. **Parallel track — CI/CD & backup (semana 3-4):**
   - Iniciar discussão de E2E CI/CD (não no backlog ainda, mas critical)
   - Documentar estratégia de backup (pode ser simplista no início)

4. **Month 2: Ampliar mobile + compliance** (após T1/T2 green)

---

## 4. Roadmap para Ganhar Licitações

### Imediato (Semana de 2026-04-24)

| Item | Esforço | Impacto | Bloqueador |
|---|---|---|---|
| T1-AUDIT-PORTAL-CIDADAO | M (6h) | CRÍTICO | Cidadão não envia |
| T1-AUDIT-VISTORIAS | S (4h) | CRÍTICO | Fiscalização parada |
| T1-AUDIT-ROUTING | M (5h) | CRÍTICO | Admin inacessível |
| T1-AUDIT-CTM-EQUIPAMENTOS | S (3h) | CRÍTICO | Rota 404 |

**Sprint Goal:** 4/4 T1-AUDIT items DONE + deploy em VPS testado.

---

### Semana 2 (2026-05-01)

| Item | Esforço | Impacto | Nota |
|---|---|---|---|
| T2-AUDIT-TEST-DATA | L (8h) | ALTO | Sem dados, não valida fluxos |
| T2-AUDIT-MENU-FIXES | S (2h) | MÉDIO | UX coerente |
| T2-AUDIT-FEEDBACK-VISUAL | S (2h) | MÉDIO | Clareza de estado |
| T1-HYDRATION fix (se reemergir) | — | — | Depende T1-DEVSERVER |

**Sprint Goal:** T2 items done; base com seed testável.

---

### Semana 3-4 (2026-05-08)

**Trilha A (Dev):** Iniciar E2E CI/CD proof
- Objetivo: `pnpm test:e2e:full` verde em CI sem flake
- Impacto: Prefeitura vê confiança em quality gates

**Trilha B (Infra):** Documentar backup/disaster recovery
- Objetivo: Runbook simples de restore (1 página)
- Impacto: Prefeitura confia em continuidade

**Trilha C (Product):** Ampliar mobile proof
- Objetivo: T4-MOBILE → prova completa de offline + sync
- Impacto: Demonstração diferencial em campo

---

### Trimestre Q2 (Maio-Junho)

**Prova Municipal em Ubatuba:**
- ✅ Fiscal cria vistoria (T1-AUDIT-VISTORIAS + T4-MOBILE)
- ✅ Cidadão envia reclamação (T1-AUDIT-PORTAL-CIDADAO)
- ✅ Admin gera relatórios (T4-AUDIT + compliance proof)
- ✅ Dashboard executivo estável (T3-DASH-PROOF, DONE)
- ✅ CI/CD muda cor em falhas (E2E CI/CD proof)

**Resultado:** "Sistema operacional confiável" → Proposta para licitação.

---

## 5. Messaging para Prefeituras (Deck de Vendas)

### Slide 1: "FlyDea é Diferente"
- Aberto, modular, sem lock-in
- Pronto em stack commodity (PostgreSQL, Next.js, NestJS)
- Prova real em Ubatuba desde 2026-04-20

### Slide 2: "Operacional Confiável" (aponta para T1/T2/T4-AUDIT)
- E2E CI/CD automatizado (imagem: pipeline verde)
- Backup/DR documentado
- Auditoria de cada ação
- Suporte em português, conhecimento open-source

### Slide 3: "Diferencial: Vistorias em Campo"
- App mobile offline-first
- Sincronização automática
- Foto/geo integrado
- Demo prova em VPS ao vivo

### Slide 4: "Preço: 40-60% vs GeoPixel"
- Stack aberto = custo menor
- Customizações ágeis = time reduzido
- Suporte especializado em SaaS

---

## 6. Métricas de Sucesso (Gate de Licitação)

Antes de propor em qualquer licitação, validar:

- [ ] **T1-AUDIT:** 4/4 items DONE + prova em VPS publik
- [ ] **T2-AUDIT-TEST-DATA:** Seed com 50+ parcelas rodando
- [ ] **T4-AUDIT:** Trilha de auditoria operacional (não perfeita, mas visível)
- [ ] **T4-MOBILE:** Prova offline + sync no Playwright
- [ ] **E2E CI/CD:** Ao menos 1 teste E2E rodando em CI automaticamente
- [ ] **Deck de vendas:** Aprovado por Paulo

---

## 7. Risks & Mitigações

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **T1-AUDIT items levam mais que 2w** | MÉDIO | ALTO | Parallelizar; usar múltiplas IAs |
| **Backend de Portal Cidadão mais complexo que 6h** | MÉDIO | MÉDIO | Investigar imediatamente; logar verbosamente |
| **Mobile nativo inviável rapidamente** | BAIXO | MÉDIO | Fallback: Web app responsivo (já temos) |
| **Prefeitura exige feature não no roadmap** | ALTO | MÉDIO | Flexibilidade modular ajuda; negocia escopo |
| **Benchmark performance vs GeoPixel** | BAIXO | BAIXO | FlyDea pode ser mais rápido (stack novo) |

---

## 8. Próxima Ação

**Imediato (hoje):**
1. Revisar e aprovar este roadmap (Paulo)
2. Iniciar T1-AUDIT-PORTAL-CIDADAO (debug backend, verificar logs)
3. Parallelizar: T1-AUDIT-ROUTING (revisar next router config)

**Amanhã:**
- Sprint planning de 1 semana (T1-AUDIT items + T1-DEVSERVER estabilidade)
- Nomear lead para cada T1 (múltiplas IAs parallelizadas)

**Fim da semana:**
- 4/4 T1-AUDIT items DONE OU BLOCKED com motivo documentado
- VPS com deploy testado para demo a prefeituras
