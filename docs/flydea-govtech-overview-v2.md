# FlyDea GovTech — Visão Geral do Sistema
## Documento Técnico e Comercial | Maio de 2026 | v2.0

---

## PÁGINA 1 — CAPA

**Sistema:** FlyDea GovTech
**Subtítulo:** Plataforma Municipal SaaS de Gestão Territorial, Cadastro Multifinalitário e Serviços Digitais ao Cidadão
**Propósito:** Modernizar a infraestrutura tecnológica municipal integrando o território, a tributação, a fiscalização de campo e os serviços ao cidadão em uma única plataforma auditável e segura.
**Data:** Maio de 2026
**Versão:** v2.0 — Revisão Comercial e Técnica
**Instância ativa:** http://labspaulo.site/ (ambiente de demonstração — tenant: demo)

---

## PÁGINA 2 — SUMÁRIO EXECUTIVO

O **FlyDea GovTech** é uma plataforma SaaS multi-tenant desenvolvida especificamente para prefeituras e autarquias municipais que buscam modernizar sua infraestrutura de gestão territorial, tributária e de serviços ao cidadão.

O núcleo da solução é a integração nativa entre o Cadastro Territorial Multifinalitário (CTM), o sistema de WebGIS operacional e a Planta Genérica de Valores (PGV/IPTU), tendo a parcela/lote como entidade central que conecta todos os fluxos administrativos, tributários, de fiscalização e de licenciamento.

Diferente de ferramentas de BI ou visualizadores cartográficos isolados, o FlyDea funciona como o **eixo central da gestão municipal territorial**, onde cada ação — abertura de vistoria, emissão de alvará, atualização cadastral, tramitação de REURB — é registrada de forma integrada, rastreável e auditável.

**Público-alvo deste documento:**
- Prefeitos e secretários municipais
- Equipes técnicas e de TI de prefeituras
- Gestores de licitações e contratos
- Jurídico e compliance
- Parceiros e investidores estratégicos

**Sumário do Documento:**
1. Problema Municipal — pág. 3
2. Solução — pág. 4
3. Arquitetura Funcional — pág. 5
4. Módulos do Sistema — pág. 6
5. Status Operacional da Plataforma — pág. 7
6. Modelo de Implantação — pág. 8
7. Valor para a Prefeitura — pág. 9
8. Diferenciais Competitivos — pág. 10
9. Demonstração Visual das Telas — págs. 11 a 16
10. Casos de Uso Concretos — pág. 17
11. Próximos Passos — pág. 18

---

## PÁGINA 3 — O PROBLEMA

### Desafios Reais das Prefeituras Brasileiras

As prefeituras brasileiras de médio e pequeno porte enfrentam desafios estruturais comuns que limitam a capacidade de gestão territorial, tributária e de atendimento ao cidadão:

**Fragmentação de dados e controles paralelos**
Dados de imóveis são mantidos em planilhas de diferentes secretarias que divergem entre si. O departamento de tributação, o de obras e o de meio ambiente frequentemente operam bases distintas sem integração.

**Processos manuais e retrabalho operacional**
Emissão de alvarás, certidões e ordens de vistoria ainda dependem de documentos físicos, protocolos em papel e redigitação de dados entre sistemas, gerando atraso e risco de erro humano.

**Baixa rastreabilidade fiscal**
Imóveis ampliados, reformados ou regularizados informalmente continuam sendo tributados pelo cadastro desatualizado, o que compromete a justiça fiscal e reduz a arrecadação de IPTU.

**Fiscalização de campo desconectada**
Fiscais atuam sem integração com o CTM. Relatórios de vistoria chegam ao escritório com dias de atraso e raramente atualizam a base cadastral de forma automática.

**Lentidão no licenciamento de obras**
O tempo médio de tramitação de alvarás de construção pode se estender por semanas ou meses devido à ausência de fluxos digitais integrados entre secretarias.

**Ausência de visibilidade executiva em tempo real**
Gestores e secretários tomam decisões com base em relatórios mensais consolidados manualmente, sem acesso a indicadores operacionais atualizados do município.

