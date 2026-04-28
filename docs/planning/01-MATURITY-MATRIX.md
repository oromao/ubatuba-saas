# 01 — Maturity Matrix

> Scorecard de maturidade por domínio. Escala 0-5.
> Atualize ao final de cada sprint ou quando houver mudança material.
> Última atualização: `2026-04-28` por `Mistral Vibe` (Diagnóstico Completo Pós-GLM)

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

## Matriz Atual vs Alvo GeoPixel-Class

| # | Domínio | Agora | Alvo Q2/2026 | Alvo Q4/2026 | Gap GeoPixel | Próxima ação (ref T) |
|---|---|:-:|:-:|:-:|:-:|---|
| 1 | GIS / WebGIS | 2 | 4 | 5 | **-3** | T8-GIS-MVT, T8-GIS-CRS, T8-GIS-BBOX |
| 2 | CTM / lifecycle de parcela | 3 | 4 | 5 | **-2** | T8-CTM-DESMEMB, T8-CTM-COMPLETO |
| 3 | Parcel search/detail UX | 4 | 4 | 5 | **-1** | T8-CTM-COMPLETO |
| 4 | Imports (GeoJSON / CSV / externos) | 2 | 4 | 4 | **-2** | T8-INTEG-GEOSAMPA, T8-GIS-CRS |
| 5 | Tributação / IPTU / PGV / valor venal | 1 | 4 | 5 | **-4** | T8-TRIB-IPTU, T8-TRIB-PLANTA |
| 6 | Vistorias / workflows de campo | 2 | 4 | 4 | **-2** | T8-PROCESS-ALVARA (extend vistorias) |
| 7 | Mobile / uso em campo | 1 | 3 | 4 | **-3** | T10-OFFLINE-FULL |
| 8 | Portal cidadão / serviço público | 2 | 3 | 4 | **-2** | T8-CIDADAO-156, T8-CERTIDAO-OFICIAL |
| 9 | Dashboards / observatório | 2 | 4 | 4 | **-2** | T10-OBSERVATORIO |
| 10 | Relatórios / exportações / PDFs | 2 | 4 | 4 | **-2** | T8-CERTIDAO-OFICIAL, T10-OBSERVATORIO |
| 11 | Notificações / cartas / comunicação | 1 | 3 | 4 | **-3** | T8-PROCESS-ALVARA (extend) |
| 12 | Aprovações / compliance / workflows | 0 | 3 | 4 | **-4** | T8-PROCESS-ALVARA, T8-PROCESS-HABITE |
| 13 | Segurança / RBAC / multi-tenant / auditoria | 2 | 4 | 5 | **-3** | T9-MULTI-TENANT-PROOF, T9-SEC-AUDIT |
| 14 | UX / navegação / usabilidade operador | 3 | 4 | 5 | **-2** | T9-ERROR-HANDLING, T9-HELP-SYSTEM |
| 15 | Testes / qualidade / release readiness | 2 | 4 | 5 | **-3** | T5-SP-UNIT-CRITICAL, T5-SP-PLAYWRIGHT-STABLE-SP |
| 16 | Automation / memory / DevEx | 4 | 5 | 5 | **-1** | - |

## Heatmap Resumo

```
MADURO (>=4):      Automation/DevEx
PARCIAL (2-3):    CTM, UX, Mobile, Portal, Relatórios, Auditoria
IMATURO (1):      GIS, Imports, Tributação, Vistorias, Notificações, Dashboards
AUSENTE (0):      Aprovações/Workflows, Processos
```

**Gap Médio vs GeoPixel: -2.8 pontos**
**Score Geral: 20.5/100 (FALHA TOTAL para licitação)**

---

## Matriz Detalhada vs GeoPixel-Class

