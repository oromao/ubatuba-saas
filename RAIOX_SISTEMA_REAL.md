# RAIO-X REAL DO SISTEMA FLYDEA
**Data**: 2026-04-10 | **Executor**: CTO/Principal Architect | **Contexto**: Análise de Maturidade GovTech

---

## ⚠️ RESUMO EXECUTIVO

O sistema FlyDea é uma **plataforma de geo-inteligência municipal em estágio INICIAL DE MATURIDADE** com boas fundações técnicas, mas com **grandes gaps funcionais e de UX** que o impedem de competir com players consolidados como GeoPixel.

### Veredito Rápido
- ✅ **Tech Stack Sólido**: Next.js 14 + NestJS + MongoDB + MapLibre (escolhas corretas)
- ✅ **Arquitetura Limpa**: Modularização por domínio, RBAC, multi-tenancy, CI/CD
- ✅ **Segurança Base**: JWT, Helmet, validação, logging estruturado
- ❌ **Funcionalidade Rasa**: Muitas telas sem valor operacional real
- ❌ **UX Fraca**: Navegação confusa, busca inútil, fluxos incompletos
- ❌ **Diferencial Nulo**: Não oferece nada que GeoPixel não oferça melhor
- ❌ **Pronto para Demo?**: NÃO. Passaria vergonha em PoC com prefeitura

---

## 1. ARQUITETURA GERAL

### 1.1 Estrutura do Monorepo
```
ubatuba-saas/
├── apps/
│   ├── api/           # NestJS backend (47 controllers)
│   └── web/           # Next.js 14 frontend (41 rotas)
├── .github/
│   └── workflows/     # E2E CI/CD (Playwright)
├── infra/             # Docker Compose, configurações
├── docs/              # Documentação
├── poc/               # Scripts de teste E2E
└── tests/             # Testes Playwright
```

### 1.2 Stack Tecnológico (CORRETO)
**Backend:**
- NestJS 10.3 (framework modular, enterprise)
- MongoDB 8.5 + Mongoose (flexible, geo-queries)
- JWT + Passport (autenticação padrão)
- Swagger/OpenAPI (documentação automática)
- Pino (logging estruturado)
- Prometheus (métricas)
- Redis (cache, rate-limiting)
- AWS S3 (storage)
- Turf.js + GeoJSON-VT + VT-PBF (GIS)

**Frontend:**
- Next.js 14.2 (app router, SSR)
- React 18 (components)
- Tailwind CSS (styling)
- React Query (state management data)
- Zustand (state management app)
- MapLibre GL + Mapbox GL Draw + TerraDraw (GIS)
- Radix UI + shadcn/ui (components)
- Zod (validation)
- React Hook Form (forms)

**Observação**: Stack está 100% correto para um produto B2G moderno. Não há problemas técnicos aqui.

### 1.3 Padrão de Camadas (Backend)
```
api/
├── src/
│   ├── modules/              # Negócio (47 módulos)
│   │   ├── auth/             # Autenticação
│   │   ├── tenants/          # Multi-tenancy
│   │   ├── users/            # Usuários
│   │   ├── ctm/              # Cadastro Territorial
│   │   ├── pgv/              # Planta Genérica de Valores
│   │   ├── reurb/            # Regularização
│   │   ├── dashboard/        # Análise
│   │   ├── maps/             # Geoespacial
│   │   ├── [26+ outros]      # Módulos de menor importância
│   ├── common/               # Infraestrutura
│   │   ├── guards/           # JWT, Roles, Tenant
│   │   ├── filters/          # Error handling
│   │   ├── interceptors/     # Response normalization
│   │   ├── logger/           # Logging
│   │   └── utils/            # Geo helpers
│   └── main.ts               # Setup da app
```

---

## 2. ANÁLISE CRÍTICA DA QUALIDADE REAL

### 2.1 O QUE FUNCIONA BEM ✅

#### Autenticação e Autorização
- JWT com refresh tokens (15 min expiry)
- Roles-based access control (RBAC) implementado
- Password reset com tokens temporários
- Rate limiting configurado
- Auditoria de eventos de auth
- **Nota**: Bom, padrão de indústria

#### Multi-Tenancy
- Tenant header + token-based routing
- Segregação de dados por `tenantId`
- Guard global de tenant
- **Gap**: Sem data-level encryption de tenant secrets