---

## PÁGINA 4 — A SOLUÇÃO

### FlyDea GovTech: A Plataforma Territorial da Prefeitura

O FlyDea resolve esses desafios por meio de uma arquitetura integrada que posiciona a parcela/lote como entidade central da gestão municipal.

```
         PORTAL DO CIDADÃO
    (Solicitações, certidões, ouvidoria)
               │
    MÓDULOS DE GESTÃO INTERNA
  (CTM, WebGIS, PGV, Alvarás, REURB,
   Vistorias, Relatórios, Dashboard)
               │
    INFRAESTRUTURA DE SEGURANÇA
  (Multi-tenant, RBAC, LGPD, Auditoria)
```

**Três camadas operacionais integradas:**

1. **Portal do Cidadão** — Acesso público simplificado para solicitações de serviço, consulta de certidões e acompanhamento de processos, sem necessidade de login complexo.

2. **Área Administrativa Interna** — Onde servidores, fiscais, analistas e gestores municipais operam o WebGIS, editam o CTM, tramitam processos de alvará, geram relatórios e acompanham indicadores em tempo real.

3. **Infraestrutura de Conformidade** — Controle granular de acessos por perfil (RBAC), isolamento seguro de dados por município (multi-tenant) e trilha de auditoria compatível com LGPD e exigências dos Tribunais de Contas.

**A parcela como eixo:**
```
       mapa (WebGIS)
            │
tributo ─── parcela ─── vistoria
            │
    relatório / processo / alvará
```

Qualquer atualização em campo, qualquer emissão de certidão, qualquer cálculo de IPTU se reflete automaticamente na ficha da parcela correspondente, garantindo coerência entre todos os módulos.

---

## PÁGINA 5 — ARQUITETURA FUNCIONAL

### Base Tecnológica Municipal-Grade

O FlyDea foi construído sobre uma arquitetura moderna e modular, projetada para atender às exigências de confiabilidade, escalabilidade e segurança do setor público municipal.

**Frontend — Next.js App Router**
Interface web responsiva com carregamento otimizado por módulo e componentes reutilizáveis entre secretarias. Suporta navegação por perfil (RBAC-aware) e renderização de dados cartográficos em alta performance.

**Backend — NestJS Modular**
API REST organizada em módulos independentes por domínio governamental: CTM, GIS, PGV, Alvarás, REURB, Auditoria, Notificações, Relatórios e outros. Cada módulo pode evoluir de forma independente sem risco de regressão nos demais.

**Banco de Dados Orientado ao Território**
Persistência em MongoDB com suporte nativo a geometrias complexas (Polygon, MultiPolygon), conversão de sistemas de coordenadas (UTM 31983 ↔ WGS84), carregamento geoespacial por viewport (BBOX) e cache via Redis.

**WebGIS com Vector Tiles (MVT)**
Motor geográfico baseado em Vector Tiles (Mapbox Vector Tiles) que suporta renderização responsiva de 50.000+ geometrias cadastrais sem degradação de performance no navegador do servidor público.

**Autenticação e Controle de Acesso**
Sessões autenticadas via JWT com expiração configurável, refresh automático e isolamento estrito por tenant. Suporta múltiplos perfis de acesso dentro do mesmo município.

**Isolamento Multi-Tenant**
Arquitetura de isolamento lógico por `X-Tenant-Id` que garante que dados de um município nunca sejam acessíveis por outro tenant no mesmo cluster SaaS. Verificado em testes de integração.

---

## PÁGINA 6 — MÓDULOS DO SISTEMA

### 6.1. Portal do Cidadão
**Objetivo:** Canal digital de acesso público para solicitações e certidões.
**Funcionalidades:** Ouvidoria/156, consulta de débitos, visualização de parcelas no mapa, emissão de certidões simples, acompanhamento de processos por protocolo.
**Benefício:** Reduz a demanda de atendimento presencial e amplia o acesso do munícipe aos serviços municipais 24 horas por dia.