| # | Domínio | FlyDea | GeoPixel | Gap | Evidência FlyDea | O que falta para paridade | O que falta para vencer |
|---|---|:-:|:-:|:-:|---|---|---|
| 1 | **GIS/WebGIS** | 2 | 5 | **-3** | Bbox viewport (parcial), fitBounds | MVT tiles, clustering, escala 50k+ | Cache intelligent, 3D, temporal layers |
| 2 | **CTM/cadastro imobiliário** | 3 | 5 | **-2** | Parcela CRUD, histórico | Workflow de desmembramento, loteamento | Integração com registro de imóveis |
| 3 | **IPTU/PGV/valor venal** | 1 | 5 | **-4** | Dashboard com totais (mock) | Cálculo automático, planta de valores | Simulação fiscal, projeções |
| 4 | **Vistorias/fiscalização** | 2 | 5 | **-3** | Criar vistoria, status | Workflow complexo, multa, embargos | Mobile offline, assinatura digital |
| 5 | **Mobile/offline/campo** | 1 | 4 | **-3** | Página /mobile existente | Sync offline, GPS, fotos | Capacidade offline total, PWA |
| 6 | **Portal cidadão/156** | 2 | 5 | **-3** | Formulário básico | Acompanhamento, protocolo, notificações | Integração com 156 nacional |
| 7 | **Processos/licenciamento** | 0 | 5 | **-5** | NADA | Alvarás, habite-se, licenças | BPMN engine, prazos automáticos |
| 8 | **Certidões/documentos** | 1 | 5 | **-4** | PDF básico | Certidão negativa, IPTU, uso do solo | Assinatura digital, validade jurídica |
| 9 | **Dashboards/observatório** | 2 | 5 | **-3** | KPIs básicos | Indicaores executivos, comparativos | Predictive analytics, alertas |
| 10 | **Monitoramento territorial/alertas** | 0 | 4 | **-4** | NADA | Alertas geográficos, temporal | IA para detecção de anomalias |
| 11 | **Auditoria/LGPD/RBAC** | 2 | 5 | **-3** | Trilha básica | Audit trail completo, multi-tenant hard | Certificação, compliance automático |
| 12 | **Integração intersecretarias** | 1 | 5 | **-4** | NADA | Integração com saúde, educação, etc. | Hub central, API gateway |
| 13 | **Testes/QA/release** | 2 | 5 | **-3** | Smoke tests | Unit, integration, E2E completo | CI/CD automate, performance tests |
| 14 | **Operação real/dados sujos** | 1 | 5 | **-4** | Import básico | Handle 50k+, dados sujos, recovery | Auto-correção, data quality |

---

## Histórico de Mudanças

| Data | Agente | Domínio | De → Para | Motivo |
|---|---|---|---|---|
| 2026-04-28 | Mistral Vibe | TODOS | Reavaliação Completa | Diagnóstico Público-class: Gap -2.8 vs GeoPixel |
| 2026-04-21 | Codex | CTM / lifecycle de parcela | 3 → 4 | Busca → detalhe → edição → reload com persistência real passou |
| 2026-04-21 | Codex | Parcel search/detail UX | 3 → 4 | Lista real, detalhe e edição com payload persistido validado |
| 2026-04-21 | Codex | Relatórios / exportações / PDFs | 3 → 4 | Clique no detalhe da parcela + leitura binária do PDF validada |
| 2026-04-21 | Codex | Tributação / IPTU / PGV / valor venal | 3 → 4 | Dashboard/executive and parcel statistics match on IPTU totals |
| 2026-04-21 | Codex | Vistorias / workflows de campo | 3 → 4 | E2E create → status → history → vínculo com parcela passou |
| 2026-04-21 | Codex | Automation / memory / DevEx | 3 → 4 | Hooks nativas + launcher fallback passaram a acionar bootstrap/write-back automaticamente |
| 2026-04-20 | Claude | Portal cidadão / serviço público | 2 → 4 | Prova browser→API→DB do `T3-CITIZEN` completada no workspace 156 |
| 2026-04-17 | Claude | UX / navegação / usabilidade operador | 3 → 4 | Smoke do menu provou navegação sem tela vazia nas rotas visíveis |
| 2026-04-17 | Claude | Testes / qualidade / release readiness | 3 → 4 | Smoke do menu e da hidratação passaram com seed local reproduzível |
| 2026-04-17 | Claude | UX / navegação / usabilidade operador | 2 → 3 | Estado explícito de redirecionamento + prova E2E de hidratação sem tela em branco |

---

## Benchmark GeoPixel-Class (Referência Competitiva)

### O que uma plataforma GeoPixel-class DEVE ter:

