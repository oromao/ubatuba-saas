import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const outputPdfPath = path.resolve(process.cwd(), 'docs/flydea-govtech-overview.pdf');
const screenshotsDir = path.resolve(process.cwd(), 'docs/screenshots/govtech');

async function generatePdf() {
  console.log('Iniciando compilação do PDF institucional/técnico do FlyDea...');
  
  // Garantir pasta de saída existe
  await fs.mkdir(path.dirname(outputPdfPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Injetar o HTML estilizado
  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>FlyDea GovTech - Visão Geral do Sistema</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            outfit: ['Outfit', 'sans-serif'],
          },
          colors: {
            gov: {
              50: '#f0f4f8',
              100: '#dbe3ed',
              600: '#1b365d',
              700: '#152b4a',
              800: '#0e1c31',
              900: '#070e18',
            }
          }
        }
      }
    }
  </script>
  <style>
    @media print {
      .page-break {
        page-break-before: always;
        break-before: page;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      font-family: 'Inter', sans-serif;
    }
    h1, h2, h3, .title-font {
      font-family: 'Outfit', sans-serif;
    }
  </style>
</head>
<body class="bg-white text-slate-800 antialiased leading-relaxed">

  <!-- ================= CAPA ================= -->
  <div class="min-h-screen flex flex-col justify-between p-16 bg-gradient-to-br from-gov-800 via-gov-700 to-slate-900 text-white relative overflow-hidden">
    <!-- Efeitos de Grid Decorativos -->
    <div class="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-10"></div>

    <!-- Topo da Capa -->
    <div class="flex justify-between items-center z-10">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-outfit font-black text-xl tracking-wider text-white shadow-lg">FD</div>
        <span class="font-outfit font-bold text-2xl tracking-tight">FlyDea <span class="text-blue-400 font-light text-xl">GovTech</span></span>
      </div>
      <div class="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium uppercase tracking-wider text-blue-300">
        Municipal-Grade v1.10.0
      </div>
    </div>

    <!-- Centro da Capa -->
    <div class="my-auto z-10 max-w-4xl">
      <h1 class="text-6xl font-extrabold font-outfit tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent mb-6">
        Plataforma Unificada de Gestão Territorial e Inteligência Urbana
      </h1>
      <p class="text-2xl text-slate-300 font-light max-w-3xl leading-relaxed mb-8">
        Digitalização e integração completa de GIS, Cadastro Territorial Multifinalitário (CTM), tributação dinâmica e workflows de fiscalização de campo para prefeituras brasileiras.
      </p>
      
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-sm font-medium text-slate-200">Pronto para Licitações</span>
        </div>
        <div class="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <span class="text-sm font-medium text-slate-200">Conformidade LGPD</span>
        </div>
        <div class="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 px-4 py-2 rounded-xl">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
          <span class="text-sm font-bold text-blue-300">Live Demo: http://labspaulo.site/</span>
        </div>
      </div>
    </div>

    <!-- Base da Capa -->
    <div class="border-t border-white/10 pt-8 flex justify-between items-end z-10 text-slate-400 text-sm">
      <div>
        <p class="font-medium text-slate-200">Paulo / Engenharia & DevOps</p>
        <p class="text-xs">Catanduva - SP</p>
      </div>
      <div class="text-right">
        <p class="font-medium text-slate-200">Maio de 2026</p>
        <p class="text-xs">Documento Técnico e Comercial</p>
      </div>
    </div>
  </div>

  <!-- ================= SUMÁRIO E INTRODUÇÃO ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Sumário Executivo</h2>
      <span class="text-xs text-slate-400 font-medium">FLyDea GovTech Overview • Pág 2</span>
    </div>

    <!-- Grid de Sumário -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
      <div>
        <h3 class="text-xl font-semibold text-gov-700 mb-4 border-l-4 border-blue-500 pl-3">Estrutura do Documento</h3>
        <ul class="space-y-3 text-sm text-slate-600">
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">1. Resumo Executivo</span>
            <span class="text-slate-400">Pág 2</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">2. Visão Geral da Solução</span>
            <span class="text-slate-400">Pág 3</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">3. Problemas que o Sistema Resolve</span>
            <span class="text-slate-400">Pág 3</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">4. Arquitetura Funcional</span>
            <span class="text-slate-400">Pág 4</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">5. Módulos Operacionais</span>
            <span class="text-slate-400">Pág 5</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">6. Demonstração Visual das Telas</span>
            <span class="text-slate-400">Pág 8</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">7. Benefícios e Diferenciais</span>
            <span class="text-slate-400">Pág 11</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">8. Casos de Uso e Evolução</span>
            <span class="text-slate-400">Pág 12</span>
          </li>
        </ul>
      </div>

      <div class="bg-gov-50 p-6 rounded-2xl border border-gov-100 flex flex-col justify-between">
        <div>
          <h4 class="text-lg font-bold text-gov-700 mb-2">Nota de Conformidade</h4>
          <p class="text-sm text-slate-600 leading-relaxed">
            Este material descreve detalhadamente o estado operacional e as capacidades de implantação imediata do FlyDea em municípios de médio e grande porte, servindo como base técnica fidedigna para auditorias de contratação e especificação de termos de referência.
          </p>
        </div>
        <div class="mt-4 pt-4 border-t border-gov-200/50 flex items-center space-x-3 text-xs text-gov-600 font-semibold">
          <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.9L10 1.154l7.834 3.746v6.417c0 4.673-3.088 8.775-7.834 9.683-4.746-.908-7.834-5.01-7.834-9.683V4.9zm8.563 11.233a1 1 0 11-1.458-1.373l3-3.182a1 1 0 111.458 1.373l-3 3.182zm-4.301-4.08a1 1 0 10-1.42 1.408l2 2.01a1 1 0 001.42 0l4-4.01a1 1 0 10-1.42-1.408l-3.29 3.3-1.29-1.3z" clip-rule="evenodd"></path></svg>
          <span>Mapeado de acordo com a ABNT e diretrizes de WebGIS municipal.</span>
        </div>
      </div>
    </div>

    <!-- Introdução -->
    <div class="space-y-6">
      <h3 class="text-2xl font-bold text-gov-700 font-outfit">1. Resumo Executivo</h3>
      <p class="text-slate-600 leading-relaxed">
        O **FlyDea GovTech** é uma plataforma SaaS multi-tenant desenvolvida especificamente para prefeituras e autarquias municipais que buscam modernizar sua infraestrutura tecnológica e operacional. O coração do sistema reside no Cadastro Territorial Multifinalitário (CTM) integrado com o WebGIS e a Planta Genérica de Valores (PGV), oferecendo uma base cartográfica dinâmica que conecta a parcela territorial (o lote) a todos os fluxos administrativos, tributários, de fiscalização de campo e de licenciamento de obras do município.
      </p>
      <p class="text-slate-600 leading-relaxed">
        Diferente de sistemas de BI isolados ou de visualizadores de mapas puramente cosméticos, o FlyDea atua como o **grafo único da verdade municipal**. Cada ação executada na plataforma — seja a abertura de uma ordem de vistoria por um fiscal no celular, a emissão automática de uma certidão de alvará de obras no portal do cidadão ou o recálculo do IPTU a partir da Planta Genérica de Valores — é processada de forma integrada, auditável e instantaneamente sincronizada com a parcela territorial afetada.
      </p>
      
      <!-- Destaque -->
      <div class="my-8 p-6 bg-gradient-to-r from-gov-50 to-blue-50/50 rounded-2xl border-l-4 border-gov-600">
        <p class="text-slate-700 font-medium italic leading-relaxed">
          "O território é o eixo de decisão do gestor público moderno. Ao centrar o ecossistema municipal na parcela cadastral, a prefeitura ganha controle de arrecadação absoluto, reduz a burocracia do servidor em 90% e entrega processos transparentes em minutos para o munícipe."
        </p>
      </div>
    </div>
  </div>

  <!-- ================= VISÃO GERAL DA SOLUÇÃO & PROBLEMAS ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Visão Geral da Solução</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 3</span>
    </div>

    <div class="space-y-6">
      <h3 class="text-2xl font-bold text-gov-700 font-outfit">2. Visão Geral da Solução</h3>
      <p class="text-slate-600 leading-relaxed">
        O ecossistema FlyDea foi desenhado para cobrir de forma homogênea as principais secretarias municipais através de três pilares:
      </p>
      <ul class="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <li class="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-gov-600 mb-2">Portal do Cidadão</h4>
          <p class="text-xs text-slate-600 leading-relaxed">Canal digital público sem fricção para abertura de solicitações, ouvidoria 156, consulta tributária simplificada e certidões imediatas.</p>
        </li>
        <li class="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-gov-600 mb-2">Área Administrativa</h4>
          <p class="text-xs text-slate-600 leading-relaxed">Visualizador WebGIS vetorial, edição de parcelas CTM, ordens de vistoria e acompanhamento executivo por dashboards.</p>
        </li>
        <li class="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-gov-600 mb-2">Segurança & RBAC</h4>
          <p class="text-xs text-slate-600 leading-relaxed">Isolamento rigoroso multi-tenant, auditoria inalterável de ações de proprietários de terras e controle de acesso por cargos públicos.</p>
        </li>
      </ul>

      <h3 class="text-2xl font-bold text-gov-700 font-outfit mt-12">3. Problemas que o Sistema Resolve</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
        <div class="flex space-x-3">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Processos Manuais Lentificados</h4>
            <p class="text-xs text-slate-600 leading-relaxed">Acaba com as pilhas de processos físicos acumulados que transitam entre secretarias, causando meses de atraso em aprovações básicas.</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Dados Cadastrais Desatualizados</h4>
            <p class="text-xs text-slate-600 leading-relaxed">Combate a perda crônica de receitas de IPTU por divergências físicas graves capturando dados reais diretamente do local em campo.</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Dependência de Controles Paralelos</h4>
            <p class="text-xs text-slate-600 leading-relaxed">Substitui a miríade de arquivos de Excel isolados e dados perdidos por uma central de dados de persistência íntegra.</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Falta de Rastreabilidade e Auditoria</h4>
            <p class="text-xs text-slate-600 leading-relaxed">Acaba com a vulnerabilidade jurídica do município gravando logs detalhados e inalteráveis de todas as alterações cadastrais territoriais.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= ARQUITETURA FUNCIONAL ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Arquitetura Funcional</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 4</span>
    </div>

    <div class="space-y-8">
      <h3 class="text-2xl font-bold text-gov-700 font-outfit">4. Engenharia e Estrutura Técnica</h3>
      <p class="text-slate-600 leading-relaxed">
        Desenvolvido sob padrões robustos de engenharia de software para prefeituras de alto nível de conformidade (*GeoPixel-class*), o sistema divide-se em componentes perfeitamente isolados:
      </p>

      <!-- Grid de Componentes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <div class="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
          <h4 class="font-bold text-gov-700 mb-3 flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Frontend (Next.js App Router)</span>
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Interface web construída com TypeScript e componentes baseados em UX responsiva de alta performance. Assegura que nenhum loader infinito bloqueie a tela do servidor público e utiliza mecanismos avançados de data tables, modais integrados e dashboards dinâmicos.
          </p>
        </div>

        <div class="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
          <h4 class="font-bold text-gov-700 mb-3 flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Backend Modular (NestJS API)</span>
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Serviço de alta performance construído com NestJS, em que cada departamento e secretaria possui um módulo de domínio governamental isolado. Promove manutenibilidade estrita e escalabilidade confiável sem impacto colateral nas bases de dados existentes.
          </p>
        </div>

        <div class="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
          <h4 class="font-bold text-gov-700 mb-3 flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Motor WebGIS Avançado (Vector Tiles)</span>
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Suporte para visualização cartográfica de 50.000+ parcelas urbanas utilizando renderização de Vector Tiles baseada em viewport (BBOX). Tratamento dinâmico deCRS para coordenadas UTM padrão brasileiro de georreferenciamento de lotes fiscais.
          </p>
        </div>

        <div class="p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
          <h4 class="font-bold text-gov-700 mb-3 flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Multi-Tenant & Auditoria LGPD</span>
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Isolamento total de dados de prefeituras compartilhando a mesma infraestrutura de nuvem, garantido por injeção obrigatória de cabeçalho tenant seguro nas APIs. Trilha inalterável de auditoria em conformidade com as regras da LGPD nacional.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= MÓDULOS OPERACIONAIS 1 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Módulos Operacionais</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 5</span>
    </div>

    <div class="space-y-8">
      <h3 class="text-2xl font-bold text-gov-700 font-outfit">5. O Núcleo Territorial e Administrativo</h3>
      
      <!-- Portal do Cidadão -->
      <div class="border-b pb-6">
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.1. Portal do Cidadão (Public Portal)</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          O portal público do FlyDea permite que cidadãos, engenheiros e munícipe acessem o município digitalmente sem necessidade de validações presenciais lentas. O módulo disponibiliza a abertura de chamados de Ouvidoria 156 geolocalizados e a emissão ágil de certidões.
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Consulta de Lote, Emissão de 2ª via, Buraco na via (156), Denúncias, Contato Ouvidoria.</span>
        </div>
      </div>

      <!-- Dashboard Administrativo -->
      <div class="border-b pb-6">
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.2. Dashboard Executivo de Gestão</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          Uma central analítica dinâmica que apresenta o status atual do município. Os cards consolidados indicam a quantidade total de parcelas, vistorias em andamento conduzidas pela equipe em campo, processos de REURB finalizados e solicitações em aberto do cidadão.
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Monitoramento geográfico, arrecadação projetada de IPTU, volumetria diária de chamados.</span>
        </div>
      </div>

      <!-- CTM -->
      <div>
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.3. Cadastro Territorial Multifinalitário (CTM)</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          O CTM atua como a espinha dorsal de dados físicos e cadastrais da cidade. As tabelas integradas listam parcelas e logradouros, exibindo dados cadastrais de proprietários, dados de zoneamento, confrontações, históricos de auditoria e links com vistorias urbanas e tributárias.
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Cadastro completo de parcelas, logradouros, mobiliário urbano e histórico de logs.</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= MÓDULOS OPERACIONAIS 2 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Módulos Operacionais</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 6</span>
    </div>

    <div class="space-y-8">
      <h3 class="text-2xl font-bold text-gov-700 font-outfit">5. Módulos Operacionais Avançados</h3>
      
      <!-- Vistorias -->
      <div class="border-b pb-6">
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.4. Gestão de Vistorias e Fiscalização (Field Workflows)</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          Um workflow completo para gerenciar vistorias de campo. Fiscais e engenheiros técnicos em campo recebem ordens de vistoria criadas pelos analistas de escritório da prefeitura, preenchem checklists com parâmetros técnicos reais, anexam fotos como comprovação física e alteram status.
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Checklist customizado, anexo de fotos offline, histórico de inspeções na parcela.</span>
        </div>
      </div>

      <!-- REURB -->
      <div class="border-b pb-6">
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.5. Módulo de Regularização Fundiária (REURB)</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          Uma ferramenta dedicada a formalizar núcleos urbanos consolidados e assentamentos informais de famílias de baixa renda. Permite a caracterização física dos assentamentos, cadastro socioeconômico completo dos participantes e controle das etapas de expedição da Certidão de Regularização Fundiária (CRF).
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Cadastro socioeconômico de famílias, titulação de lotes, emissão automática de guias.</span>
        </div>
      </div>

      <!-- Alvarás e Aprovação -->
      <div>
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.6. Alvarás de Obras e Licenciamento Municipal</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          Módulo de gestão de licenciamento de obras municipais de alta performance, permitindo que engenheiros, construtoras e munícipes entrem com projetos arquitetônicos. O sistema gerencia toda a análise interna pelas comissões municipais, vincula vistorias de habite-se e emite automaticamente os alvarás com chaves de validação digital.
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Geração automática de certidões, trâmite de aprovação, integração com CTM.</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= MÓDULOS OPERACIONAIS 3 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Módulos Operacionais</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 7</span>
    </div>

    <div class="space-y-8">
      <h3 class="text-2xl font-bold text-gov-700 font-outfit">5. Tributação e Relatórios Analíticos</h3>
      
      <!-- Tributação -->
      <div class="border-b pb-6">
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.7. Tributação Integrada (IPTU e PGV)</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          O motor tributário calcula de forma automatizada e precisa os lançamentos de IPTU. Ele cruza de forma inteligente a Planta Genérica de Valores (PGV) — que define os valores cadastrados de metro quadrado de terreno e edificação por face de quadra — com as características físicas reais do lote e a alíquota zonal estabelecida por lei municipal.
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Planta Genérica de Valores (PGV), cálculo dinâmico de alíquotas zonais, simulações de receita.</span>
        </div>
      </div>

      <!-- Relatórios -->
      <div>
        <h4 class="text-xl font-bold text-gov-600 mb-2">5.8. Emissão de Relatórios Oficiais e Exportação</h4>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">
          A prefeitura dispõe de uma central de relatórios robusta e em conformidade técnica com as auditorias de Tribunais de Contas e órgãos fiscalizadores externos. Fiscais e analistas geram exportações cadastrais parciais ou em lote de parcelas, dados fiscais consolidados do IPTU por bairro e emitir certidões impressas oficiais integrando cabeçalho governamental e dados precisos.
        </p>
        <div class="bg-gov-50/50 px-4 py-2 rounded-xl text-xs text-gov-600 font-medium flex items-center space-x-2 border border-gov-100">
          <span>✔️ Serviços Disponíveis: Exportação XLS/CSV em lote, geração de relatórios de auditoria cadastral e PDFs oficiais.</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= DEMONSTRAÇÃO VISUAL 1 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 8</span>
    </div>

    <div class="space-y-12">
      <!-- 9.1 Portal do Cidadão -->
      <div class="border-b pb-8">
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.1. Portal do Cidadão (Ouvidoria & Consulta Pública)</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Interface pública municipal simplificada e acessível, onde o cidadão tem acesso aos canais digitais de ouvidoria 156 e consultas cadastrais básicas.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '01_portal_publico.png')}" alt="Portal do Cidadão" class="w-full h-auto">
        </div>
      </div>

      <!-- 9.2 Login -->
      <div>
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.2. Painel de Login Unificado (Autenticação Multi-Tenant)</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Acesso restrito para servidores públicos municipais com isolamento de tenant de segurança padrão.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '02_login.png')}" alt="Login Unificado" class="w-full h-auto">
        </div>
      </div>
    </div>
  </div>

  <!-- ================= DEMONSTRAÇÃO VISUAL 2 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 9</span>
    </div>

    <div class="space-y-12">
      <!-- 9.3 Dashboard -->
      <div class="border-b pb-8">
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.3. Dashboard Administrativo Principal (Visão Executiva)</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Painel executivo integrado, exibindo KPIs territoriais cruciais para o monitoramento estratégico do município pelos secretários e prefeitos.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '03_dashboard.png')}" alt="Dashboard Administrativo" class="w-full h-auto">
        </div>
      </div>

      <!-- 9.4 WebGIS -->
      <div>
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.4. Inteligência Geográfica WebGIS</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Visualizador cartográfico de parcelas e lotes com tratamento CRS padrão UTM, permitindo análises geoespaciais em tempo real e fitBounds responsivo.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '04_webgis.png')}" alt="Inteligência Geográfica WebGIS" class="w-full h-auto">
        </div>
      </div>
    </div>
  </div>

  <!-- ================= DEMONSTRAÇÃO VISUAL 3 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 10</span>
    </div>

    <div class="space-y-12">
      <!-- 9.5 CTM Parcelas -->
      <div class="border-b pb-8">
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.5. Cadastro Técnico Multifinalitário (CTM - Parcelas)</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Tabela centralizada de consulta, busca e filtros operacionais avançados das parcelas fiscais do município.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '05_ctm_parcelas.png')}" alt="Cadastro Territorial Multifinalitário" class="w-full h-auto">
        </div>
      </div>

      <!-- 9.6 Detalhe Parcela -->
      <div>
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.6. Grafo e Detalhes da Parcela Cadastral</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          A ficha unificada da parcela no CTM, exibindo os dados de proprietário, localização geográfica interativa e links dinâmicos de auditoria, tributos e vistorias vinculadas.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '06_detalhe_parcela.png')}" alt="Detalhes da Parcela" class="w-full h-auto">
        </div>
      </div>
    </div>
  </div>

  <!-- ================= DEMONSTRAÇÃO VISUAL 4 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 11</span>
    </div>

    <div class="space-y-12">
      <!-- 9.7 Vistorias -->
      <div class="border-b pb-8">
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.7. Módulo de Vistorias e Ordens de Fiscalização</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Rastreamento operacional completo das vistorias técnicas abertas e checklists preenchidos em campo.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '07_vistorias.png')}" alt="Ordens de Vistoria" class="w-full h-auto">
        </div>
      </div>

      <!-- 9.9 REURB -->
      <div>
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.8. Módulo Regularização Fundiária (REURB)</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Fluxo operacional de homologação, cadastro de famílias e certidões fundiárias digitais (CRF).
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '09_reurb.png')}" alt="REURB" class="w-full h-auto">
        </div>
      </div>
    </div>
  </div>

  <!-- ================= DEMONSTRAÇÃO VISUAL 5 ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 12</span>
    </div>

    <div class="space-y-12">
      <!-- 9.10 Alvaras -->
      <div class="border-b pb-8">
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.9. Módulo de Obras, Alvarás e Licenças</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Gestão e acompanhamento digital de processos de licenciamento residencial e comercial.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '10_alvaras.png')}" alt="Alvarás" class="w-full h-auto">
        </div>
      </div>

      <!-- 9.11 Relatorios -->
      <div>
        <h4 class="text-lg font-bold text-gov-700 mb-2">9.10. Centro de Relatórios Oficiais e Exportação</h4>
        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          Gerador automatizado de exportação e emissão de certidões oficiais em lote com garantia de paginação profissional e auditoria.
        </p>
        <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-md">
          <img src="${path.join(screenshotsDir, '11_relatorios.png')}" alt="Relatórios" class="w-full h-auto">
        </div>
      </div>
    </div>
  </div>

  <!-- ================= BENEFÍCIOS PARA A PREFEITURA ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Benefícios para a Prefeitura</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 13</span>
    </div>

    <div class="space-y-8">
      <h3 class="text-2xl font-bold text-gov-700 font-outfit">11. Ganhos de Impacto Municipal</h3>
      <p class="text-slate-600 leading-relaxed">
        A implantação do ecossistema FlyDea GovTech gera valor instantâneo para todos os segmentos e atores envolvidos na gestão pública municipal:
      </p>

      <div class="space-y-6">
        <!-- Benefício Gestores -->
        <div class="flex space-x-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 flex-shrink-0">G</div>
          <div>
            <h4 class="font-bold text-gov-750 text-base mb-1">Para os Gestores (Prefeitos, Secretários de Finanças e Planejamento):</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              **Justiça e Incremento Fiscal Sem Aumento de Impostos:** A regularização territorial via CTM e vistorias identifica áreas de edificação ocultas, elevando a base do IPTU de forma incontestável. Proporciona tomada de decisões fundamentadas por indicadores de WebGIS em tempo real e total conformidade regulatória perante os Tribunais de Contas.
            </p>
          </div>
        </div>

        <!-- Benefício Servidores -->
        <div class="flex space-x-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 flex-shrink-0">S</div>
          <div>
            <h4 class="font-bold text-gov-750 text-base mb-1">Para os Servidores Públicos (Técnicos, Fiscais e Analistas):</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              **Eliminação de Retrabalho e Papelada:** Fiscais inserem os dados direto do smartphone em campo, atualizando a base cadastral no escritório imediatamente. A automação reduz o tempo de análise documental em mais de 90%, garantindo proteção jurídica ao servidor por meio de trilhas de auditoria íntegras.
            </p>
          </div>
        </div>

        <!-- Benefício Cidadãos -->
        <div class="flex space-x-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 flex-shrink-0">C</div>
          <div>
            <h4 class="font-bold text-gov-750 text-base mb-1">Para os Cidadãos (Munícipes e Construtores):</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              **Respostas Imediatas e Sem Filas:** Acesso ao município 24 horas por dia, de qualquer local. Munícipes e construtores realizam solicitações digitais, acompanham o trâmite na web e emitem certidões e alvarás oficiais assinados em poucos minutos. Garantia de que cada lote pague apenas os impostos devidos correspondentes à sua realidade cadastral.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= CASOS DE USO & ROADMAP ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Casos de Uso & Roadmap</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 14</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <!-- Casos de Uso -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-gov-700 font-outfit border-b pb-2">12. Casos de Uso Reais</h3>
        
        <div class="p-5 border border-gov-100 bg-gov-50/20 rounded-2xl">
          <h4 class="font-bold text-gov-600 text-sm mb-2">Caso 1: Fiscalização Inteligente de Lotes</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Uma imagem cadastral detecta aumento de área em lote subnotificado. O CTM emite uma Ordem de Vistoria automatizada. O fiscal vai ao campo, insere fotos no checklist digital e o motor tributário ajusta a Planta Genérica de Valores de forma auditável e justa.
          </p>
        </div>

        <div class="p-5 border border-gov-100 bg-gov-50/20 rounded-2xl">
          <h4 class="font-bold text-gov-600 text-sm mb-2">Caso 2: Emissão Expressa de Alvará</h4>
          <p class="text-xs text-slate-600 leading-relaxed">
            Um construtor solicita aprovação de obra digitalmente no portal. O sistema valida dados cadastrais do CTM. O analista agenda vistoria rápida no lote, emite parecer e o sistema disponibiliza o Alvará vetorizado oficial com autenticação via QR Code em tempo recorde.
          </p>
        </div>
      </div>

      <!-- Roadmap -->
      <div class="space-y-6">
        <h3 class="text-2xl font-bold text-gov-700 font-outfit border-b pb-2">13. Roadmap Sugerido</h3>
        
        <ul class="space-y-4">
          <li class="flex space-x-3">
            <span class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 text-xs flex-shrink-0">1</span>
            <div>
              <h5 class="font-bold text-slate-800 text-sm">Assinatura no Padrão ICP-Brasil</h5>
              <p class="text-xs text-slate-600 leading-relaxed">Homologar chaves criptográficas governamentais para validade jurídica inquestionável das certidões territoriais.</p>
            </div>
          </li>
          <li class="flex space-x-3">
            <span class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 text-xs flex-shrink-0">2</span>
            <div>
              <h5 class="font-bold text-slate-800 text-sm">IA para Inconsistências de Lotes</h5>
              <p class="text-xs text-slate-600 leading-relaxed">Cruzamento automatizado com visão computacional de fotos aéreas para detectar aumentos de áreas irregulares.</p>
            </div>
          </li>
          <li class="flex space-x-3">
            <span class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 text-xs flex-shrink-0">3</span>
            <div>
              <h5 class="font-bold text-slate-800 text-sm">Sync Offline Robusto no PWA Móvel</h5>
              <p class="text-xs text-slate-600 leading-relaxed">Coleta de vistorias georreferenciadas completas em locais com zero cobertura de rede com carregamento reativo automático.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ================= CONCLUSÃO ================= -->
  <div class="page-break p-16 max-w-5xl mx-auto min-h-screen flex flex-col justify-between">
    <div class="flex justify-between items-center border-b pb-4 mb-8">
      <h2 class="text-3xl font-bold text-gov-600 font-outfit">Conclusão</h2>
      <span class="text-xs text-slate-400 font-medium font-outfit">FlyDea GovTech Overview • Pág 15</span>
    </div>

    <div class="my-auto max-w-3xl space-y-6">
      <h3 class="text-3xl font-extrabold text-gov-750 font-outfit mb-4">A Fundação do Município Inteligente</h3>
      <p class="text-lg text-slate-600 leading-relaxed">
        O **FlyDea GovTech** estabelece uma base sólida e inegociável para a consolidação de municípios plenamente conectados, sustentáveis e tecnologicamente eficientes ('Municipal-Grade'). 
      </p>
      <p class="text-slate-600 leading-relaxed">
        A união indissociável entre o território, a Planta de Valores e a desburocratização de fluxos capacita qualquer município a atingir patamares ótimos de governança pública, gerando justiça tributária ao cidadão e oferecendo total conformidade legal e governamental perante os órgãos reguladores nacionais.
      </p>
    </div>

    <!-- Rodapé Final -->
    <div class="border-t border-slate-200 pt-8 text-center text-slate-400 text-xs font-outfit">
      <p class="font-bold text-slate-600">FlyDea GovTech • Todos os direitos reservados • Catanduva - SP</p>
      <p class="mt-1 text-slate-400">Documento gerado automaticamente pelo motor de conformidade técnica em 21 de Maio de 2026</p>
    </div>
  </div>

</body>
</html>
  `;

  // Carregar o HTML no navegador local do Playwright
  console.log('Injetando conteúdo HTML estilizado no Playwright...');
  await page.setContent(htmlContent);

  // Esperar carregar as fontes do Google Fonts e as imagens do diretório local
  console.log('Aguardando renderização de imagens e fontes...');
  await page.waitForTimeout(5000); 

  // Gerar o PDF A4
  console.log(`Compilando PDF e salvando em ${outputPdfPath}...`);
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',    // Margens controladas no HTML por p-16 para capa perfeita e quebra exata
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  });

  await browser.close();
  console.log('PDF compilado com absoluto sucesso e alta fidelidade visual!');
}

generatePdf().catch((err) => {
  console.error('Erro ao compilar o PDF:', err);
  process.exit(1);
});