#### Logging e Observabilidade
- Pino logger estruturado (JSON)
- Correlation ID para rastreamento
- Logging de HTTP requests (método, path, status, latência)
- Prometheus metrics
- **Nota**: Pronto para produção

#### CI/CD
- GitHub Actions com E2E Playwright
- Docker Compose para dev environment
- Linter + type checking
- Build pipeline automático
- **Nota**: Básico mas funcional

#### Documentação API
- Swagger/OpenAPI em `/docs`
- Especificação de auth (Bearer + tenant-id)
- Tags por domínio de negócio
- **Nota**: Está lá, mas muitos endpoints não estão documentados com `@ApiOperation`

#### Segurança Base
- Helmet (headers de segurança)
- CORS configurado
- Input validation (class-validator)
- Whitelist + forbidNonWhitelisted
- **Nota**: Bom, sem SQL injection ou XXS óbvios

---

### 2.2 O QUE FUNCIONA MAS ESTÁ IMATURO 🟡

#### Mapa Interativo
- MapLibre GL funciona
- Carregamento de camadas (MVT, raster)
- Integração com backend (dynamic imports)
- **Gaps**:
  - Sem search/click interativo real
  - Sem edição de geometrias de verdade (TerraDraw presente mas sem fluxo)
  - Sem responsividade móvel adequada
  - Sem performance otimizada para grandes datasets
  - Sem clustering/aggregation visual
  - Sem offline-first capability

#### Dashboard
- Widgets configuráveis
- KPI cards simples
- Layout persistido por usuário
- **Gaps**:
  - Sem dados reais de análise
  - Sem drilldown interativo
  - Sem filtros temporais
  - Sem comparativos
  - Sem narrativa visual forte
  - Endpoints hardcoded `/dashboard/kpis`, `/dashboard/executive`

#### Fluxos de Negócio (CTM, REURB, PGV)
- **Estrutura**: Existe (controllers, services, schemas)
- **Realidade**: 
  - Endpoints CRUD básicos
  - Sem workflow real
  - Sem validações de negócio
  - Sem integração entre módulos
  - Sem formulários dinâmicos
  - Sem attachments/evidências realmente funcionando
  - Sem assinatura eletrônica
  - Sem histórico de alterações

---

### 2.3 O QUE NÃO FUNCIONA OU ESTÁ QUEBRADO ❌

#### Busca Global
- **Atual**: Navega entre telas apenas
- **Esperado**: Busca de lotes, imóveis, processos, documentos
- **Status**: INÚTIL. "Buscar parcelas, telas e módulos..." retorna nada de verdade

#### Detalhamento de Lotes/Imóveis
- **Atual**: Tabela simples + mapa mini
- **Esperado**: Ficha completa com:
  - Dados cadastrais (SQLU, inscrição, área, endereço)
  - Histórico de alterações
  - Documentos/anexos
  - Imóveis relacionados
  - Processos associados
  - Alertas/pendências
  - Edição inline
- **Status**: Não existe

#### Fluxo de Vistoria/Fiscalização
- **Atual**: Menu chamado "Fiscalização" leva a "Processos Digitais" vazio
- **Esperado**: 
  - Criar vistoria
  - Formulário dinâmico por tipo
  - Captura de fotos/coordenadas
  - Assinatura
  - Geolocalização
  - Sync offline
- **Status**: NÃO EXISTE

#### Integrações Externas
- **Atual**: Endpoint `/integracoes` vazio
- **Esperado**: IPTU, ITBI, ISS, Protocolo, ERP
- **Status**: NÃO EXISTE

#### Relatórios
- **Atual**: Nenhum
- **Esperado**: PDF de lote, relatório de vistoria, boletim, notificação
- **Status**: NÃO EXISTE

#### Portal Cidadão
- **Atual**: Rotas de portal existem (`/portal/oidc/start`, `/portal/exchange`)
- **Esperado**: Cidadão pode consultar seu imóvel, fazer reclamação, pagar IPTU, acompanhar processo
- **Status**: ESTRUTURA SIM, FUNCIONALIDADE NÃO

#### Mobile
- **Atual**: Rota `/mobile` existe, sidebar responsiva
- **Esperado**: Operador de campo com offline-first, captura de dados, sync
- **Status**: NÃO EXISTE

---

### 2.4 Análise de Componentes Frontend