### 6.2. Autenticação e Controle de Acesso (RBAC)
**Objetivo:** Proteger a área administrativa da prefeitura com isolamento por tenant e perfil.
**Funcionalidades:** Login unificado por tenant, perfis de acesso configuráveis (Leitor, Operador, Gestor, Administrador), expiração de sessão e trilha de auditoria de acessos.

### 6.3. Dashboard Administrativo
**Objetivo:** Oferecer visibilidade operacional consolidada para gestores e secretários.
**Funcionalidades:** KPIs de parcelas, vistorias, alvarás e REURB. Painel de indicadores de arrecadação. Mapa analítico de concentração territorial.
**Benefício:** Apoio à tomada de decisão executiva com base em dados reais e atualizados.

### 6.4. Cadastro Territorial Multifinalitário (CTM)
**Objetivo:** Centralizar e manter atualizada a base de parcelas, lotes e logradouros do município.
**Funcionalidades:** Busca avançada por proprietário, inscrição cadastral ou endereço; edição de fichas; vinculação cartográfica; importação de bases via GeoJSON/Shapefile.
**Benefício:** Base única, auditável e integrada, eliminando divergências entre departamentos.

### 6.5. WebGIS — Inteligência Geográfica
**Objetivo:** Representar o território municipal de forma operacional, não apenas visual.
**Funcionalidades:** Visualização de parcelas por camadas, seleção de lotes, overlay de zonas fiscais e de uso do solo, fitBounds automático, suporte a WebGL com fallback explícito.
**Benefício:** Facilita análises territoriais, identificação de inconsistências cadastrais e planejamento urbano.

### 6.6. Vistorias e Fiscalização de Campo
**Objetivo:** Conectar fiscais em campo com a base cadastral da secretaria em tempo real.
**Funcionalidades:** Abertura de ordens de vistoria por lote, checklists de fiscalização, atualização de status, registro de evidências fotográficas, histórico por parcela.
**Benefício:** Fiscalização rastreável, com evidências vinculadas ao histórico do imóvel e integração automática com o CTM.

### 6.7. Regularização Fundiária (REURB)
**Objetivo:** Apoiar a formalização de assentamentos urbanos informais.
**Funcionalidades:** Cadastro de famílias participantes, georreferenciamento de lotes irregulares, fluxo de homologação de certidões fundiárias (CRF), emissão de documentos digitais.
**Benefício:** Inclusão social, segurança jurídica e potencial incremento da base tributária municipal.

### 6.8. Alvarás e Licenciamento de Obras
**Objetivo:** Digitalizar e auditar o processo de emissão de licenças de construção.
**Funcionalidades:** Entrada de solicitações pelo portal, trâmite interno entre secretarias, assinatura digital, geração automática de certidão de alvará com QR Code de validação.
**Benefício:** Pode reduzir significativamente o tempo de tramitação, dependendo do nível de integração e maturidade do município.

### 6.9. PGV/IPTU — Planta Genérica de Valores
**Objetivo:** Apoiar o cálculo e a gestão do IPTU com base em critérios territoriais.
**Funcionalidades:** Engine de cálculo IPTU integrando valor venal de terreno e edificação com alíquotas zonais configuráveis por lei municipal.
**Benefício:** Aumenta a precisão dos lançamentos fiscais e apoia a identificação de inconsistências cadastrais que afetam a arrecadação.

### 6.10. Relatórios e Exportações
**Objetivo:** Permitir extrações e auditorias operacionais completas.
**Funcionalidades:** Relatórios filtráveis por zoneamento, status ou tipo; exportação em PDF e planilha; histórico de emissões auditável.
**Benefício:** Transparência operacional e subsídio para prestação de contas a órgãos de controle.

---

## PÁGINA 7 — STATUS OPERACIONAL DA PLATAFORMA

### O que o sistema entrega hoje, o que está em evolução e o que depende de integração

Esta seção apresenta o estado atual de maturidade operacional da plataforma com transparência técnica, separando o que já pode ser demonstrado de forma completa do que depende de dados ou integrações municipais específicas.

---

