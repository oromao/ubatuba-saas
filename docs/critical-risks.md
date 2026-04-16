# Riscos Críticos (Pós-Refatoração)

## 1. Workflow de Alvarás
**Risco Baixo-Médio**
O fluxo de Alvarás (Obras, Empresas) agora possui etapas, responsáveis, histórico, evidências, exigências e decisão final. O risco residual é mais de maturidade operacional do que de ausência funcional. Ainda pode faltar integração real com protocolos externos, mas a demo já mostra tramitação convincente.

## 2. PGV Analítica
**Risco Baixo-Médio**
A PGV deixou de ser cadastros isolados e passou a expor simulação venal, comparativo atual versus proposto, impacto estimado de arrecadação e recorte territorial dos imóveis afetados. O risco residual está em calibração dos cenários e na qualidade dos dados de origem, não na existência do motor.

## 3. Integração Legada Oculta (ERPs Municipais)
**Risco Médio**
As integrações foram mapeadas (ex: `IntegrationHubModule`), porém dependem estritamente da adesão dos sistemas financeiros do município (como Fiorilli, SmarAPD). Se eles não oferecerem APIs modernas para injetar as discrepâncias territoriais que encontramos no CTM, o processo continuará dependendo de planilhas manuais.