#### Positivos
- Design system com Tailwind (cores, espaçamento, tipografia)
- Layout sidebar + topbar sensato
- Componentes reutilizáveis (Card, Badge, Button, Input)
- Animações básicas (fade-up)
- Data table genérico

#### Negativos
- Sem nenhuma validação visual clara (form errors)
- Sem loading states decentes em operações longas
- Sem fallback para imagens/dados
- Sem empty states criativos
- Sem tooltips de ajuda
- Sem dark mode
- Sem accessibilidade (aria-labels escassos)
- Paginação não implementada (tabelas carregam tudo)
- Sem confirmação de ações críticas

---

## 3. MODELOS DE DADOS E DOMÍNIO

### 3.1 Entidades Principais (MongoDB)

**Parcel** (Lote/Imóvel)
```typescript
{
  tenantId: ObjectId      // Multi-tenancy
  projectId: ObjectId     // Workspace
  sqlu: string            // Identificador único
  inscription?: string    // Inscrição imobiliária
  enderecoPrincipal?: {   // Address
    logradouro, numero, bairro, cep, cidade, uf
  }
  geometry: PolygonGeometry    // GeoJSON
  areaTerreno?: number
  statusCadastral?: 'ATIVO' | 'INATIVO' | 'CONFLITO'
  workflowStatus?: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA'
  pendingIssues: string[]
  createdBy, updatedBy, timestamps
}
```

**Índices**: 
- `{tenantId, projectId, sqlu}` (unique)
- `{tenantId, projectId, inscription}`
- `{geometry: '2dsphere'}` (geo-queries)

**Assessment**: Simples mas funcional. **Faltas notáveis**:
- Sem versionamento de alterações
- Sem soft deletes
- Sem trilha de auditoria integrada
- Sem relacionamentos explícitos (imóveis dentro de lote, etc)
- Sem contraints de integridade

### 3.2 Outras Entidades

- **User**: Básico (email, senha, role, tenant)
- **Tenant**: Nome + slug
- **Membership**: Vinculação user-tenant-role
- **Process**: Genérico (tipo, status, workflow)
- **Alert**: Simples (título, descrição, status)
- **Asset**: Genérico (tipo, localização, condição)

**Padrão**: Muitas entidades genéricas. Pouca profundidade de negócio. Não há especialização para o domínio territorial/municipal.

---

## 4. GIS E MAPA

### 4.1 Implementação Atual

**Frontend** (`map-view.tsx`):
- MapLibre GL initialized com CartoDb Positron basemap
- Carregamento dinâmico de camadas (MVT, raster)
- Zoom centered em Ubatuba-SP (hardcoded)
- Navigation control simples

**Backend** (`/layers` endpoint):
- Retorna lista de camadas configuráveis
- Suporta MVT (Vector Tiles), raster, basemap
- Styling básico (color, opacity, line-width)

**Libs GIS**:
- `geojson-vt`: Converte GeoJSON em tiles
- `vt-pbf`: Protocol Buffer Format para tiles
- `@turf/area`: Cálculo de áreas
- Mapbox GL Draw: Drawing (presente mas não integrado)
- TerraDraw: Drawing (presente mas não integrado)

### 4.2 Problemas GIS

1. **Sem Query Geoespacial Real**
   - Sem "clique no mapa para buscar lotes"
   - Sem "desenhar polígono para filtrar"
   - Sem buffer/distance queries
   - Sem "lotes perto de ponto X"

2. **Sem Performance em Grandes Volumes**
   - Sem clustering
   - Sem LOD (Level of Detail)
   - Sem quadtree optimization
   - Sem caching de tiles

3. **Sem Edição Geográfica**
   - TerraDraw presente mas sem:
     - Fluxo de submit
     - Validação topológica
     - Snap-to-feature
     - Merge/split de polígonos
     - Undo/redo

4. **Sem Offline-First**
   - Sem cache local de tiles
   - Sem sync de mudanças
   - Sem queue de operações

---

## 5. FLUXOS CRÍTICOS (Análise Real)

### 5.1 Login
- ✅ Funciona (JWT + refresh)
- ✅ Rate limiting
- ✅ Tenant selection (se multi-tenant)
- ✅ Redirect pós-login