1. **GIS/WebGIS em Escala**
   - Suporte a 100k+ geometrias
   - MVT Tiles (Mapbox Vector Tiles)
   - Clustering automático
   - MultiPolygon complexo (holes, ilhas)
   - CRS transform automático (UTM↔WGS84)
   - FitBounds inteligente
   - Fallback WebGL explícito

2. **CTM Completo**
   - CRUD completo de parcelas
   - Desmembramento e loteamento
   - Histórico completo
   - Integração com registro de imóveis
   - vinculo com logradouros, infraestrutura

3. **IPTU/PGV/Valor Venal**
   - Cálculo automático
   - Planta de valores por zona
   - Dívida ativa
   - Integração com SIGEF (Receita)
   - Simulador fiscal

4. **Vistorias/Fiscalização**
   - Workflow completo
   - Emissão de auto de infração
   - Notificações
   - Multas
   - Embargos

5. **Mobile/Offline/Contra Campo**
   - Aplicativo mobile
   - Modo offline completo
   - GPS integrado
   - Captura de fotos
   - Sync automático ao reconectar

6. **Portal do Cidadão/156**
   - Solicitações online
   - Acompanhamento de protocolos
   - Integração com 156 Nacional
   - Notificações push
   - Chatbot de atendimento

7. **Processos/Licenciamento**
   - Alvarás de construção
   - Habite-se
   - Licenças de obra
   - Aprovações automáticas
   - Workflow BPMN

8. **Certidões/Documentos Oficiais**
   - Certidão negativa de débitos
   - Certidão de uso do solo
   - Certidão de IPTU
   - Assinatura digital
   - Validade jurídica

9. **Dashboards/Observatório**
   - KPIs executivos
   - Comparativos temporais
   - Monitoramento territorial
   - Alertas inteligentes
   - Relatórios PDF oficiais

10. **Monitoramento/Alertas**
    - Alertas geográficos
    - Monitoramento de mudanças
    - IA para detecção de anomalias
    - Integração com sensores IoT

11. **Auditoria/LGPD/RBAC**
    - Audit trail completo
    - Multi-tenant isolation
    - RBAC granular
    - Compliance LGPD
    - Certificação de segurança

12. **Integração Intersecretarias**
    - Hub central de integração
    - API Gateway
    - Integração com Saúde, Educação, etc.
    - Webhooks e eventos

13. **Testes/QA**
    - Unit tests (>70% coverage)
    - Integration tests
    - E2E completo
    - Performance tests
    - Security tests
    - Load tests (100+ usuários)

14. **Operação Real**
    - Backup/restore automático
    - Monitoramento 24/7
    - SLA definido
    - Suporte a dados sujos
    - Data quality pipelines

---

## Notas de Reavaliação (2026-04-28)

> **Análise Feita por:** Mistral Vibe (Principal GovTech Product Strategist + Principal GIS Architect + Principal QA Auditor)
> **Modo:** DEEP BRAINSTORM + GAP ANALYSIS
> **Contexto:** GLM executou 10 itens mas NENHUM está com status DONE no backlog

### Achados Críticos:

1. **Falsa Sensação de DONE**: Os 10 itens do GLM estão marcados como TODO, não DONE
2. **Moves de Dados Reais**: NADA validado com dados reais de São Paulo (50k+ geometrias)
3. **GIS Quebra em Escala**: Sem MVT, sem clustering, sem bbox viewport → crash com 50k+
4. **CRS Não Implementado**: SP usa UTM 31983, sistema assume WGS84 → dados corrompidos
5. **Nenhum Processo**: Alvarás, Habite-se, Licenças → INEXISTENTES
6. **Certidões Não Oficiais**: PDF simples sem assinatura digital → sem validade jurídica
7. **Mobile Inexistente**: Página existe mas não testado → ZOMBIE
8. **Multi-tenant Não Provado**: Sem testes de isolamento → risco de vazamento
9. **Sem Testes de Carga**: Não sabe se escala → risco operacional
10. **Documentação Insuficiente**: Nada para licitação → desqualificação imediata

### Conclusão:
**FlyDea está a ~6 meses e ~100 dias-homem de distância de parar de competir com GeoPixel em licitações municipais.**

**Recomendação:** NÃO PARTICIPAR de licitações até resolver os 8 blockers críticos identificados e atingir score mínimo de 70/100.