**✅ DEMONSTRÁVEIS HOJE (ambiente de demonstração ativo)**

| Funcionalidade | Status | Observação |
|---|---|---|
| Portal do Cidadão | Demonstrável | Interface funcional com dados de demonstração |
| Login multi-tenant | Demonstrável | Isolamento por tenant verificado |
| Dashboard com KPIs | Demonstrável | Com dados de demonstração |
| WebGIS com parcelas reais | Demonstrável | 300+ lotes GeoSampa (SP) importados |
| CTM — busca e edição de parcelas | Demonstrável | Fluxo completo UI → API → BD |
| Vistorias — abertura e tramitação | Demonstrável | Fluxo completo com checklist |
| REURB — cadastro e fluxo | Demonstrável | Fluxo de homologação operacional |
| Alvarás — entrada e tramitação | Demonstrável | Com assinatura digital implementada |
| Relatórios e exportações | Demonstrável | PDF e planilha por filtro |
| RBAC — controle de perfis | Demonstrável | 5 perfis configurados e testados |

---

**🔄 EM EVOLUÇÃO (funcional, em amadurecimento)**

| Funcionalidade | Status | O que falta |
|---|---|---|
| Engine IPTU/PGV | Parcial | Integração com lei municipal específica do cliente |
| Dashboard — gráficos interativos | Em desenvolvimento | Visualizações analíticas avançadas |
| App móvel offline para fiscais | Planejado | Sincronização robusta sem conexão |
| Importação de Shapefile (.shp) | Planejado | Suporte direto a formatos de SIG tradicionais |

---

**🔗 DEPENDENTES DE INTEGRAÇÃO COM BASES MUNICIPAIS**

| Funcionalidade | Dependência |
|---|---|
| Cálculo IPTU com lei local | Lei de planta de valores e alíquotas do município |
| Importação da base cadastral | Base GIS, CTM ou CadUnico do município |
| Assinatura ICP-Brasil | Certificados digitais dos servidores autorizados |
| Integração com 156 nacional | API da plataforma de ouvidoria do município |
| Integração com sistemas legados | Mapeamento de APIs ou exportações do sistema atual |

---

**📅 ROADMAP SUGERIDO (próxima fase)**

- PWA/App nativo para fiscais de campo com sincronização offline
- Assinatura de certidões com padrão ICP-Brasil
- Módulo de detecção de inconsistências territoriais por cruzamento de dados
- Painel de arrecadação integrado com pagamento digital (PIX, boleto)
- Onboarding automatizado de novos tenants/prefeituras

---

## PÁGINA 8 — MODELO DE IMPLANTAÇÃO

### Jornada de Implantação em 6 Fases

O FlyDea segue um modelo de implantação faseado e assistido, adaptado à realidade de cada município. Nenhuma fase é pulada — a sequência garante que o sistema entre em produção com dados reais, equipe treinada e fluxos validados.

---

**Fase 1 — Diagnóstico Municipal e Levantamento de Bases**
*Estimativa: 2 a 4 semanas*

- Mapeamento dos sistemas e bases de dados existentes (CTM, IPTU, GIS, 156)
- Identificação dos perfis de usuários e secretarias envolvidas
- Levantamento dos requisitos de integração com sistemas legados
- Definição de escopo inicial e prioridades de implantação

---

**Fase 2 — Importação e Saneamento de Dados**
*Estimativa: 3 a 6 semanas (varia conforme qualidade da base)*

- Importação da base cadastral do município (GeoJSON, Shapefile, planilha)
- Limpeza e normalização dos dados de parcelas e logradouros
- Validação geoespacial: projeção CRS, geometrias, sobreposições
- Carga inicial de lotes no WebGIS com verificação de cobertura territorial

---

**Fase 3 — Parametrização do Tenant Municipal**
*Estimativa: 1 a 2 semanas*

- Configuração do ambiente exclusivo do município (tenant isolado)
- Parametrização da Planta Genérica de Valores e alíquotas de IPTU
- Configuração de perfis, secretarias e fluxos de aprovação
- Customização visual (brasão, nome do município, cores institucionais)