### 5.2 Busca de Lote/Imóvel
- ❌ **Não existe fluxo real**
- Menu → CTM → Parcelas
- Mostra tabela de TODAS as parcelas (sem paginação)
- Sem filtro de busca
- Sem busca por SQLU/inscrição
- Sem busca por endereço
- Mini-mapa mostra geometria ao clicar na tabela
- **Nota**: Operação fundamental está quebrada para real use case

### 5.3 Edição de Lote
- ❌ Não existe

### 5.4 Vistoria/Fiscalização
- ❌ Menu "Monitoramento e Alertas" leva a página vazia
- ❌ Menu "Processos Digitais" leva a página vazia
- ❌ Nenhum formulário dinâmico
- ❌ Nenhuma captura de evidências

### 5.5 Dashboard Executivo
- ✅ Carrega (componentes existem)
- ✅ Widgets configuráveis
- ❌ Dados hardcoded/mock
- ❌ Nenhum insight real
- ❌ Sem drilldown

### 5.6 Mapa Interativo
- ✅ Carrega camadas
- ✅ Zoom/pan funciona
- ❌ Sem clique interativo
- ❌ Sem busca por features
- ❌ Sem query builder

---

## 6. AVALIAÇÃO DE MATURIDADE

### 6.1 Checklist de Produto de Governo

- [ ] Parece software de mercado ou projeto interno?
  - **Resposta**: Projeto interno. Visual bonito mas UX confusa
  
- [ ] Tem narrativa forte de valor para prefeitura?
  - **Resposta**: NÃO. Menu + mapa + tabelas. Sem proposta clara
  
- [ ] Resolve dores reais ou só exibe mapas?
  - **Resposta**: Só exibe mapas. Nenhuma operação real funciona
  
- [ ] Aguenta demo séria?
  - **Resposta**: NÃO. Fiscal vai perguntar: "Onde busco um lote?" Sem resposta
  
- [ ] Aguenta PoC?
  - **Resposta**: NÃO. Faltam fluxos críticos
  
- [ ] Tem segurança minimamente séria?
  - **Resposta**: SIM. JWT, RBAC, helmet, validação
  
- [ ] Tem auditoria real?
  - **Resposta**: Logging de HTTP sim. Auditoria de dados não
  
- [ ] Tem UX convincente?
  - **Resposta**: NÃO. Cluttered, confuso, sem padrão
  
- [ ] Tem dashboards que vendem?
  - **Resposta**: NÃO. KPIs hardcoded
  
- [ ] Tem operação de campo minimamente sólida?
  - **Resposta**: NÃO. Mobile não funciona
  
- [ ] Parece premium?
  - **Resposta**: NÃO. Parece prototipado

---

## 7. COMPARAÇÃO COM CONCORRÊNCIA (GeoPixel)

| Aspecto | GeoPixel | FlyDea | Winner |
|---------|----------|--------|--------|
| Busca de lote | Instantânea, múltiplos critérios | Inexistente | 🔴 GeoPixel |
| Edição de cadastro | Formulário completo, validações | Não existe | 🔴 GeoPixel |
| Vistoria mobile | Offline, sync, assinatura | Não existe | 🔴 GeoPixel |
| Dashboard | Análise real, drilldown | KPIs mock | 🔴 GeoPixel |
| Integração IPTU | Automática | Não existe | 🔴 GeoPixel |
| Arquitetura | Legado | Modular | 🟢 FlyDea |
| Experiência visual | Datada | Moderna | 🟢 FlyDea |
| Documentação API | Reduzida | Swagger completo | 🟢 FlyDea |

**Veredito**: GeoPixel ganha em tudo que importa (funcionalidade). FlyDea só ganha em "looks" e "arquitetura futura".

---

## 8. MÉTRICAS DE CÓDIGO

### 8.1 Backend
- **47 Controllers**: Ótima modularização
- **Documentação**: 50% (muitos endpoints sem `@ApiOperation`)
- **Testes**: Existem (jest), mas não vistos em full
- **Type Safety**: 100% TypeScript, strict mode
- **Lint**: ESLint configured, max-warnings=0

### 8.2 Frontend  
- **41 Rotas**: Bom coverage de screens
- **TypeScript**: Parcialmente usado (muitos `any`)
- **Componentes**: Design system ok
- **Performance**: 213KB para /app/maps (pesado)
- **Lint**: Next lint enabled

