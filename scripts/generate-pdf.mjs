import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const outputPdfPath = path.resolve(process.cwd(), 'docs/flydea-govtech-overview.pdf');
const screenshotsDir = path.resolve(process.cwd(), 'docs/screenshots/govtech');

async function generatePdf() {
  console.log('Iniciando compilação do PDF institucional/técnico premium do FlyDea...');
  
  // Garantir que a pasta de saída existe
  await fs.mkdir(path.dirname(outputPdfPath), { recursive: true });

  const imgNames = [
    '01_portal_publico.png',
    '02_login.png',
    '03_dashboard.png',
    '04_webgis.png',
    '05_ctm_parcelas.png',
    '06_detalhe_parcela.png',
    '07_vistorias.png',
    '08_logradouros.png',
    '09_reurb.png',
    '10_alvaras.png',
    '11_relatorios.png'
  ];

  console.log('Lendo imagens e convertendo para Base64...');
  const imgs = {};
  for (const name of imgNames) {
    const filePath = path.join(screenshotsDir, name);
    try {
      const data = await fs.readFile(filePath);
      imgs[name] = `data:image/png;base64,${data.toString('base64')}`;
      console.log(`✓ Imagem ${name} convertida com sucesso (${(data.length / 1024).toFixed(1)} KB).`);
    } catch (err) {
      console.error(`✗ Erro ao converter imagem ${name}:`, err.message);
      imgs[name] = ''; // Fallback vazio
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Injetar o HTML estilizado com dimensões A4 perfeitas
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
              200: '#b8c7dc',
              600: '#1b365d',
              700: '#152b4a',
              750: '#11223b',
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
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        margin: 0;
        padding: 0;
      }
      .pdf-page {
        page-break-after: always;
        break-after: page;
        page-break-inside: avoid;
      }
    }
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, .title-font {
      font-family: 'Outfit', sans-serif;
    }
    /* Folha A4 Padrão a 96 DPI: 794px x 1123px. Usamos 1122px para margem de segurança de impressão */
    .pdf-page {
      width: 794px;
      height: 1122px;
      box-sizing: border-box;
      padding: 40px;
      position: relative;
      overflow: hidden;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      page-break-inside: avoid;
      page-break-after: always;
    }
    .pdf-footer {
      margin-top: auto;
      width: 100%;
    }
    .img-container {
      max-height: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 12px;
    }
    .img-container img {
      max-height: 380px;
      width: auto;
      object-fit: contain;
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 antialiased leading-relaxed">

  <!-- ================= PÁGINA 1: CAPA ================= -->
  <div class="pdf-page text-white relative" style="background: linear-gradient(135deg, #0e1c31 0%, #152b4a 60%, #070e18 100%);">
    
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
      <h1 class="text-5xl font-extrabold font-outfit tracking-tight leading-tight text-white mb-6">
        Plataforma Unificada de Gestão Territorial e <span class="text-blue-300">Inteligência Urbana</span>
      </h1>
      <p class="text-xl text-slate-300 font-light max-w-3xl leading-relaxed mb-8">
        Digitalização e integração completa de GIS, Cadastro Territorial Multifinalitário (CTM), tributação dinâmica e workflows de fiscalização de campo para prefeituras brasileiras.
      </p>
      
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span class="text-sm font-medium text-slate-200">Pronto para Licitações</span>
        </div>
        <div class="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <span class="text-sm font-medium text-slate-200">Conformidade LGPD</span>
        </div>
        <div class="flex items-center space-x-2 bg-blue-500/10 border border-blue-400/20 px-4 py-2 rounded-xl">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
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

  <!-- ================= PÁGINA 2: SUMÁRIO E INTRODUÇÃO ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Sumário Executivo</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 2</span>
    </div>

    <!-- Grid de Sumário -->
    <div class="grid grid-cols-2 gap-8 mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gov-700 mb-3 border-l-4 border-blue-500 pl-3">Estrutura</h3>
        <ul class="space-y-2 text-xs text-slate-600">
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
            <span class="text-slate-400">Pág 14</span>
          </li>
          <li class="flex justify-between border-b pb-1">
            <span class="font-medium text-slate-800">8. Casos de Uso e Evolução</span>
            <span class="text-slate-400">Pág 14</span>
          </li>
        </ul>
      </div>

      <div class="bg-gov-50 p-4 rounded-xl border border-gov-100 flex flex-col justify-between text-xs">
        <div>
          <h4 class="font-bold text-gov-700 mb-1 text-sm">Nota de Conformidade</h4>
          <p class="text-slate-600 leading-relaxed">
            Este material descreve detalhadamente o estado operacional e as capacidades de implantação imediata do FlyDea em municípios de médio e grande porte, servindo como base técnica fidedigna para auditorias de contratação e especificação de termos de referência.
          </p>
        </div>
        <div class="mt-2 pt-2 border-t border-gov-200/50 flex items-center space-x-2 text-[10px] text-gov-600 font-semibold">
          <span>✓ Em conformidade com diretrizes de WebGIS municipal e CTM.</span>
        </div>
      </div>
    </div>

    <!-- Introdução -->
    <div class="space-y-4 text-xs">
      <h3 class="text-xl font-bold text-gov-700 font-outfit">1. Resumo Executivo</h3>
      <p class="text-slate-600 leading-relaxed">
        O <strong>FlyDea GovTech</strong> é uma plataforma SaaS multi-tenant desenvolvida especificamente para prefeituras e autarquias municipais que buscam modernizar sua infraestrutura tecnológica e operacional. O coração do sistema reside no Cadastro Territorial Multifinalitário (CTM) integrado com o WebGIS e a Planta Genérica de Valores (PGV), oferecendo uma base cartográfica dinâmica que conecta a parcela territorial (o lote) a todos os fluxos administrativos, tributários, de fiscalização de campo e de licenciamento de obras do município.
      </p>
      <p class="text-slate-600 leading-relaxed">
        Diferente de sistemas de BI isolados ou de visualizadores de mapas puramente cosméticos, o FlyDea atua como o <strong>grafo único da verdade municipal</strong>. Cada ação executada na plataforma — seja a abertura de uma ordem de vistoria por um fiscal no celular, a emissão automática de uma certidão de alvará de obras no portal do cidadão ou o recálculo do IPTU a partir da Planta Genérica de Valores — é processada de forma integrada, auditável e instantaneamente sincronizada com a parcela territorial afetada.
      </p>
      
      <!-- Destaque -->
      <div class="p-4 bg-gradient-to-r from-gov-50 to-blue-50/50 rounded-xl border-l-4 border-gov-600 text-xs text-slate-700 font-medium italic">
        "O território é o eixo de decisão do gestor público moderno. Ao centrar o ecossistema municipal na parcela cadastral, a prefeitura ganha controle de arrecadação absoluto, reduz a burocracia do servidor em 90% e entrega processos transparentes em minutos para o munícipe."
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-outfit">
      FlyDea GovTech • Gestão Territorial e Tributação Municipal
    </div>
  </div>

  <!-- ================= PÁGINA 3: SOLUÇÃO & PROBLEMAS ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Visão Geral da Solução</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 3</span>
    </div>

    <div class="space-y-6 text-xs">
      <h3 class="text-xl font-bold text-gov-700 font-outfit">2. Visão Geral da Solução</h3>
      <p class="text-slate-600 leading-relaxed">
        O ecossistema FlyDea foi desenhado para cobrir de forma homogênea as principais secretarias municipais através de três pilares fundamentais:
      </p>
      <ul class="grid grid-cols-3 gap-4 my-4">
        <li class="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-gov-600 mb-1 text-sm">Portal do Cidadão</h4>
          <p class="text-[10px] text-slate-600 leading-relaxed">Canal digital público sem fricção para abertura de solicitações, ouvidoria 156, consulta tributária simplificada e certidões imediatas.</p>
        </li>
        <li class="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-gov-600 mb-1 text-sm">Área Administrativa</h4>
          <p class="text-[10px] text-slate-600 leading-relaxed">Visualizador WebGIS vetorial, edição de parcelas CTM, ordens de vistoria e acompanhamento executivo por dashboards.</p>
        </li>
        <li class="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
          <h4 class="font-bold text-gov-600 mb-1 text-sm">Segurança & RBAC</h4>
          <p class="text-[10px] text-slate-600 leading-relaxed">Isolamento rigoroso multi-tenant, auditoria inalterável de ações de proprietários de terras e controle de acesso por cargos públicos.</p>
        </li>
      </ul>

      <h3 class="text-xl font-bold text-gov-700 font-outfit mt-8">3. Problemas que o Sistema Resolve</h3>
      <div class="grid grid-cols-2 gap-6 my-4">
        <div class="flex space-x-3">
          <div class="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0 text-sm">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Processos Manuais Lentificados</h4>
            <p class="text-[11px] text-slate-600 leading-relaxed">Acaba com as pilhas de processos físicos acumulados que transitam entre secretarias, eliminando o gargalo de meses de atraso em aprovações.</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <div class="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0 text-sm">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Dados Cadastrais Desatualizados</h4>
            <p class="text-[11px] text-slate-600 leading-relaxed">Combate a perda crônica de receitas de IPTU por divergências físicas graves (lotes aumentados sem notificação) coletando dados de vistoria diretamente do local.</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <div class="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0 text-sm">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Sistemas Municipais Isolados</h4>
            <p class="text-[11px] text-slate-600 leading-relaxed">Integra de forma definitiva as informações do setor fiscal, do setor cartográfico e das vistorias urbanísticas, unindo o município.</p>
          </div>
        </div>
        <div class="flex space-x-3">
          <div class="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 flex-shrink-0 text-sm">!</div>
          <div>
            <h4 class="font-bold text-gov-700 text-sm mb-1">Burocracia de Campo para Fiscais</h4>
            <p class="text-[11px] text-slate-600 leading-relaxed">Substitui planilhas de papel e anotações soltas por uma plataforma móvel e offline que sincroniza instantaneamente as vistorias concluídas.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-outfit">
      FlyDea GovTech • Gestão Territorial e Tributação Municipal
    </div>
  </div>

  <!-- ================= PÁGINA 4: ARQUITETURA E GRAFO ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Arquitetura Funcional</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 4</span>
    </div>

    <div class="space-y-6 text-xs">
      <h3 class="text-xl font-bold text-gov-700 font-outfit">4. Arquitetura do Grafo da Parcela</h3>
      <p class="text-slate-600 leading-relaxed">
        A arquitetura operacional do FlyDea é orientada ao território. A <strong>parcela cadastral (lote)</strong> atua como a chave de junção única de todo o ecossistema de dados municipais.
      </p>

      <!-- Diagrama ASCII Estilizado como Card -->
      <div class="bg-gov-900 text-slate-200 p-6 rounded-2xl font-mono text-xs flex flex-col items-center justify-center shadow-lg border border-gov-800 my-4 space-y-2">
        <div class="text-blue-400 font-bold">Visualizador WebGIS (Território)</div>
        <div class="text-slate-500">│</div>
        <div class="flex items-center space-x-4">
          <span class="bg-gov-800 px-3 py-1 rounded border border-slate-700">Tributação (IPTU/PGV)</span>
          <span class="text-slate-500">◀───▶</span>
          <span class="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow-md border border-blue-400">PARCELA (Lote Cadastral)</span>
          <span class="text-slate-500">◀───▶</span>
          <span class="bg-gov-800 px-3 py-1 rounded border border-slate-700">Vistorias (Fiscalização)</span>
        </div>
        <div class="text-slate-500">│</div>
        <div class="text-indigo-400 font-bold">Processos Digitais / Certidões e Alvarás</div>
      </div>

      <p class="text-slate-600 leading-relaxed">
        Essa estrutura de grafo garante consistência absoluta. Se uma vistoria de campo aprova uma alteração de área edificada em uma determinada parcela cadastral, essa mudança é refletida em tempo real nas consultas geográficas do WebGIS, gera uma notificação auditável na trilha de segurança da parcela, e recalcula automaticamente o IPTU com base nas regras tributárias de alíquotas zonais.
      </p>
      
      <div class="grid grid-cols-2 gap-6 my-4">
        <div class="p-4 border border-gov-100 bg-gov-50/20 rounded-xl">
          <h4 class="font-bold text-gov-600 mb-1 text-sm">Consistência Geográfica</h4>
          <p class="text-[11px] text-slate-600 leading-relaxed">Cada lote territorial possui correspondência biunívoca entre o polígono do mapa georreferenciado e os registros tabulares do banco.</p>
        </div>
        <div class="p-4 border border-gov-100 bg-gov-50/20 rounded-xl">
          <h4 class="font-bold text-gov-600 mb-1 text-sm">Histórico e Rastreabilidade</h4>
          <p class="text-[11px] text-slate-600 leading-relaxed">Qualquer edição cadastral é logada associando a chave da parcela ao CPF do operador, garantindo integridade jurídica total.</p>
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-outfit">
      FlyDea GovTech • Gestão Territorial e Tributação Municipal
    </div>
  </div>

  <!-- ================= PÁGINA 5: MÓDULOS 1 (CTM & GIS) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Módulos Operacionais</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 5</span>
    </div>

    <div class="space-y-6 text-xs">
      <h3 class="text-xl font-bold text-gov-700 font-outfit">5. Cadastro Territorial e Inteligência Geográfica</h3>
      
      <!-- CTM -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.1. Cadastro Territorial Multifinalitário (CTM)</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          O CTM unifica os dados multifinalitários de todos os lotes e proprietários municipais. Permite busca avançada por bairro, CPF/CNPJ, inscrição imobiliária ou logradouro, viabilizando a gestão completa da base cadastral.
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Edição cadastral, histórico de propriedade, unificação cadastral.
        </div>
      </div>

      <!-- WebGIS -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.2. Visualizador WebGIS Multicamadas</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          O motor geográfico WebGIS renderiza milhares de polígonos vetoriais complexos (Polygon e MultiPolygon) em alta performance, suportando o CRS do município (UTM Sirgas2000). Permite overlays de camadas fiscais, ambientais e de infraestrutura.
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Importador WFS GeoSampa, filtros de camadas, medição espacial e fitBounds.
        </div>
      </div>

      <!-- Logradouros -->
      <div>
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.3. Cadastro Urbanístico de Logradouros</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          Controle centralizado da malha viária municipal, associando cada logradouro à sua hierarquia urbana, trecho de quadra correspondente e faces fiscais para o cálculo de tributação territorial precisa.
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Vínculo com face de quadra, codificação viária e relatórios de infraestrutura.
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-outfit">
      FlyDea GovTech • Gestão Territorial e Tributação Municipal
    </div>
  </div>

  <!-- ================= PÁGINA 6: MÓDULOS 2 (VISTORIAS & REURB) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Módulos Operacionais</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 6</span>
    </div>

    <div class="space-y-6 text-xs">
      <h3 class="text-xl font-bold text-gov-700 font-outfit">5. Fiscalização e Regularização Fundiária</h3>
      
      <!-- Vistorias -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.4. Vistorias de Campo e Aplicativo de Fiscalização</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          Fiscais municipais abrem ordens de vistoria vinculadas a lotes e preenchem checklists técnicos diretamente em campo. O módulo suporta funcionamento móvel offline, permitindo o registro fotográfico e de coordenadas GPS mesmo sem internet.
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Checklists dinâmicos, sincronização offline em campo, anexos de fotos.
        </div>
      </div>

      <!-- REURB -->
      <div>
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.5. Regularização Fundiária Urbana (REURB)</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          Fluxo estruturado e auditável de regularização de assentamentos informais de interesse social ou específico. Gerencia o cadastro de núcleos informais, o censo das famílias residentes, análise de pendências documentais e geração de Certidões de Regularização Fundiária (CRF).
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Cadastro de famílias, controle de CRF, mapeamento de assentamentos e relatórios.
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-outfit">
      FlyDea GovTech • Gestão Territorial e Tributação Municipal
    </div>
  </div>

  <!-- ================= PÁGINA 7: MÓDULOS 3 (ALVARÁS, TRIB & RELATÓRIOS) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Módulos Operacionais</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 7</span>
    </div>

    <div class="space-y-6 text-xs">
      <h3 class="text-xl font-bold text-gov-700 font-outfit">5. Obras, Tributos e Auditoria</h3>
      
      <!-- Alvarás -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.6. Alvarás de Obras e Licenciamento Municipal</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          Gestão e aprovação digital de processos de licenciamento residencial e comercial. Engenheiros e munícipes anexam projetos arquitetônicos, enquanto analistas conduzem o trâmite de aprovação interna até a emissão automática do alvará assinado digitalmente.
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Assinatura digital RSA, trâmite digital de projetos, certidão de habite-se.
        </div>
      </div>

      <!-- Tributação -->
      <div class="border-b pb-4">
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.7. Tributação Integrada (IPTU e PGV)</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          Motor tributário que cruza de forma inteligente os registros físicos do CTM com a Planta Genérica de Valores (PGV), estabelecendo valores de metro quadrado de terreno e edificações por face de quadra para gerar lançamentos de IPTU precisos e justos.
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Planta de Valores (PGV), simulação de alíquotas, auditoria de IPTU por lote.
        </div>
      </div>

      <!-- Relatórios -->
      <div>
        <h4 class="text-lg font-bold text-gov-600 mb-1">5.8. Relatórios Oficiais e Exportação</h4>
        <p class="text-slate-600 leading-relaxed mb-2">
          Central robusta de exportações em lote e emissão de certidões oficiais. Garante plena conformidade técnica com as auditorias de Tribunais de Contas e órgãos reguladores governamentais.
        </p>
        <div class="bg-gov-50 px-3 py-1.5 rounded-lg text-[10px] text-gov-600 font-medium border border-gov-100 inline-block">
          ✓ Serviços: Exportação de base cadastral XLS/CSV, emissão de certidões timbradas.
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-outfit">
      FlyDea GovTech • Gestão Territorial e Tributação Municipal
    </div>
  </div>

  <!-- ================= PÁGINA 8: DEMO VISUAL 1 (PORTAL & LOGIN) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 8</span>
    </div>

    <div class="space-y-4 text-xs">
      <!-- 9.1 Portal do Cidadão -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.1. Portal do Cidadão (Ouvidoria & Consulta Pública)</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Interface pública municipal simplificada e acessível, onde o munícipe realiza consultas de IPTU e abre solicitações na Ouvidoria 156.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['01_portal_publico.png']}" alt="Portal do Cidadão" class="w-full">
        </div>
      </div>

      <!-- 9.2 Login -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.2. Painel de Login Unificado (Autenticação Multi-Tenant)</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Acesso restrito para servidores públicos municipais com isolamento criptográfico por tenant municipal.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['02_login.png']}" alt="Login Unificado" class="w-full">
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 font-outfit">
      Demonstração em Produção: http://labspaulo.site/ • Tenant: São Paulo
    </div>
  </div>

  <!-- ================= PÁGINA 9: DEMO VISUAL 2 (DASHBOARD & WEBGIS) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 9</span>
    </div>

    <div class="space-y-4 text-xs">
      <!-- 9.3 Dashboard -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.3. Dashboard Administrativo Principal (Visão Executiva)</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Painel analítico integrado que consolida os principais indicadores territoriais, vistorias em campo e estatísticas de REURB em tempo real.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['03_dashboard.png']}" alt="Dashboard Administrativo" class="w-full">
        </div>
      </div>

      <!-- 9.4 WebGIS -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.4. Inteligência Geográfica WebGIS</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Cartografia digital em alta performance contendo as quadras e polígonos de lotes reais de São Paulo com filtros dinâmicos de camadas.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['04_webgis.png']}" alt="Inteligência Geográfica WebGIS" class="w-full">
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 font-outfit">
      Demonstração em Produção: http://labspaulo.site/ • Tenant: São Paulo
    </div>
  </div>

  <!-- ================= PÁGINA 10: DEMO VISUAL 3 (CTM PARCELAS & DETALHE) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 10</span>
    </div>

    <div class="space-y-4 text-xs">
      <!-- 9.5 CTM -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.5. Cadastro Técnico Multifinalitário (CTM - Tabela de Parcelas)</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Tabela unificada de busca e filtros operacionais avançados das parcelas imobiliárias do município, com integridade do banco fiscal.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['05_ctm_parcelas.png']}" alt="CTM Parcelas" class="w-full">
        </div>
      </div>

      <!-- 9.6 Detalhe Parcela -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.6. Ficha Cadastral e Grafo de Detalhes da Parcela</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Ficha do lote real selecionado de São Paulo, apresentando proprietário, mini mapa georreferenciado e gráficos fiscais dinâmicos.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['06_detalhe_parcela.png']}" alt="Detalhe Parcela" class="w-full">
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 font-outfit">
      Demonstração em Produção: http://labspaulo.site/ • Tenant: São Paulo
    </div>
  </div>

  <!-- ================= PÁGINA 11: DEMO VISUAL 4 (LOGRADOUROS & VISTORIAS) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 11</span>
    </div>

    <div class="space-y-4 text-xs">
      <!-- 9.7 Logradouros -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.7. Cadastro de Logradouros e Vias Urbanas</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Interface operacional para acompanhamento e codificação dos logradouros oficiais, ruas e vias integradas ao território municipal.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['08_logradouros.png']}" alt="Cadastro de Logradouros" class="w-full">
        </div>
      </div>

      <!-- 9.8 Vistorias -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.8. Módulo de Vistorias e Ordens de Fiscalização</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Acompanhamento operacional de ordens de serviço abertas, status de checklists preenchidos por fiscais e fotos de evidências de campo.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['07_vistorias.png']}" alt="Vistorias de Campo" class="w-full">
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 font-outfit">
      Demonstração em Produção: http://labspaulo.site/ • Tenant: São Paulo
    </div>
  </div>

  <!-- ================= PÁGINA 12: DEMO VISUAL 5 (REURB & ALVARÁS) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 12</span>
    </div>

    <div class="space-y-4 text-xs">
      <!-- 9.9 REURB -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.9. Módulo de Regularização Fundiária Urbana (REURB)</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Gestão de processos de regularização fundiária de interesse social, controle de famílias, núcleos cadastrados e emissão de CRF.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['09_reurb.png']}" alt="REURB" class="w-full">
        </div>
      </div>

      <!-- 9.10 Alvaras -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.10. Módulo de Licenciamento de Obras e Alvarás</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Acompanhamento de processos digitais de licenciamento, análise documental e emissão automática de alvarás oficiais de obra.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container">
          <img src="${imgs['10_alvaras.png']}" alt="Alvarás e Obras" class="w-full">
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 font-outfit">
      Demonstração em Produção: http://labspaulo.site/ • Tenant: São Paulo
    </div>
  </div>

  <!-- ================= PÁGINA 13: DEMO VISUAL 6 (RELATÓRIOS) ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-xl font-bold text-gov-600 font-outfit">Demonstração Visual das Telas</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 13</span>
    </div>

    <div class="space-y-4 text-xs">
      <!-- 9.11 Relatorios -->
      <div>
        <h4 class="text-sm font-bold text-gov-700 mb-1">9.11. Central de Relatórios Oficiais e Exportação em Lote</h4>
        <p class="text-[10px] text-slate-500 mb-2 leading-relaxed">
          Motor gerador de relatórios e exportações consolidadas de lotes, proprietários e dados financeiros municipais para auditorias e termos.
        </p>
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow img-container" style="max-height: 620px;">
          <img src="${imgs['11_relatorios.png']}" alt="Relatórios Oficiais" class="w-full" style="max-height: 620px; object-fit: contain;">
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-2 text-center text-[10px] text-slate-400 font-outfit">
      Demonstração em Produção: http://labspaulo.site/ • Tenant: São Paulo • Pág 13
    </div>
  </div>

  <!-- ================= PÁGINA 14: BENEFÍCIOS E CASOS DE USO ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Benefícios & Casos de Uso</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 14</span>
    </div>

    <div class="space-y-4 text-xs">
      <h3 class="text-lg font-bold text-gov-700 font-outfit">10. Benefícios de Impacto Municipal</h3>
      
      <div class="space-y-3">
        <!-- Gestor -->
        <div class="flex space-x-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 text-xs flex-shrink-0">G</div>
          <div>
            <h4 class="font-bold text-gov-750 text-xs mb-0.5">Para os Gestores (Prefeitos e Secretários):</h4>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              <strong>Justiça e Incremento Fiscal Sem Aumento de Impostos:</strong> A regularização territorial via CTM e vistorias identifica áreas de edificação ocultas, elevando a base do IPTU de forma justa e incontestável.
            </p>
          </div>
        </div>

        <!-- Servidor -->
        <div class="flex space-x-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 text-xs flex-shrink-0">S</div>
          <div>
            <h4 class="font-bold text-gov-750 text-xs mb-0.5">Para os Servidores Públicos (Técnicos e Analistas):</h4>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              <strong>Eliminação de Retrabalho e Papelada:</strong> Fiscais inserem os dados direto do smartphone em campo, atualizando a base cadastral no escritório imediatamente. A automação reduz o tempo de análise documental.
            </p>
          </div>
        </div>

        <!-- Cidadão -->
        <div class="flex space-x-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-gov-600 text-xs flex-shrink-0">C</div>
          <div>
            <h4 class="font-bold text-gov-750 text-xs mb-0.5">Para os Cidadãos (Munícipes e Construtores):</h4>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              <strong>Respostas Imediatas e Sem Filas:</strong> Construtores realizam solicitações digitais e emitem certidões e alvarás oficiais assinados em poucos minutos, sem necessidade de deslocamento físico à prefeitura.
            </p>
          </div>
        </div>
      </div>

      <h3 class="text-lg font-bold text-gov-700 font-outfit mt-4">11. Casos de Uso Reais</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="p-3 border border-gov-100 bg-gov-50/20 rounded-xl">
          <h4 class="font-bold text-gov-600 text-xs mb-1">Caso 1: Fiscalização Inteligente</h4>
          <p class="text-[10px] text-slate-600 leading-relaxed">
            Uma imagem cadastral detecta aumento de área em lote subnotificado. O CTM emite uma Ordem de Vistoria. O fiscal vai ao campo, insere fotos no celular e o motor tributário ajusta o IPTU de forma justa.
          </p>
        </div>
        <div class="p-3 border border-gov-100 bg-gov-50/20 rounded-xl">
          <h4 class="font-bold text-gov-600 text-xs mb-1">Caso 2: Emissão de Alvará Express</h4>
          <p class="text-[10px] text-slate-600 leading-relaxed">
            Um construtor solicita aprovação de obra no portal. O sistema valida dados cadastrais do CTM. O analista agenda vistoria rápida e o sistema disponibiliza o Alvará oficial assinado digitalmente com QR Code.
          </p>
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="pdf-footer border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 font-outfit">
      FlyDea GovTech • Gestão Territorial e Tributação Municipal
    </div>
  </div>

  <!-- ================= PÁGINA 15: CONCLUSÃO ================= -->
  <div class="pdf-page">
    <div class="flex justify-between items-center border-b pb-4 mb-4">
      <h2 class="text-2xl font-bold text-gov-600 font-outfit">Conclusão</h2>
      <span class="text-xs text-slate-400 font-medium">FlyDea GovTech Overview • Pág 15</span>
    </div>

    <div class="mt-12 mb-auto max-w-3xl space-y-6 text-sm">
      <h3 class="text-2xl font-extrabold text-gov-750 font-outfit border-l-4 border-blue-500 pl-3">A Fundação do Município Inteligente</h3>
      <p class="text-slate-600 leading-relaxed">
        O <strong>FlyDea GovTech</strong> estabelece uma base sólida e inegociável para a consolidação de municípios plenamente conectados, sustentáveis e tecnologicamente eficientes ('Municipal-Grade').
      </p>
      <p class="text-slate-600 leading-relaxed">
        A união indissociável entre o território, a Planta de Valores e a desburocratização de fluxos capacita qualquer município a atingir patamares ótimos de governança pública, gerando justiça tributária ao cidadão e oferecendo total conformidade legal e governamental perante os órgãos reguladores nacionais.
      </p>
    </div>

    <!-- Rodapé Final -->
    <div class="pdf-footer border-t border-slate-200 pt-8 text-center text-xs font-outfit">
      <p class="font-bold text-slate-600">FlyDea GovTech • Todos os direitos reservados • Catanduva - SP</p>
      <p class="mt-1 text-slate-400">Documento gerado automaticamente pelo motor de conformidade técnica em 21 de Maio de 2026</p>
    </div>
  </div>

</body>
</html>
  `;

  // Carregar o HTML no navegador local do Playwright
  console.log('Injetando conteúdo HTML estilizado no Playwright...');
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

  // Aguardar que todas as imagens Base64 estejam completamente carregadas e decodificadas
  console.log('Aguardando decodificação completa de todas as imagens Base64...');
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.every(img => {
      if (!img.src) return true;
      return img.complete && img.naturalWidth > 0;
    });
  }, { timeout: 45000 });

  // Aguardar carregamento das fontes do Google
  console.log('Aguardando carregamento das fontes do Google...');
  await page.evaluate(() => document.fonts.ready);

  // Pequeno intervalo adicional de segurança para layouting final
  await page.waitForTimeout(2000);

  // Gerar o PDF A4 Pixel Perfect
  console.log(`Compilando PDF e salvando em ${outputPdfPath}...`);
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
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
