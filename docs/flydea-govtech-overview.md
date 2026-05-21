# FlyDea GovTech: Plataforma de Gestão Pública Municipal

## 1. Capa

*   **Sistema:** FlyDea GovTech
*   **Subtítulo:** Plataforma Unificada de Gestão Territorial, Cadastro Multifinalitário e Inteligência Urbana
*   **Propósito:** Digitalizar a gestão municipal através da união indissociável entre o território, a justiça fiscal e a desburocratização de processos para servidores e cidadãos.
*   **Data de Geração:** 21 de Maio de 2026
*   **Versão do Documento:** v1.10.0 (Fase: Municipal-Grade Competitivo)
*   **Instância Ativa em Produção (Live Demo):** [http://labspaulo.site/](http://labspaulo.site/)

---

## 2. Resumo Executivo

O **FlyDea GovTech** é uma plataforma SaaS multi-tenant desenvolvida especificamente para prefeituras e autarquias municipais que buscam modernizar sua infraestrutura tecnológica e operacional. O coração do sistema reside no Cadastro Territorial Multifinalitário (CTM) integrado com o WebGIS e a Planta Genérica de Valores (PGV), oferecendo uma base cartográfica dinâmica que conecta a parcela territorial (o lote) a todos os fluxos administrativos, tributários, de fiscalização de campo e de licenciamento de obras do município.

Diferente de sistemas de BI isolados ou de visualizadores de mapas puramente cosméticos, o FlyDea atua como o **grafo único da verdade municipal**. Cada ação executada na plataforma — seja a abertura de uma ordem de vistoria por um fiscal no celular, a emissão automática de uma certidão de alvará de obras no portal do cidadão ou o recálculo do IPTU a partir da Planta Genérica de Valores — é processada de forma integrada, auditável e instantaneamente sincronizada com a parcela territorial afetada. 

Isso resulta em um ganho drástico de eficiência operacional para o servidor público, arrecadação mais justa para a prefeitura e um atendimento transparente, ágil e desburocratizado para o cidadão.

---

## 3. Visão Geral da Solução

O ecossistema FlyDea foi desenhado para cobrir de forma homogênea três frentes de atuação de uma prefeitura:

```
    ┌────────────────────────────────────────────────────────┐
    │                     PORTAL DO CIDADÃO                  │
    │  (Solicitações, 156, Consulta de Débitos e Certidões)  │
    └───────────────────────────┬────────────────────────────┘
                                │
    ┌───────────────────────────▼────────────────────────────┐
    │                MÓDULOS DE GESTÃO INTERNA               │
    │    (CTM, WebGIS, PGV, REURB, Fiscalização, Alvarás)    │
    └───────────────────────────┬────────────────────────────┘
                                │
    ┌───────────────────────────▼────────────────────────────┐
    │           AUDITORIA, COMPLIANCE & SEGURANÇA            │
    │         (Multi-tenant Seguro, RBAC, LGPD Logs)         │
    └────────────────────────────────────────────────────────┘
```

1.  **Portal do Cidadão (Public Portal):** Porta de entrada digital e transparente sem necessidade de login complexo, onde o munícipe consulta dados territoriais básicos, abre chamados de ouvidoria/156 e emite certidões oficiais.
2.  **Área Administrativa Autenticada:** Onde o corpo técnico municipal (gestores, fiscais, analistas e administradores) opera as ferramentas de inteligência territorial (WebGIS), edita dados do CTM, transiciona status de processos de alvará, simula valuations de PGV e emite relatórios analíticos.
3.  **Controle de Permissões (RBAC) & Segurança:** Estrutura robusta que isola os dados por prefeitura (multi-tenant) e gerencia perfis de acesso (Leitor, Operador, Gestor, Administrador) de forma granular para resguardar a integridade das ações governamentais e atender à Lei Geral de Proteção de Dados (LGPD).

---

## 4. Problemas que o Sistema Resolve

As prefeituras brasileiras enfrentam desafios sistêmicos decorrentes da falta de integração de seus departamentos. O FlyDea resolve diretamente os seguintes gargalos:

*   **Processos Manuais e Retrabalho:** Elimina o fluxo de papéis físicos e a redigitação de fichas cadastrais entre o departamento de obras e o cadastro tributário.
*   **Dados Fragmentados (Controles Paralelos):** Combate a dependência de planilhas de Excel paralelas substituindo-as por um único banco de dados territorial e tributário.
*   **Falta de Visibilidade Operacional:** Gestores passam a acompanhar o andamento de vistorias em campo e a arrecadação de IPTU por meio de indicadores atualizados em tempo real, em vez de relatórios mensais consolidados manualmente.
*   **Baixa Padronização e Lentidão:** O tempo médio de emissão de certidões e alvarás é reduzido de semanas para minutos através do motor de geração automática e validação digital do sistema.
*   **Injustiça Fiscal por Desatualização:** O sistema resolve a perda de arrecadação causada por imóveis ampliados em campo mas cadastrados como lotes vazios, cruzando dados de vistorias com a Planta de Valores Imobiliários.

---

## 5. Arquitetura Funcional do Sistema

A engenharia do FlyDea foi concebida sob os mais rigorosos padrões de confiabilidade do setor GovTech (`Municipal-Grade`), dividindo-se em:

*   **Frontend (Next.js App Router):** Interface web moderna baseada em componentes reusáveis e responsivos, carregamento otimizado de pacotes de dados cartográficos e tratamento resiliente de erros na UI.
*   **Backend (NestJS Modular):** API REST robusta e organizada em módulos independentes por domínio governamental (CTM, GIS, PGV, Alvarás, Reurb, Auditoria).
*   **Autenticação e RBAC (Role-Based Access Control):** Controle rigoroso de sessões persistidas em `sessionStorage` e `localStorage` no cliente, validadas dinamicamente no backend através de tokens JWT robustos.
*   **Banco de Dados Orientado ao Território:** Persistência escalável no MongoDB e cache via Redis, com modelagem de dados que suporta de forma nativa polígonos complexos, conversão CRS de UTM para WGS84 e carregamento geoespacial otimizado por viewport (BBOX).
*   **Camada Multi-Tenant:** Arquitetura de isolamento lógico em nível de dados (`X-Tenant-Id`) que impede vazamento de informações confidenciais ou cadastrais entre diferentes municípios de um mesmo cluster SaaS.

---

## 6. Módulos do Sistema

### 6.1. Portal do Cidadão
*   **Objetivo:** Permitir ao munícipe abrir solicitações de serviço e emitir documentos simples.
*   **Principais Funcionalidades:** Ouvidoria 156, consulta pública de validade de alvarás de obras e visualização do mapa municipal simplificado.
*   **Fluxo de Uso:** O cidadão acessa o portal municipal, escolhe o serviço (ex: denunciar buraco na via), desenha a localização aproximada no mapa, anexa fotos e recebe um código de acompanhamento.
*   **Benefício Prático:** Redução drástica das filas presenciais no atendimento presencial da prefeitura.

### 6.2. Login e Autenticação
*   **Objetivo:** Proteger a área de trabalho corporativa interna da prefeitura.
*   **Principais Funcionalidades:** Login unificado com restrição de Tenant, recuperação de senhas por e-mail institucional e expiração dinâmica de sessão.
*   **Fluxo de Uso:** O servidor público insere suas credenciais de acesso (`admin@demo.local`), o tenant correspondente (`demo`) e acessa o ecossistema seguro.
*   **Benefício Prático:** Garantia de que apenas servidores credenciados operem os dados estratégicos do município.

### 6.3. Dashboard Administrativo
*   **Objetivo:** Oferecer aos gestores e secretários municipais a saúde do município em tempo real.
*   **Principais Funcionalidades:** Cards consolidados com KPIs (Total de parcelas, vistorias em andamento, alvarás concedidos, REURB homologadas), gráficos de arrecadação do IPTU e painel de acompanhamento geográfico.
*   **Benefício Prático:** Tomada de decisão executiva rápida baseada em dados reais e atualizados do município.

### 6.4. Cadastro Territorial Multifinalitário (CTM) - Parcelas e Logradouros
*   **Objetivo:** Centralizar a base cartográfica e cadastral dos lotes e vias do município.
*   **Principais Funcionalidades:** Listagem e filtros avançados de busca por proprietário, endereço ou inscrição cadastral; edição de fichas cadastrais; vinculação cartográfica.
*   **O Eixo da Parcela:** Conecta os atributos tributários (IPTU/PGV) com as características físicas reais capturadas nas vistorias de campo.
*   **Benefício Prático:** Base de dados atualizada, fidedigna e livre de duplicidades operacionais.

### 6.5. Módulo de Vistorias (Field/Inspect Workflows)
*   **Objetivo:** Gerenciar as inspeções urbanas, fiscais e ambientais realizadas pelos servidores públicos em campo.
*   **Principais Funcionalidades:** Emissão de ordens de vistoria vinculadas a um lote específico, preenchimento de checklists de fiscalização de obras e atualização de status em tempo real.
*   **Benefício Prático:** Fiscalização ágil, rastreável e integrada, gerando evidências físicas vinculadas diretamente ao histórico de cada lote do município.

### 6.6. Módulo de Regularização Fundiária (REURB)
*   **Objetivo:** Formalizar assentamentos urbanos informais em bairros consolidados.
*   **Principais Funcionalidades:** Cadastro de famílias participantes, georreferenciamento de lotes irregulares e fluxo digital de homologação de certidões fundiárias (CRF).
*   **Benefício Prático:** Inclusão social, segurança jurídica para o munícipe e incremento da base fiscal do município.

### 6.7. Módulo de Alvarás e Licenciamento (Aprovações)
*   **Objetivo:** Automatizar e auditar a emissão de licenças de obras e habitação.
*   **Principais Funcionalidades:** Entrada de projetos arquitetônicos, trâmite de aprovação interna, assinatura digital e geração automática de PDFs oficiais e certificados de aprovação.
*   **Benefício Prático:** Estímulo à economia local reduzindo o tempo de aprovação de empreendimentos imobiliários e comerciais no município.

### 6.8. Tributação (IPTU e Planta Genérica de Valores)
*   **Objetivo:** Otimizar e calcular os lançamentos fiscais com base nas normas jurídicas locais.
*   **Principais Funcionalidades:** Engine de cálculo de IPTU automático integrando valor venal de terreno e edificação (PGV) multiplicado por alíquotas zonais.
*   **Benefício Prático:** Distribuição de impostos mais justa e erradicação de distorções cadastrais crônicas.

### 6.9. Módulo de Relatórios (Reports)
*   **Objetivo:** Permitir extrações consolidadas e auditorias operacionais completas.
*   **Principais Funcionalidades:** Exportação de planilhas cadastrais filtradas por zoneamento ou status e relatórios em PDF formatados prontos para assinatura e arquivamento oficial.
*   **Benefício Prático:** Transparência pública total e conformidade com órgãos de controle (Tribunais de Contas).

---

## 7. Jornada do Usuário (Fluxo Operacional Unificado)

A jornada integrada do ecossistema FlyDea demonstra a robustez do fluxo unificado municipal:

```
 CIDADÃO            FISCAL              ANALISTA INTERNO      GESTOR / PREFEITO
 ┌─────┐            ┌────┐              ┌──────────────┐      ┌───────────────┐
 │Acessa portal e   │    │              │              │      │               │
 │solicita alvará   │    │              │              │      │               │
 └───┬─┘            │    │              │              │      │               │
     │              │    │              │              │      │               │
     ▼              │    │              │              │      │               │
 ┌─────────────┐    │    │              │              │      │               │
 │Processo é   ├────┼────┼─────────────►│Analisa o     │      │               │
 │gerado no CTM│    │    │              │projeto e a   │      │               │
 └─────────────┘    │    │              │viabilidade   │      │               │
                    │    │              └──────┬───────┘      │               │
                    │    │                     │              │               │
                    ▼                    ▼              │               │
             ┌─────────────┐            ┌──────────────┐      │               │
             │Fiscal vai   │◄───────────┤Abre ordem de │      │               │
             │ao campo em  │            │vistoria no   │      │               │
             │fiscalização │            │lote          │      │               │
             └──────┬──────┘            └──────────────┘      │               │
                    │                                         │               │
                    ▼                                         ▼               │
             ┌─────────────┐                                  ┌───────────────┐
             │Registra a   ├─────────────────────────────────►│Acompanha      │
             │vistoria     │                                  │indicadores de │
             │finalizada   │                                  │produtividade e│
             └─────────────┘                                  │arrecadação no │
                                                              │Dashboard      │
                                                              └───────────────┘
```

1.  **Cidadão:** Acessa o portal público municipal, consulta sua parcela no WebGIS e envia uma solicitação digital de licença residencial.
2.  **Analista Interno:** Recebe a solicitação no módulo de aprovações, revisa a documentação digital e agenda uma vistoria técnica no lote correspondente.
3.  **Fiscal de Campo:** Recebe a notificação de vistoria diretamente em seu painel operacional móvel, vai a campo, valida os dados cadastrais, anexa as fotos da edificação e finaliza a vistoria em tempo real.
4.  **Analista Interno:** O resultado da vistoria reflete imediatamente no CTM. O analista homologa o processo de Alvará e o sistema gera automaticamente a Certidão digitalizada de Alvará de Construção.
5.  **Gestor / Prefeito:** No Dashboard Executivo, acompanha os tempos médios de resposta das secretarias municipais, o aumento na arrecadação fiscal devido à regularização cadastral e o andamento geral das frentes territoriais do município.

---

## 8. Perfis de Usuário e Permissões (RBAC)

O controle de acesso baseado em perfis (RBAC) garante a integridade dos dados municipais de acordo com a responsabilidade de cada servidor:

*   **Administrador Municipal:** Acesso completo a todas as telas, parametrizações tributárias (Planta Genérica de Valores), criação e exclusão de contas de usuários e trilhas completas de auditoria legal LGPD.
*   **Gestor Municipal / Secretário:** Permissões focadas na visualização de relatórios analíticos, simulação de valuations PGV e acompanhamento estratégico de dashboards operacionais.
*   **Operador Técnico / Fiscal:** Acesso direto às telas de edição cadastral do CTM, abertura e finalização de vistorias técnicas e movimentação de processos administrativos.
*   **Leitor Técnico / Auditor:** Acesso de visualização restrita para consulta a parcelas, mapas e vistorias sem capacidade de alteração de dados no banco de dados.
*   **Cidadão (Portal Público):** Visualização pública restrita e consulta simples de parcelas e certidões emitidas sem possibilidade de visualizar dados confidenciais de proprietários.

---

## 9. Demonstração Visual das Telas

*(As capturas de tela a seguir representam interfaces reais do sistema em pleno funcionamento no ambiente de produção ativo no município através da URL unificada: http://labspaulo.site/)*

### 9.1. Portal do Cidadão (Ouvidoria & Consulta Pública)
![Portal do Cidadão](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/01_portal_publico.png)
*Legenda: Interface pública municipal simplificada e acessível, onde o cidadão tem acesso aos canais digitais de ouvidoria 156 e consultas cadastrais básicas.*

### 9.2. Painel de Login Unificado (Autenticação Multi-Tenant)
![Login Unificado](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/02_login.png)
*Legenda: Acesso restrito para servidores públicos municipais com isolamento de tenant de segurança padrão.*

### 9.3. Dashboard Administrativo Principal (Visão Executiva)
![Dashboard Administrativo](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/03_dashboard.png)
*Legenda: Painel executivo integrado, exibindo KPIs territoriais cruciais para o monitoramento estratégico do município pelos secretários e prefeitos.*

### 9.4. Inteligência Geográfica WebGIS
![Inteligência Geográfica WebGIS](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/04_webgis.png)
*Legenda: Visualizador cartográfico de parcelas e lotes com tratamento CRS padrão UTM, permitindo análises geoespaciais em tempo real e fitBounds responsivo.*

### 9.5. Cadastro Técnico Multifinalitário (CTM - Parcelas)
![Cadastro Territorial Multifinalitário](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/05_ctm_parcelas.png)
*Legenda: Tabela centralizada de consulta, busca e filtros operacionais avançados das parcelas fiscais do município.*

### 9.6. Grafo e Detalhes da Parcela Cadastral
![Detalhes da Parcela Cadastral](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/06_detalhe_parcela.png)
*Legenda: A ficha unificada da parcela no CTM, exibindo os dados de proprietário, localização geográfica interativa e links dinâmicos de auditoria, tributos e vistorias vinculadas.*

### 9.7. Módulo de Vistorias e Ordens de Fiscalização
![Ordens de Vistoria](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/07_vistorias.png)
*Legenda: Rastreamento operacional completo das vistorias técnicas abertas e checklists preenchidos em campo.*

### 9.8. Cadastro e Histórico de Logradouros
![Cadastro de Logradouros](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/08_logradouros.png)
*Legenda: Registro e organização cartográfica e cadastral das vias públicas do município.*

### 9.9. Módulo Regularização Fundiária (REURB)
![Regularização Fundiária Urbana](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/09_reurb.png)
*Legenda: Fluxo operacional de homologação, cadastro de famílias e certidões fundiárias digitais (CRF).*

### 9.10. Módulo de Obras, Alvarás e Licenças
![Módulo de Alvarás](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/10_alvaras.png)
*Legenda: Gestão e acompanhamento digital de processos de licenciamento residencial e comercial.*

### 9.11. Centro de Relatórios Oficiais e Exportação
![Módulo de Relatórios](/Users/paulo/Documents/ubatuba-saas/docs/screenshots/govtech/11_relatorios.png)
*Legenda: Gerador automatizado de exportação e emissão de certidões oficiais em lote com garantia de paginação profissional e auditoria.*

---

## 10. Diferenciais da Solução

O FlyDea destaca-se frente às soluções legadas do mercado por quatro diferenciais chaves:

1.  **Tecnologia de Visualização Vetorial (Vector Tiles - MVT):** O motor geográfico do WebGIS suporta renderização rápida e responsiva de 50.000+ geometrias de parcelas sem travar ou sobrecarregar os navegadores dos servidores públicos.
2.  **Grafo Centrado no Lote (Territorial de Verdade):** Todos os módulos se reportam à unidade de lote, promovendo uma coesão cadastral perfeita entre obras, fiscalização de campo, arrecadação tributária e regularização fundiária.
3.  **Segurança SaaS com Isolamento Multi-Tenant Robusto:** A garantia técnica que impede que dados sigilosos ou pessoais vazem de uma prefeitura para outra em instâncias centralizadas de hospedagem.
4.  **Auditoria e LGPD Transparente:** Um motor de logs centralizado e inalterável de todas as ações executadas pelos servidores na base de dados de proprietários do município.

---

## 11. Benefícios para a Prefeitura

### Para Gestores (Prefeitos, Secretários de Finanças e Planejamento):
*   **Aumento de Receita sem Elevação de Alíquotas:** Regularização cadastral por meio de cruzamento geográfico detecta áreas construídas omitidas, incrementando o IPTU de forma justa e embasada por imagens.
*   **Transparência e Compliance:** Relatórios confiáveis e prontos reduzem multas de órgãos fiscais externos de fiscalização.
*   **Painéis de Decisão baseados em Evidências:** Dashboards em tempo real com mapas analíticos eliminam decisões no "feeling".

### Para Servidores Públicos (Fiscais, Analistas e Engenheiros municipais):
*   **Redução Drástica do Retrabalho:** Fim das fichas de papel acumuladas, substituídas por syncs imediatos entre campo e escritório.
*   **Produtividade de Alta Performance:** Aprovação de processos territoriais e documentais 90% mais ágil.
*   **Segurança Operacional:** Trilha de assinaturas e auditoria digital protege o servidor em decisões tomadas com base em evidências cadastradas.

### Para Cidadãos (Munícipes e Empreendedores):
*   **Acesso Descomplicado:** Portal do Cidadão acessível 24/7 de qualquer dispositivo para certidões e 156.
*   **Eliminação de Filas e Processos Lentos:** Respostas governamentais imediatas e rastreáveis na web.
*   **Justiça Fiscal Absoluta:** Garantia de que cada lote pague tributos exatamente correspondentes ao seu tamanho real verificado e catalogado.

### Para a Equipe Técnica da Prefeitura (TI Interna):
*   **Código Limpo e Moderno (Next.js / NestJS):** Fácil manutenção e expansão para novas secretarias.
*   **Documentação OpenAPI / Swagger Completa:** Integração fácil com outros sistemas legados da prefeitura.
*   **Padrão CRS Dinâmico:** Manipulação robusta de sistemas de coordenadas cartográficas sem quebrar a geolocalização dos lotes.

---

## 12. Casos de Uso Reais

### Caso de Uso 1: Otimização e Justiça Fiscal (PGV + IPTU + Vistoria)
1.  O WebGIS da prefeitura detecta, via foto aérea, uma ampliação residencial em um lote antes cadastrado como terreno baldio.
2.  O Operador do CTM abre uma ordem de vistoria técnica do tipo Fiscalização Tributária.
3.  O Fiscal em campo recebe o chamado, confirma a nova edificação de 200m², tira fotos e envia a atualização direto do local.
4.  O sistema processa o recálculo do Valor Venal utilizando a Planta Genérica de Valores atualizada com as alíquotas da zona e altera a base do IPTU de forma automática e auditável.

### Caso de Uso 2: Desburocratização de Alvará de Obras
1.  Um construtor de um empreendimento imobiliário acessa o Portal do Cidadão e solicita um Alvará de Construção.
2.  O sistema valida automaticamente a viabilidade do lote cadastrado no CTM.
3.  O analista de obras revisa o projeto arquitetônico anexado à solicitação, agenda a vistoria de viabilidade e homologa o parecer.
4.  O sistema emite a certidão de Alvará digitalizada, com assinatura legal e código QR de validação instantânea, disponibilizando o download para o construtor direto na web.

---

## 13. Roadmap Sugerido de Evolução

Com base no estado avançado da tecnologia do FlyDea, sugere-se a expansão para os seguintes módulos futuros:

*   **PWA / App Móvel Nativo Offline para Fiscais:** Garantir a coleta completa de dados em campo mesmo em áreas sem nenhuma conexão 3G/4G, sincronizando as imagens automaticamente ao retornar à secretaria municipal.
*   **Assinatura Digital de Certidões com Padrão ICP-Brasil:** Homologar o fluxo de assinaturas usando chaves públicas brasileiras corporativas de servidores públicos para validação jurídica irrefutável de licenciamentos em âmbito nacional.
*   **Detecção de Inconsistências Territoriais por IA:** Integrar bibliotecas de Machine Learning com imagens de satélite para automatizar a varredura visual de obras e construções irregulares que divergem do CTM da prefeitura.
*   **Módulo Avançado de Arrecadação e Pagamento Digital:** Integrar a cobrança do IPTU e taxas de alvarás diretamente via PIX municipal e cartão de crédito, com conciliação bancária de baixa instantânea automatizada.

---

## 14. Conclusão

O **FlyDea GovTech** estabelece uma infraestrutura corporativa digital de alto nível que eleva a gestão territorial de qualquer prefeitura brasileira ao padrão mais competitivo de mercado (`Municipal-Grade`). O seu design arquitetônico inovador com centralização dos módulos operacionais no lote cartográfico, somado à segurança e robustez do código-fonte modular, faz da plataforma a escolha mais segura para governos modernos focados em eficiência administrativa, transparência de dados públicos e atração de investimentos urbanos sustentáveis.