---

**Fase 4 — Treinamento de Servidores e Fiscais**
*Estimativa: 1 a 2 semanas*

- Capacitação de servidores administrativos no uso do CTM e relatórios
- Treinamento de fiscais de campo no fluxo de vistorias e ordens de serviço
- Workshop para gestores e secretários nos painéis executivos e dashboards
- Documentação e materiais de suporte internos

---

**Fase 5 — Operação Assistida**
*Estimativa: 4 a 8 semanas*

- Entrada em produção com acompanhamento técnico dedicado
- Monitoramento de fluxos críticos (alvarás, IPTU, vistorias)
- Correções rápidas de ajustes operacionais identificados em campo
- Relatórios semanais de adoção e performance

---

**Fase 6 — Evolução, Integrações e Suporte Contínuo**
*Continuidade*

- Integração progressiva com sistemas legados e plataformas externas
- Ativação de novos módulos conforme demanda (REURB, app móvel, relatórios avançados)
- Suporte técnico contínuo com SLA definido em contrato
- Atualizações de versão e melhorias contínuas de produto

---

## PÁGINA 9 — VALOR PARA A PREFEITURA

### Por que o FlyDea importa para cada ator municipal

---

**Para o Prefeito e Secretários**
- Painel executivo com KPIs territoriais, fiscais e operacionais atualizados
- Reduz decisões baseadas em feeling: substitui relatórios manuais por dados em tempo real
- Aumenta a rastreabilidade da arrecadação de IPTU por meio do cruzamento entre vistoria e cadastro
- Apoia processos de conformidade, auditoria e prestação de contas ao TCE e CGU
- Posiciona o município como referência em modernização administrativa

---

**Para Servidores Públicos (Analistas e Engenheiros Municipais)**
- Elimina a redigitação de dados entre sistemas e secretarias
- Reduz retrabalho operacional com fluxos digitais integrados
- Histórico completo e auditável de cada alteração cadastral protege o servidor em eventuais contestações
- Aprovação de processos territoriais com tramitação integrada entre departamentos

---

**Para Fiscais de Campo**
- Ordens de vistoria recebidas diretamente no dispositivo, vinculadas ao lote
- Registro de checklists e fotos em campo, sincronizado imediatamente com o CTM
- Rastreabilidade completa das vistorias realizadas por fiscal, data e resultado
- Reduz deslocamentos desnecessários com informações do lote disponíveis antes da visita

---

**Para Cidadãos e Construtores**
- Portal de serviços acessível 24 horas por dia, sem necessidade de fila presencial
- Consulta de certidões, débitos e processos por protocolo, de qualquer dispositivo
- Acompanhamento do status de alvarás e solicitações de forma transparente e documentada
- Resposta mais ágil às solicitações, com prazos rastreáveis

---

**Para Arrecadação e Governança**
- Identificação de inconsistências cadastrais que afetam o lançamento correto do IPTU
- Base cadastral atualizada por cruzamento entre vistorias e dados do CTM
- Geração de relatórios de arrecadação e inadimplência com filtros territoriais
- Suporte a auditorias externas com trilha de ações rastreável e exportável

---

## PÁGINA 10 — DIFERENCIAIS COMPETITIVOS

### O que diferencia o FlyDea de outras soluções no mercado GovTech

---

**1. CTM Integrado ao WebGIS Operacional**
A maioria dos sistemas municipais trata o mapa como visualização decorativa. No FlyDea, o WebGIS é operacional: cada parcela no mapa abre sua ficha cadastral, vincula vistorias, tributos e processos. O mapa é o ponto de entrada, não um anexo.

---

**2. SaaS Multi-Tenant com Isolamento por Município**
Cada prefeitura opera em um ambiente completamente isolado, sem possibilidade de vazamento de dados entre tenants. A mesma infraestrutura serve múltiplos municípios com custo de operação significativamente menor do que soluções on-premise.

---

**3. Portal do Cidadão Integrado ao Back-Office**
O portal público não é um sistema separado. Solicitações abertas pelo cidadão criam processos reais no sistema interno, tramitam pelas secretarias e retornam status ao munícipe de forma automática.

