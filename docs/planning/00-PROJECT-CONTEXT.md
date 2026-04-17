# 00 — Project Context

> Este arquivo é o "constituição" do projeto. Atualize apenas mediante decisão arquitetural explícita.
> Última atualização: `2026-04-17` por `Claude (bootstrap inicial)`

---

## 1. Missão

Entregar a prefeituras brasileiras uma plataforma SaaS govtech **operacionalmente confiável** para gestão territorial, tributária e de serviços municipais, com GIS, CTM e IPTU/PGV como núcleo e parcela/lote como entidade central.

## 2. Domínio (o que o produto resolve)

| Domínio | Propósito operacional |
|---|---|
| **GIS / WebGIS** | Representar o território de forma operacional (não visual). Camadas, geometria, overlays, fitBounds, Polygon/MultiPolygon, fallback para ambientes sem WebGL. |
| **CTM / Cadastro Territorial** | Parcelas/lotes, logradouros, mobiliário urbano, vínculos cadastrais, importação de base, busca e detalhamento. |
| **Tributação** | IPTU, PGV, valor venal, arrecadação, inadimplência, apoio à gestão fiscal. |
| **Vistorias / field workflows** | Criar, transicionar status, registrar observações, vincular à parcela. |
| **Processos / workflows** | Trâmite administrativo e aprovações municipais. |
| **Portal cidadão** | Solicitações, validações e acompanhamento público/semi-público. |
| **Dashboards / observatório** | Visão executiva, KPIs, leitura de contexto municipal. |
| **Notificações / cartas / relatórios** | Geração de documentos oficiais e comunicação. |
| **Multi-tenant / RBAC / auditoria** | Isolamento por prefeitura, perfis de acesso, trilha de auditoria. |

## 3. Entidade central: a parcela

**Regra arquitetural não negociável:** toda funcionalidade do sistema deve, direta ou indiretamente, se conectar à parcela. A parcela é o "grafo único de verdade municipal" e deve aparecer coerentemente em:

```
        mapa
         │
tributo ── parcela ── vistoria
         │
      relatório / processo
```

Se um módulo não se conecta à parcela, justifique por escrito em `02-BACKLOG.md` antes de construir.

## 4. Arquitetura de alto nível

### Frontend
- **Next.js (App Router)**, rotas em `app/*`.
- Layout autenticado via `useAuthGuard` e `isAppRouteAllowed`.
- Navegação construída a partir de `nav-config.ts` (role-aware).
- Sidebar/topbar/mobile shell.
- Componentes de mapa reais (não decorativos).
- Abstração de data table compartilhada.

### Backend
- **NestJS modular**, um módulo por domínio.
- Módulos existentes: CTM, GIS/map-features/layers/metrics/monitoring, PGV (zonas, faces, fatores, valuations, simulações), Tax Integration, Uploads/Storage, Reports, Reurb, Public Works / Permits, Projects, Assets, Members, Surveys, Cemetery, Mobile, Notifications.

### Integração
- `apiFetch` no frontend gerencia bearer token, refresh, 401 redirect, tenant id, parsing de erro.
- Token em `sessionStorage`.

### Persistência
- Intenção: persistência real em banco.
- Demo/fallback é **provisório**, nunca municipal-grade.

## 5. O que o sistema **não é**

- Não é uma ferramenta de BI ou dashboard standalone.
- Não é um GIS genérico (tipo QGIS online).
- Não é ERP municipal completo — é plataforma territorial+tributária com extensões.
- Não é produto demo. O demo é ferramenta de venda, não comportamento de produção.

## 6. Competidor de referência

**GeoPixel** (govtech municipal brasileira madura). Calibra o patamar de "operacional confiável". A lacuna do projeto atual vs GeoPixel **não é de escopo** — é de **densidade de prova, robustez e workflow completeness**.

## 7. Vocabulário de maturidade

Ver `07-DEFINITIONS.md`. Nunca use "pronto", "completo" ou "funcionando" sem enquadrar em:
`REAL` / `PARTIAL` / `ZOMBIE` / `FAKE` / `DEAD`.

## 8. Restrições operacionais

- **Multi-tenant obrigatório**: nenhum módulo pode vazar dados entre prefeituras.
- **LGPD**: dados pessoais de cidadãos (CPF, endereço, etc.) requerem trilha de auditoria.
- **Offline tolerável em campo**: vistorias devem aguentar conectividade ruim.
- **PDFs oficiais**: documentos gerados têm peso legal — formato não pode quebrar.

## 9. Perfil do decisor

**Paulo** — engenharia/DevOps, Catanduva-SP. Decisões arquiteturais, remoções de módulo, mudanças de prioridade e aprovação de "DONE" passam por ele.
