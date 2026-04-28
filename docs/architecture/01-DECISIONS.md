# Architecture Decisions

## AD-001 - Monorepo com Web e API separados
Contexto: o projeto já opera com `apps/web` (Next.js) e `apps/api` (NestJS).
Decisão: manter a separação e evoluir por domínio, não reescrever.
Racional: reduz risco, preserva testes e acelera entrega.

## AD-002 - Multi-tenant explícito
Contexto: o contrato de Ubatuba exige segregação por tenant.
Decisão: tudo deve continuar filtrado por `tenantId` e, quando aplicável, `slug`.
Racional: evita vazamento entre prefeituras e mantém aderência contratual.

## AD-003 - GeoServer como backend geoespacial
Contexto: o repositório já usa GeoServer para raster e camadas publicadas.
Decisão: manter GeoServer como engine de publicação/serving e usar MapLibre no frontend.
Racional: desacopla visualização de publicação e evita reescrita GIS.

## AD-004 - Fluxos críticos com auditoria
Contexto: CTM, REURB, levantamentos e processos têm valor jurídico.
Decisão: writes críticos devem persistir auditoria e histórico.
Racional: compliance e rastreabilidade são parte do produto, não extra.

## AD-005 - Portal cidadão por coexistência
Contexto: Ubatuba já possui portal de serviços.
Decisão: não duplicar o portal; integrar por deep link, SSO e adapters.
Racional: menor atrito político e melhor chance de adoção.

## AD-006 - Demos devem ser dados reais coerentes
Contexto: produto comercial precisa mostrar valor sem depender de vazio.
Decisão: seed demo deve representar um município litorâneo, com Ubatuba como referência.
Racional: melhora venda, QA e exploração funcional.

## AD-007 - P0 antes de P1/P2
Contexto: o escopo é grande e comparável a suíte municipal completa.
Decisão: priorizar primeiro Ubatuba e o núcleo contratual, depois paridade Geopixel, depois acabamento comercial.
Racional: evita dispersão e maximiza chance de entrega útil.