---

**4. Fluxos Digitais de Fiscalização e Licenciamento**
O fluxo de alvará, vistoria e REURB foi desenhado para funcionar de ponta a ponta dentro do sistema, eliminando etapas manuais. Cada transição de status é registrada, auditável e vinculada ao lote correspondente.

---

**5. Base Territorial como Eixo Central da Gestão**
O lote/parcela é a entidade central de todos os módulos. Isso garante coesão de dados entre obras, fiscalização, tributação e regularização — algo que sistemas departamentais isolados não conseguem oferecer.

---

**6. Auditoria e Rastreabilidade Nativas**
Toda ação de escrita no sistema gera um registro auditável: quem alterou, quando, o quê e em qual tenant. Isso atende às exigências de conformidade LGPD e facilita prestação de contas.

---

**7. Evolução por Módulos sem Reimplantação**
O design modular permite que novos módulos sejam ativados progressivamente sem necessidade de reimplantar o sistema. A prefeitura começa pelo CTM e WebGIS, e expande para REURB, licenciamento e relatórios avançados conforme a maturidade operacional.

---

**8. Preparado para Integração com Sistemas Legados e Externos**
API REST documentada com OpenAPI/Swagger, suporte a importação GeoJSON/Shapefile e estrutura de webhooks facilitam a integração com sistemas existentes na prefeitura, evitando ruptura operacional.

---

## PÁGINAS 11 A 16 — DEMONSTRAÇÃO VISUAL DAS TELAS