### 8.3 Build & Deploy
- ✅ API compila sem erros
- ✅ Web compila sem erros
- ✅ Docker compose funciona
- ⚠️ Sem deploy pipeline (além de CI)
- ⚠️ Sem staging/prod configs claros

---

## 9. PROBLEMAS ESTRUTURAIS

### P1 - Sem Busca Real (CRÍTICO)
- Usuário não consegue achar um lote rápido
- Não há global search de dados
- Busca só navega entre menus

**Impacto**: Operador não pode usar sistema no dia a dia

### P2 - Sem Edição de Cadastro (CRÍTICO)
- Não há formulário para editar SQLU, inscrição, geometria
- Não há workflow de validação
- Não há histórico de quem editou quando

**Impacto**: Cadastro não pode ser atualizado (função principal)

### P3 - Sem Fluxo de Vistoria/Fiscalização (CRÍTICO)
- Menu existe mas não funciona
- Sem captura de evidências
- Sem assinatura
- Sem offline mobile

**Impacto**: Campo não pode operar

### P4 - Sem Dados Reais
- Dashboard com valores mock
- KPIs hardcoded
- Nenhuma análise real funciona

**Impacto**: Executivo não tem visibilidade

### P5 - Arquitetura de UI Confusa
- 47 módulos diferentes em menu
- Sem hierarquia clara
- Sem wayfinding (onde estou? pra onde vou?)
- Busca global retorna "Nenhum resultado"

**Impacto**: Usuário perdido, churn alto

### P6 - Sem Integração Entre Módulos
- CTM, REURB, PGV, Fiscalização vivem isolados
- Sem relacionamento (lote → imóvel → processo → vistoria)
- Sem ação cruzada

**Impacto**: Fluxo de negócio não é suportado

### P7 - Sem Mobile/Offline
- Menu "Mobile" existe mas não funciona
- Nenhuma operação de campo suportada
- Sem cache local de dados
- Sem sync de mudanças

**Impacto**: Fiscal não consegue trabalhar no campo

### P8 - Sem Trilha de Auditoria Real
- Logging de HTTP sim
- Auditoria de dados não
- Sem registro de quem mudou o quê quando
- Sem compliance LGPD

**Impacto**: Risco legal

---

## 10. ROADMAP MENTAL DO CÓDIGO

```
Pronto para Produção (Hoje):
  ✅ Deploy infrastructure (Docker, CI/CD)
  ✅ Autenticação (JWT)
  ✅ Multi-tenancy base
  ✅ Logging & monitoring
  ✅ API Swagger

Pronto para Demo (Com trabalho):
  ⚠️ Busca de dados
  ⚠️ Edição de cadastro
  ⚠️ Dashboard com dados reais
  ⚠️ Detalhamento de lote

Não Pronto (Muito trabalho):
  ❌ Fluxo de vistoria
  ❌ Mobile/offline
  ❌ Integrações externas
  ❌ Relatórios
  ❌ Portal cidadão
  ❌ Análise geoespacial avançada
```

---

## 11. RECOMENDAÇÕES IMEDIATAS

### Sprint 0 (1-2 semanas) - Stop the Bleeding
1. **Busca de lotes** funcional (por SQLU, inscrição, endereço)
2. **Detalhamento de lote** com todos os dados
3. **Edição de lote** com validação básica
4. **Dashboard real** com dados do MongoDB
5. **Navegação clara**: Reduzir menu de 47 para 10 items críticos

### Sprint 1 (2-3 semanas) - Core Operations
1. Fluxo de vistoria (form dinâmico, geoloc, foto)
2. Edição de geometria (draw + validação)
3. Workflow de aprovação
4. Relatório de lote em PDF

### Sprint 2+ - Escalabilidade
1. Mobile/offline
2. Integrações (IPTU, Protocolo)
3. Análise geoespacial
4. Portal cidadão

---

## CONCLUSÃO

**FlyDea tem uma excelente fundação técnica mas é um protótipo funcional, não um produto**. Precisa de 4-6 sprints de trabalho focado em fluxos reais para ficar B2G ready. O stack está certo, mas a execução de product está longe de competir com GeoPixel.

**Para vencer**: Foco em fazer UM fluxo de ponta a ponta excelente (busca → edição → aprovação → relatório) melhor que GeoPixel. Depois escala.

---

*Fim do RAIO-X Real*