*(Capturas de tela do sistema em funcionamento no ambiente de demonstração ativo — http://labspaulo.site/)*

---

### Tela 1 — Portal do Cidadão
**Título:** Canal Digital de Serviços Municipais
**Legenda:** Interface pública acessível sem login, onde o munícipe solicita serviços, consulta certidões e acompanha processos.
**Benefício prático:** Reduz a demanda no atendimento presencial e amplia o acesso a serviços municipais.
**Usuário principal:** Cidadão / Munícipe

---

### Tela 2 — Login Multi-Tenant
**Título:** Acesso Seguro por Prefeitura
**Legenda:** Autenticação com isolamento por tenant. Cada município possui credenciais e ambiente exclusivos.
**Benefício prático:** Garante que apenas servidores autorizados acessem os dados estratégicos do município.
**Usuário principal:** Todos os servidores internos

---

### Tela 3 — Dashboard Administrativo
**Título:** Visão Executiva do Município
**Legenda:** Painel com KPIs de parcelas, vistorias, alvarás e REURB. Base para tomada de decisão executiva.
**Benefício prático:** Substitui relatórios manuais por indicadores em tempo real, acessíveis a secretários e prefeito.
**Usuário principal:** Gestor / Secretário / Prefeito

---

### Tela 4 — WebGIS / Inteligência Geográfica
**Título:** Mapa Operacional das Parcelas Municipais
**Legenda:** Visualizador cartográfico com 300+ lotes reais importados (GeoSampa), suporte CRS UTM, seleção por lote e análise geoespacial por viewport.
**Benefício prático:** Identifica inconsistências territoriais, apoia o planejamento urbano e conecta o mapa à base cadastral.
**Usuário principal:** Analista técnico / Gestor territorial

---

### Tela 5 — CTM — Tabela de Parcelas
**Título:** Cadastro Territorial Multifinalitário
**Legenda:** Tabela central com busca avançada, filtros por zoneamento e acesso direto à ficha de cada parcela.
**Benefício prático:** Base única e auditável de todos os lotes do município, acessível por todas as secretarias envolvidas.
**Usuário principal:** Servidor / Analista / Fiscal

---

### Tela 6 — Detalhe da Parcela
**Título:** Ficha Unificada do Lote
**Legenda:** Ficha completa com dados cadastrais, localização no mapa, histórico de vistorias, tributos e processos vinculados.
**Benefício prático:** Concentra toda a informação sobre um imóvel em uma única tela, eliminando consultas entre sistemas.
**Usuário principal:** Servidor / Analista / Gestor

---

### Tela 7 — Módulo de Vistorias
**Título:** Ordens de Fiscalização de Campo
**Legenda:** Listagem de vistorias abertas por lote, com status, data, fiscal responsável e resultado registrado.
**Benefício prático:** Fiscalização rastreável, integrada ao CTM e com histórico por imóvel.
**Usuário principal:** Fiscal de campo / Analista interno

---

### Tela 8 — Logradouros
**Título:** Cadastro de Vias Públicas
**Legenda:** Registro e gestão de logradouros, vinculados às parcelas para consistência do endereçamento municipal.
**Benefício prático:** Base de endereçamento única, sem divergências entre secretarias.
**Usuário principal:** Servidor / Analista do CTM

---

### Tela 9 — REURB
**Título:** Regularização Fundiária Urbana
**Legenda:** Fluxo de cadastro de famílias, georreferenciamento de lotes e emissão de certidões fundiárias (CRF).
**Benefício prático:** Apoia a formalização de assentamentos informais com rastreabilidade documental completa.
**Usuário principal:** Servidor / Gestor de habitação

---

### Tela 10 — Alvarás e Licenciamento
**Título:** Gestão Digital de Licenças de Obras
**Legenda:** Fluxo de entrada de projetos, tramitação interna, parecer técnico e emissão de alvará com assinatura digital.
**Benefício prático:** Pode reduzir o tempo de tramitação de alvarás, dependendo do nível de integração e maturidade operacional do município.
**Usuário principal:** Cidadão / Construtor / Analista de obras

---

### Tela 11 — Relatórios e Exportações
**Título:** Central de Relatórios Oficiais
**Legenda:** Geração de relatórios filtráveis em PDF e planilha, com histórico auditável de emissões.
**Benefício prático:** Transparência operacional e suporte à prestação de contas para órgãos de controle.
**Usuário principal:** Gestor / Auditor / Equipe técnica

---

## PÁGINA 17 — CASOS DE USO CONCRETOS

### Caso de Uso 1 — Atualização Fiscal por Cruzamento de Vistoria e CTM

1. O WebGIS identifica, via análise territorial, um lote cadastrado como terreno baldio com indícios de edificação.
2. O analista do CTM abre uma ordem de vistoria técnica vinculada ao lote.
3. O fiscal recebe a ordem em campo, confirma a construção existente, registra as dimensões e annexa fotos georreferenciadas.
4. O sistema atualiza a ficha do lote no CTM com os novos dados.
5. O engine de IPTU recalcula o valor venal com base na Planta Genérica de Valores configurada, corrigindo o lançamento fiscal de forma rastreável e auditável.

**Resultado esperado:** Redução de inconsistências cadastrais com impacto positivo na arrecadação de IPTU, a ser validado em diagnóstico municipal específico.

---

### Caso de Uso 2 — Desburocratização do Alvará de Construção

1. Um construtor acessa o Portal do Cidadão e solicita um Alvará de Construção, preenchendo os dados do lote e anexando o projeto arquitetônico digital.
2. O sistema valida automaticamente se o lote existe no CTM e se está em zona de uso compatível.
3. O analista de obras revisa o processo no painel interno, registra o parecer técnico e agenda a vistoria de conformidade.
4. O fiscal realiza a vistoria e registra o resultado diretamente no sistema.
5. Com o parecer aprovado, o sistema gera automaticamente a certidão de Alvará de Construção com assinatura digital e QR Code de validação.
6. O construtor recebe o documento disponível para download diretamente no portal.

**Resultado esperado:** Tramitação completamente digital, com rastreabilidade de cada etapa e redução do tempo de espera dependente do volume de demanda e da configuração dos fluxos de cada secretaria.

---

### Caso de Uso 3 — Relatório de Inadimplência por Zona Fiscal

1. O gestor de arrecadação acessa o módulo de relatórios.
2. Filtra por zona fiscal, período e status de pagamento de IPTU.
3. O sistema gera relatório em PDF com listagem de imóveis inadimplentes, valor em aberto e localização no mapa.
4. O documento é exportado e encaminhado para o departamento jurídico para cobrança administrativa.

**Resultado esperado:** Visibilidade da inadimplência por território, com base para ações de regularização fiscal direcionadas.

---

## PÁGINA 18 — PRÓXIMOS PASSOS

### Como avançar com o FlyDea no seu município

O FlyDea está disponível para demonstração guiada e para início de um processo estruturado de avaliação técnica e comercial. Propomos a seguinte jornada de engajamento:

---

**1. Demonstração Guiada**
Apresentação ao vivo do sistema em funcionamento, com foco nos módulos prioritários para o município. Formato: 60 a 90 minutos, presencial ou remoto.
Acesso imediato: http://labspaulo.site/ (tenant: demo / credenciais a combinar)

---

**2. Levantamento de Dados do Município**
Reunião técnica com a equipe da prefeitura para mapear bases existentes, sistemas em uso, volume de parcelas e prioridades de implantação. Sem compromisso.

---

**3. Prova de Conceito**
Implantação do sistema com dados reais do município em ambiente controlado, para validação técnica dos fluxos prioritários (CTM, WebGIS, vistorias). Prazo estimado: 4 a 6 semanas.

---

**4. Proposta Técnica e Comercial**
Com base no diagnóstico e na prova de conceito, elaboração de proposta formal com escopo de implantação, prazos, níveis de serviço (SLA) e condições comerciais para formalização contratual.

---

**5. Planejamento de Implantação**
Desenvolvimento do plano detalhado de implantação em 6 fases, com cronograma, responsáveis, critérios de aceite e plano de treinamento adaptado à realidade da prefeitura.

---

**Contato:**

Paulo — Engenharia e DevOps
FlyDea GovTech | Catanduva - SP
Demo: http://labspaulo.site/
Documento: v2.0 | Maio de 2026

---

## CHECKLIST DE AJUSTES ANTES DE ENVIAR PARA PARCEIROS

Antes de enviar este documento para prefeitos, secretários, equipes de licitação ou parceiros comerciais, verifique:

**Conteúdo e Dados:**
- [ ] Substituir referências ao "tenant demo" pelas credenciais corretas para o público-alvo
- [ ] Confirmar se a URL de demonstração (labspaulo.site) estará ativa durante o período de apresentação
- [ ] Validar se os dados de contato estão corretos e atualizados
- [ ] Revisar se existem dados ou números específicos que precisam de validação antes de publicar
- [ ] Remover ou adaptar referências internas ao processo de desenvolvimento ("Municipal-Grade v1.10.0") para linguagem comercial adequada

**Formatação e Apresentação:**
- [ ] Verificar se todos os prints de tela estão nítidos e representam o estado atual do sistema
- [ ] Confirmar que o WebGIS exibe parcelas reais e não tela vazia
- [ ] Validar que a numeração de páginas no sumário está correta
- [ ] Conferir se todos os títulos das seções estão sem palavras grudadas ou com espaçamento incorreto
- [ ] Verificar se não há asteriscos ou marcações Markdown visíveis no PDF final

**Tom e Linguagem:**
- [ ] Revisar afirmações absolutas ("reduz 90%", "controle total", "conformidade garantida") e substituir por linguagem defensável
- [ ] Confirmar que todos os números citados têm base comprovável ou foram qualificados como "estimado", "potencial" ou "a ser validado"
- [ ] Revisar se o tom está adequado para o público específico do envio (técnico vs. executivo vs. jurídico)

**Jurídico e Compliance:**
- [ ] Não incluir nomes de clientes, contratos ou municípios sem autorização expressa
- [ ] Verificar se referências a "conformidade LGPD", "pronto para licitações" estão adequadamente qualificadas
- [ ] Confirmar que o documento não faz promessas contratuais implícitas

**Versão e Controle:**
- [ ] Atualizar a data do documento para a data real de envio
- [ ] Incluir número de versão no rodapé
- [ ] Arquivar versão anterior antes de substituir
