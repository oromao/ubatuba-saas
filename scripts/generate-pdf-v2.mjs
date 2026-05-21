import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const outputPdfPath = path.resolve(process.cwd(), 'docs/flydea-govtech-overview-v2.pdf');
const screenshotsDir = path.resolve(process.cwd(), 'docs/screenshots/govtech');

async function generatePdf() {
  console.log('Iniciando compilação do PDF FlyDea GovTech v2.0...');
  
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

  console.log('Convertendo imagens para Base64...');
  const imgs = {};
  for (const name of imgNames) {
    const filePath = path.join(screenshotsDir, name);
    try {
      const data = await fs.readFile(filePath);
      imgs[name] = `data:image/png;base64,${data.toString('base64')}`;
      console.log(`✓ ${name} (${(data.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`✗ Erro ao ler ${name}: ${err.message}`);
      imgs[name] = '';
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const htmlContent = buildHtml(imgs);
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
  console.log(`\n✅ PDF gerado com sucesso: ${outputPdfPath}`);
}

function buildHtml(imgs) {
  // Cores e design tokens
  const NAVY = '#0d1f3c';
  const NAVY_DARK = '#071428';
  const NAVY_MID = '#132d52';
  const BLUE = '#2563EB';
  const BLUE_LIGHT = '#3B82F6';
  const BLUE_PALE = '#DBEAFE';
  const SLATE = '#64748B';
  const SLATE_LIGHT = '#F1F5F9';
  const GREEN = '#059669';
  const AMBER = '#D97706';
  const TEXT = '#1E293B';
  const TEXT_MUTED = '#64748B';

  const screenshotsData = [
    {
      file: '01_portal_publico.png',
      num: '01',
      title: 'Portal do Cidadão',
      subtitle: 'Canal Digital de Serviços Municipais',
      desc: 'Interface pública acessível sem login onde o munícipe solicita serviços, consulta certidões e acompanha processos por protocolo, a qualquer hora do dia.',
      benefit: 'Reduz demanda no atendimento presencial e amplia o acesso a serviços municipais 24 horas por dia.',
      user: 'Cidadão / Munícipe',
      userColor: '#059669',
    },
    {
      file: '02_login.png',
      num: '02',
      title: 'Autenticação Multi-Tenant',
      subtitle: 'Acesso Seguro por Prefeitura',
      desc: 'Login com isolamento por tenant: cada município possui credenciais e ambiente de dados completamente exclusivos, sem possibilidade de acesso cruzado.',
      benefit: 'Garante que apenas servidores autorizados acessem os dados estratégicos do município.',
      user: 'Todos os Servidores Internos',
      userColor: '#2563EB',
    },
    {
      file: '03_dashboard.png',
      num: '03',
      title: 'Dashboard Administrativo',
      subtitle: 'Visão Executiva do Município',
      desc: 'Painel consolidado com KPIs de parcelas cadastradas, vistorias em andamento, alvarás concedidos e processos de REURB. Indicadores atualizados em tempo real.',
      benefit: 'Substitui relatórios manuais por indicadores em tempo real acessíveis a secretários e prefeito.',
      user: 'Gestor / Secretário / Prefeito',
      userColor: '#7C3AED',
    },
    {
      file: '04_webgis.png',
      num: '04',
      title: 'WebGIS — Inteligência Geográfica',
      subtitle: 'Mapa Operacional das Parcelas Municipais',
      desc: 'Visualizador cartográfico com 300+ lotes reais importados do GeoSampa (SP). Suporte a CRS UTM 31983/WGS84, seleção por lote, análise por viewport e Vector Tiles.',
      benefit: 'Identifica inconsistências territoriais e conecta o mapa diretamente à base cadastral.',
      user: 'Analista Técnico / Gestor Territorial',
      userColor: '#0891B2',
    },
    {
      file: '05_ctm_parcelas.png',
      num: '05',
      title: 'Cadastro Territorial Multifinalitário',
      subtitle: 'Base Unificada de Parcelas e Lotes',
      desc: 'Tabela central com busca avançada por proprietário, inscrição cadastral ou endereço. Filtros por zoneamento, status e tipo. Acesso direto à ficha de cada parcela.',
      benefit: 'Base única e auditável de todos os lotes do município, acessível por todas as secretarias.',
      user: 'Servidor / Analista / Fiscal',
      userColor: '#2563EB',
    },
    {
      file: '06_detalhe_parcela.png',
      num: '06',
      title: 'Ficha Unificada da Parcela',
      subtitle: 'Grafo Completo do Lote Municipal',
      desc: 'Ficha integrada com dados cadastrais completos, localização no WebGIS, histórico de vistorias, tributos vinculados e processos relacionados ao imóvel.',
      benefit: 'Concentra toda a informação sobre um imóvel em uma única tela, eliminando consultas entre sistemas.',
      user: 'Servidor / Analista / Gestor',
      userColor: '#2563EB',
    },
    {
      file: '07_vistorias.png',
      num: '07',
      title: 'Módulo de Vistorias',
      subtitle: 'Fiscalização de Campo Integrada',
      desc: 'Ordens de vistoria abertas por lote, com status de tramitação, fiscal responsável, data e resultado registrado. Checklists preenchidos em campo com sincronização imediata.',
      benefit: 'Fiscalização rastreável, vinculada ao CTM, com histórico completo por imóvel.',
      user: 'Fiscal de Campo / Analista Interno',
      userColor: '#D97706',
    },
    {
      file: '08_logradouros.png',
      num: '08',
      title: 'Cadastro de Logradouros',
      subtitle: 'Gestão de Vias Públicas Municipais',
      desc: 'Registro e gestão das vias públicas do município, vinculadas às parcelas para consistência do endereçamento e das bases de tributação e fiscalização.',
      benefit: 'Base de endereçamento única, sem divergências entre secretarias ou sistemas.',
      user: 'Servidor / Analista do CTM',
      userColor: '#2563EB',
    },
    {
      file: '09_reurb.png',
      num: '09',
      title: 'Regularização Fundiária (REURB)',
      subtitle: 'Formalização de Assentamentos Urbanos',
      desc: 'Fluxo completo de cadastro de famílias participantes, georreferenciamento de lotes irregulares, tramitação e emissão de Certidões de Regularização Fundiária (CRF).',
      benefit: 'Inclusão social, segurança jurídica e potencial incremento da base tributária municipal.',
      user: 'Servidor / Gestor de Habitação',
      userColor: '#059669',
    },
    {
      file: '10_alvaras.png',
      num: '10',
      title: 'Alvarás e Licenciamento de Obras',
      subtitle: 'Gestão Digital de Licenças de Construção',
      desc: 'Entrada de projetos pelo portal, tramitação interna entre secretarias, parecer técnico digital, assinatura eletrônica e emissão automática de alvará com QR Code de validação.',
      benefit: 'Tramitação digital completa com rastreabilidade de cada etapa e redução do tempo de espera.',
      user: 'Cidadão / Construtor / Analista de Obras',
      userColor: '#7C3AED',
    },
    {
      file: '11_relatorios.png',
      num: '11',
      title: 'Relatórios e Exportações',
      subtitle: 'Central de Relatórios Oficiais',
      desc: 'Geração de relatórios filtráveis por zoneamento, período e status. Exportação em PDF e planilha. Histórico auditável de emissões com identificação do responsável.',
      benefit: 'Transparência operacional e suporte à prestação de contas para órgãos de controle.',
      user: 'Gestor / Auditor / Equipe Técnica',
      userColor: '#0891B2',
    },
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>FlyDea GovTech — Visão Geral do Sistema v2.0</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #e2e8f0; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print {
      body { background: white; }
      .pdf-page { page-break-after: always; break-after: page; }
    }

    /* ===== PAGE SHELL ===== */
    .pdf-page {
      width: 794px;
      min-height: 1122px;
      max-height: 1122px;
      overflow: hidden;
      background: #fff;
      position: relative;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      break-after: page;
    }

    /* ===== TYPOGRAPHY ===== */
    .font-outfit { font-family: 'Outfit', sans-serif; }
    .text-navy { color: ${NAVY}; }
    .text-blue { color: ${BLUE}; }
    .text-slate { color: ${SLATE}; }
    .text-muted { color: ${TEXT_MUTED}; }

    /* ===== FOOTER ===== */
    .page-footer {
      margin-top: auto;
      padding: 12px 40px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .page-footer span { font-size: 10px; color: ${TEXT_MUTED}; }
    .footer-logo { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 11px; color: ${NAVY}; }

    /* ===== HEADER ===== */
    .page-header {
      padding: 18px 40px 14px;
      border-bottom: 2px solid ${NAVY};
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .page-header h2 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: ${NAVY}; }
    .page-num { font-size: 11px; color: ${TEXT_MUTED}; font-weight: 500; }

    /* ===== CONTENT AREA ===== */
    .page-content { padding: 24px 40px; flex: 1; overflow: hidden; }

    /* ===== TAGS/BADGES ===== */
    .tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .tag-green { background: #D1FAE5; color: #065F46; }
    .tag-blue { background: #DBEAFE; color: #1D4ED8; }
    .tag-amber { background: #FEF3C7; color: #92400E; }
    .tag-violet { background: #EDE9FE; color: #5B21B6; }
    .tag-slate { background: #F1F5F9; color: #475569; }
    .tag-navy { background: ${NAVY}; color: #fff; }

    /* ===== SECTION DIVIDER ===== */
    .section-divider {
      height: 3px;
      width: 40px;
      background: ${BLUE};
      border-radius: 2px;
      margin-bottom: 8px;
    }

    /* ===== SCREENSHOT PAGE ===== */
    .screenshot-img-container {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      background: #F8FAFC;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 330px;
      flex-shrink: 0;
    }
    .screenshot-img-container img {
      max-height: 330px;
      max-width: 100%;
      object-fit: contain;
      display: block;
    }

    /* ===== CARD ===== */
    .card {
      background: ${SLATE_LIGHT};
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      padding: 14px 16px;
    }
    .card-blue {
      background: ${BLUE_PALE};
      border-color: #BFDBFE;
    }
    .card-navy {
      background: ${NAVY};
      color: white;
      border: none;
    }

    /* ===== TABLE ===== */
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: ${NAVY}; color: white; padding: 7px 10px; text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
    td { padding: 7px 10px; border-bottom: 1px solid #E2E8F0; color: ${TEXT}; vertical-align: top; }
    tr:nth-child(even) td { background: #F8FAFC; }

    /* ===== STATUS INDICATOR ===== */
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
    .dot-green { background: #10B981; }
    .dot-amber { background: #F59E0B; }
    .dot-blue { background: ${BLUE}; }

    /* ===== PHASE CARD ===== */
    .phase-card {
      display: flex;
      gap: 14px;
      padding: 11px 0;
      border-bottom: 1px solid #E2E8F0;
    }
    .phase-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${NAVY};
      color: white;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* ===== BENEFIT ROW ===== */
    .benefit-row {
      display: flex;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .benefit-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    /* ===== DIFFERENTIALS ===== */
    .diff-item {
      display: flex;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .diff-num {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 20px;
      color: ${BLUE_PALE};
      line-height: 1;
      width: 28px;
      flex-shrink: 0;
    }

    /* ===== USE CASE ===== */
    .uc-step {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      align-items: flex-start;
    }
    .uc-step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: ${NAVY};
      color: white;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* ===== NEXT STEPS ===== */
    .step-card {
      display: flex;
      gap: 14px;
      padding: 13px 16px;
      background: ${SLATE_LIGHT};
      border-radius: 10px;
      border-left: 3px solid ${BLUE};
      margin-bottom: 10px;
    }
    .step-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: ${NAVY};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
  </style>
</head>
<body>

<!-- ====================================================== -->
<!-- PÁGINA 1: CAPA                                          -->
<!-- ====================================================== -->
<div class="pdf-page" style="background: linear-gradient(160deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${NAVY_MID} 100%); color: white; padding: 48px 52px; gap: 0;">

  <!-- Logo / Marca -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE}); display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 18px; color: white; letter-spacing: -1px;">FD</div>
      <div>
        <div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px;">FlyDea <span style="color: #93C5FD; font-weight: 400;">GovTech</span></div>
        <div style="font-size: 11px; color: #94A3B8; margin-top: 1px;">Plataforma Municipal SaaS</div>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <span class="tag tag-green">Ambiente Ativo</span>
      <span class="tag" style="background: rgba(255,255,255,0.1); color: #CBD5E1; border: 1px solid rgba(255,255,255,0.15);">v2.0 — Maio 2026</span>
    </div>
  </div>

  <!-- Elemento decorativo -->
  <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 0 30px;">
    <div style="font-size: 11px; color: #60A5FA; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">Documento Técnico e Comercial</div>
    <h1 style="font-family: 'Outfit', sans-serif; font-size: 46px; font-weight: 900; line-height: 1.1; color: white; letter-spacing: -1px; margin-bottom: 20px;">
      Plataforma Unificada de<br>
      <span style="color: #60A5FA;">Gestão Territorial</span><br>
      e Serviços Municipais
    </h1>
    <p style="font-size: 15px; color: #94A3B8; line-height: 1.7; max-width: 580px; margin-bottom: 32px;">
      Modernização da gestão pública municipal por meio da integração entre território, tributação, fiscalização de campo e serviços digitais ao cidadão — em uma única plataforma auditável e segura.
    </p>

    <!-- Tags de posicionamento -->
    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 7px 16px;">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; flex-shrink: 0;"></span>
        <span style="font-size: 12px; color: #CBD5E1; font-weight: 500;">CTM + WebGIS + PGV/IPTU</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 7px 16px;">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #60A5FA; flex-shrink: 0;"></span>
        <span style="font-size: 12px; color: #CBD5E1; font-weight: 500;">Multi-tenant com Isolamento por Município</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 7px 16px;">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #A78BFA; flex-shrink: 0;"></span>
        <span style="font-size: 12px; color: #CBD5E1; font-weight: 500;">Fiscalização, Alvarás, REURB e Relatórios</span>
      </div>
    </div>
  </div>

  <!-- Rodapé da capa -->
  <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <div style="font-size: 13px; font-weight: 600; color: #E2E8F0; margin-bottom: 3px;">Paulo — Engenharia e DevOps</div>
      <div style="font-size: 11px; color: #64748B;">FlyDea GovTech · Catanduva - SP</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; color: #60A5FA; font-weight: 500; margin-bottom: 3px;">🌐 labspaulo.site</div>
      <div style="font-size: 10px; color: #475569;">Ambiente de demonstração ativo</div>
    </div>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 2: SUMÁRIO EXECUTIVO                             -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>Sumário Executivo</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 2</span>
  </div>
  <div class="page-content">

    <p style="font-size: 13px; line-height: 1.7; color: ${TEXT}; margin-bottom: 18px;">
      O <strong>FlyDea GovTech</strong> é uma plataforma SaaS multi-tenant desenvolvida para prefeituras e autarquias municipais que buscam modernizar sua gestão territorial, tributária e de serviços ao cidadão. Seu núcleo é a integração nativa entre o Cadastro Territorial Multifinalitário (CTM), o WebGIS operacional e a Planta Genérica de Valores (PGV/IPTU), com a parcela como entidade central que conecta todos os fluxos administrativos do município.
    </p>

    <!-- Grid de contexto -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
      <div class="card">
        <div style="font-size: 10px; font-weight: 700; color: ${TEXT_MUTED}; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">Público-alvo deste documento</div>
        <div style="font-size: 11px; color: ${TEXT}; line-height: 1.8;">
          • Prefeitos e secretários municipais<br>
          • Equipes técnicas e de TI<br>
          • Gestores de licitações e contratos<br>
          • Jurídico e compliance<br>
          • Parceiros e investidores estratégicos
        </div>
      </div>
      <div class="card card-blue">
        <div style="font-size: 10px; font-weight: 700; color: #1D4ED8; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">Nota de Transparência</div>
        <div style="font-size: 11px; color: #1E40AF; line-height: 1.7;">
          Este documento descreve o estado operacional atual da plataforma. Indicadores de impacto são apresentados como <em>potencial estimado</em> e deverão ser validados em diagnóstico municipal específico.
        </div>
      </div>
    </div>

    <!-- Sumário do documento -->
    <div style="margin-bottom: 4px;">
      <div class="section-divider"></div>
      <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px; color: ${NAVY}; margin-bottom: 12px;">Estrutura do Documento</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px;">
      ${[
        ['1.', 'O Problema', 'Pág. 3'],
        ['2.', 'A Solução', 'Pág. 4'],
        ['3.', 'Arquitetura Funcional', 'Pág. 5'],
        ['4.', 'Módulos do Sistema', 'Pág. 6'],
        ['5.', 'Status Operacional', 'Pág. 7'],
        ['6.', 'Modelo de Implantação', 'Pág. 8'],
        ['7.', 'Valor para a Prefeitura', 'Pág. 9'],
        ['8.', 'Diferenciais Competitivos', 'Pág. 10'],
        ['9.', 'Demonstração Visual (11 telas)', 'Págs. 11–16'],
        ['10.', 'Casos de Uso Concretos', 'Pág. 17'],
        ['11.', 'Próximos Passos', 'Pág. 18'],
      ].map(([n, label, pg]) => `
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9;">
          <div style="display: flex; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: ${BLUE}; min-width: 18px;">${n}</span>
            <span style="font-size: 11px; color: ${TEXT};">${label}</span>
          </div>
          <span style="font-size: 10px; color: ${TEXT_MUTED}; font-weight: 500;">${pg}</span>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 3: O PROBLEMA                                    -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>1. O Problema Municipal</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 3</span>
  </div>
  <div class="page-content">
    <p style="font-size: 12px; color: ${TEXT_MUTED}; margin-bottom: 18px; line-height: 1.6;">
      As prefeituras brasileiras de médio e pequeno porte enfrentam desafios estruturais comuns que limitam a eficácia da gestão territorial, tributária e do atendimento ao cidadão.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      ${[
        ['📊', '#FEF3C7', '#92400E', 'Fragmentação de Dados', 'Informações de imóveis mantidas em planilhas divergentes entre secretarias: o departamento de tributação, obras e meio ambiente operam bases sem integração.'],
        ['📄', '#FEF3C7', '#92400E', 'Processos Manuais e Retrabalho', 'Alvarás, certidões e vistorias dependem de documentos físicos, protocolos em papel e redigitação de dados entre sistemas, gerando atrasos e risco de erro.'],
        ['🗺️', '#DBEAFE', '#1D4ED8', 'Fiscalização Desconectada', 'Fiscais atuam sem integração com o CTM. Relatórios chegam ao escritório com dias de atraso e raramente atualizam a base cadastral automaticamente.'],
        ['💰', '#D1FAE5', '#065F46', 'Baixa Rastreabilidade Fiscal', 'Imóveis ampliados ou reformados continuam tributados pelo cadastro desatualizado, comprometendo a justiça fiscal e reduzindo a arrecadação de IPTU.'],
        ['⏱️', '#EDE9FE', '#5B21B6', 'Lentidão no Licenciamento', 'O tempo de tramitação de alvarás pode se estender por semanas ou meses pela ausência de fluxos digitais integrados entre secretarias.'],
        ['📈', '#F1F5F9', '#475569', 'Ausência de Visibilidade Executiva', 'Gestores tomam decisões com base em relatórios manuais consolidados mensalmente, sem acesso a indicadores operacionais atualizados do município.'],
      ].map(([icon, bg, color, title, desc]) => `
        <div style="background: ${bg}; border-radius: 10px; padding: 13px 14px; border: 1px solid rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 16px;">${icon}</span>
            <strong style="font-size: 12px; color: ${color}; font-family: 'Outfit', sans-serif;">${title}</strong>
          </div>
          <p style="font-size: 11px; color: #374151; line-height: 1.6; margin: 0;">${desc}</p>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 4: A SOLUÇÃO                                     -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>2. A Solução — FlyDea GovTech</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 4</span>
  </div>
  <div class="page-content">
    <p style="font-size: 12px; line-height: 1.7; color: ${TEXT}; margin-bottom: 16px;">
      O FlyDea resolve esses desafios por meio de uma arquitetura integrada que posiciona a <strong>parcela/lote como entidade central</strong> da gestão municipal — o eixo que conecta mapa, tributação, fiscalização, licenciamento e atendimento ao cidadão.
    </p>

    <!-- Arquitetura em camadas -->
    <div style="background: ${SLATE_LIGHT}; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #E2E8F0;">
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 16px; display: inline-block; font-size: 12px; font-weight: 600; color: ${NAVY}; margin-bottom: 8px;">
          🌐 Portal do Cidadão
          <div style="font-size: 10px; font-weight: 400; color: ${TEXT_MUTED}; margin-top: 2px;">Solicitações · Certidões · Ouvidoria · Acompanhamento de Processos</div>
        </div>
        <div style="color: ${TEXT_MUTED}; font-size: 18px; margin: 4px 0;">↕</div>
        <div style="background: ${NAVY}; border-radius: 10px; padding: 10px 16px; color: white; display: inline-block; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
          🏛️ Módulos de Gestão Interna
          <div style="font-size: 10px; font-weight: 400; color: #94A3B8; margin-top: 2px;">CTM · WebGIS · PGV/IPTU · Vistorias · Alvarás · REURB · Relatórios · Dashboard</div>
        </div>
        <div style="color: ${TEXT_MUTED}; font-size: 18px; margin: 4px 0;">↕</div>
        <div style="background: #1E3A5F; border-radius: 10px; padding: 10px 16px; color: #94A3B8; display: inline-block; font-size: 12px; font-weight: 600;">
          🔒 Infraestrutura de Segurança e Conformidade
          <div style="font-size: 10px; font-weight: 400; margin-top: 2px;">Multi-tenant · RBAC · LGPD · Auditoria · Logs imutáveis</div>
        </div>
      </div>
    </div>

    <!-- O lote como eixo -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
      ${[
        ['🗺️', 'WebGIS Operacional', 'O mapa é o ponto de entrada. Cada lote clicado abre sua ficha, vincula vistorias e tributos.'],
        ['📁', 'CTM Integrado', 'Base cadastral única que alimenta simultaneamente fiscalização, tributação e licenciamento.'],
        ['🔐', 'Multi-tenant Seguro', 'Cada prefeitura tem ambiente isolado. Dados de um município são inacessíveis aos demais.'],
      ].map(([icon, title, desc]) => `
        <div class="card" style="text-align: center; padding: 14px 12px;">
          <div style="font-size: 22px; margin-bottom: 8px;">${icon}</div>
          <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px; color: ${NAVY}; margin-bottom: 6px;">${title}</div>
          <div style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5;">${desc}</div>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 5: ARQUITETURA FUNCIONAL                         -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>3. Arquitetura Funcional</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 5</span>
  </div>
  <div class="page-content">
    <p style="font-size: 12px; color: ${TEXT_MUTED}; margin-bottom: 16px; line-height: 1.6;">
      O FlyDea foi construído sobre uma arquitetura moderna e modular, projetada para atender às exigências de confiabilidade, escalabilidade e segurança do setor público municipal.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
      ${[
        ['🖥️', '#EFF6FF', '#1D4ED8', 'Frontend — Next.js App Router', 'Interface web responsiva com navegação por perfil (RBAC-aware), carregamento otimizado de dados cartográficos e componentes reutilizáveis entre secretarias.'],
        ['⚙️', '#F0FDF4', '#065F46', 'Backend — NestJS Modular', 'API REST organizada em módulos independentes por domínio: CTM, GIS, PGV, Alvarás, REURB, Auditoria. Cada módulo evolui sem risco de regressão nos demais.'],
        ['🗄️', '#F5F3FF', '#5B21B6', 'Banco de Dados Territorial', 'MongoDB com suporte nativo a geometrias (Polygon, MultiPolygon), conversão CRS UTM/WGS84, carregamento por viewport (BBOX) e cache Redis.'],
        ['🗺️', '#FFF7ED', '#9A3412', 'WebGIS com Vector Tiles (MVT)', 'Motor geográfico baseado em MVT que suporta renderização de 50.000+ geometrias cadastrais sem degradação de performance nos navegadores.'],
        ['🔑', '#FFF1F2', '#9F1239', 'Autenticação e RBAC', 'Sessões JWT com expiração configurável e refresh automático. Perfis de acesso granulares: Leitor, Operador, Gestor, Administrador.'],
        ['🔒', '#F8FAFC', '#334155', 'Isolamento Multi-Tenant', 'Isolamento lógico por X-Tenant-Id verificado em testes de integração. Dados de um município são tecnicamente inacessíveis por outro tenant.'],
      ].map(([icon, bg, color, title, desc]) => `
        <div style="background: ${bg}; border-radius: 10px; padding: 12px 13px; border: 1px solid rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 6px;">
            <span style="font-size: 14px;">${icon}</span>
            <strong style="font-size: 11px; color: ${color}; font-family: 'Outfit', sans-serif;">${title}</strong>
          </div>
          <p style="font-size: 11px; color: #374151; line-height: 1.6; margin: 0;">${desc}</p>
        </div>
      `).join('')}
    </div>

    <!-- Stack line -->
    <div style="background: ${NAVY}; border-radius: 10px; padding: 12px 18px; display: flex; justify-content: space-around; align-items: center;">
      ${['Next.js 14', 'NestJS', 'MongoDB', 'Redis', 'MapLibre GL', 'JWT + RBAC', 'Docker', 'OpenAPI'].map(t => `
        <div style="text-align: center;">
          <div style="font-size: 11px; font-weight: 600; color: #E2E8F0;">${t}</div>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 6: MÓDULOS DO SISTEMA                            -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>4. Módulos do Sistema</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 6</span>
  </div>
  <div class="page-content">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 9px;">
      ${[
        ['🌐', 'Portal do Cidadão', 'Canal digital 24h para solicitações, certidões, ouvidoria e acompanhamento de processos por protocolo.', 'Cidadão'],
        ['🔑', 'Autenticação e RBAC', 'Login multi-tenant com perfis granulares por secretaria e trilha de auditoria de acessos.', 'Todos os servidores'],
        ['📊', 'Dashboard Administrativo', 'KPIs de parcelas, vistorias, alvarás e REURB. Indicadores em tempo real para gestores.', 'Secretários / Prefeito'],
        ['🗺️', 'WebGIS — Inteligência Geográfica', 'Mapa operacional com camadas de parcelas, zonas fiscais e uso do solo. Não apenas visual.', 'Analistas / Gestores'],
        ['📁', 'CTM — Cadastro Territorial', 'Base unificada de parcelas e logradouros, com busca avançada e integração com WebGIS e tributos.', 'Servidores / Fiscais'],
        ['🔍', 'Vistorias e Fiscalização', 'Ordens de vistoria por lote, checklists em campo, sincronização imediata com o CTM.', 'Fiscais de campo'],
        ['🏘️', 'REURB', 'Fluxo de cadastro, georreferenciamento e emissão de Certidões Fundiárias (CRF).', 'Servidores / Habitação'],
        ['🏗️', 'Alvarás e Licenciamento', 'Tramitação digital de licenças de obras com assinatura eletrônica e QR Code de validação.', 'Construtores / Analistas'],
        ['💰', 'PGV/IPTU', 'Engine de cálculo IPTU com valor venal e alíquotas zonais configuráveis por lei municipal.', 'Tributação / Finanças'],
        ['📋', 'Relatórios e Exportações', 'Relatórios filtráveis em PDF e planilha com histórico auditável de emissões.', 'Gestores / Auditores'],
      ].map(([icon, title, desc, who]) => `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 9px; padding: 10px 12px; display: flex; gap: 10px;">
          <div style="font-size: 18px; flex-shrink: 0; margin-top: 2px;">${icon}</div>
          <div>
            <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 11px; color: ${NAVY}; margin-bottom: 3px;">${title}</div>
            <div style="font-size: 10.5px; color: ${TEXT}; line-height: 1.5; margin-bottom: 4px;">${desc}</div>
            <span style="font-size: 9.5px; background: ${BLUE_PALE}; color: #1D4ED8; padding: 1px 7px; border-radius: 100px; font-weight: 600;">${who}</span>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 7: STATUS OPERACIONAL                            -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>5. Status Operacional da Plataforma</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 7</span>
  </div>
  <div class="page-content">
    <p style="font-size: 12px; color: ${TEXT_MUTED}; margin-bottom: 14px;">Esta seção apresenta o estado atual com transparência técnica, separando o que já pode ser demonstrado do que está em evolução ou depende de dados municipais específicos.</p>

    <!-- Demonstráveis -->
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span class="status-dot dot-green"></span>
        <span style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px; color: #065F46;">Demonstráveis Hoje — Ambiente Ativo</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
        ${['Portal do Cidadão', 'Login Multi-Tenant', 'Dashboard com KPIs', 'WebGIS (300+ lotes SP)', 'CTM — Busca e Edição', 'Vistorias e Checklists', 'REURB — Fluxo Completo', 'Alvarás com Assinatura Digital', 'Relatórios e Exportação', 'RBAC — 5 Perfis', 'Auditoria de Acessos', 'API REST Documentada'].map(f => `
          <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 7px; padding: 6px 10px; display: flex; align-items: center; gap: 6px;">
            <span style="color: #059669; font-size: 10px;">✓</span>
            <span style="font-size: 10.5px; color: #065F46; font-weight: 500;">${f}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Em evolução -->
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span class="status-dot dot-amber"></span>
        <span style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px; color: #92400E;">Em Evolução</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        ${[
          ['Gráficos interativos no Dashboard', 'Visualizações analíticas avançadas em desenvolvimento'],
          ['App móvel offline para fiscais', 'Sincronização robusta sem conexão 3G/4G'],
          ['Importação Shapefile (.shp)', 'Suporte direto a formatos de SIG tradicionais'],
          ['Painel avançado de arrecadação', 'Integração com cobrança digital (PIX, boleto)'],
        ].map(([f, obs]) => `
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 7px; padding: 7px 10px;">
            <div style="font-size: 11px; font-weight: 600; color: #92400E; margin-bottom: 2px;">${f}</div>
            <div style="font-size: 10px; color: #78350F;">${obs}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Dependentes de integração -->
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span class="status-dot dot-blue"></span>
        <span style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px; color: #1D4ED8;">Dependentes de Dados ou Integração Municipal</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        ${[
          ['Cálculo IPTU com lei local', 'Planta de valores e alíquotas específicas do município'],
          ['Importação da base cadastral', 'GIS, CTM ou CadUnico do município'],
          ['Assinatura ICP-Brasil', 'Certificados dos servidores autorizados'],
          ['Integração com 156 nacional', 'API da plataforma de ouvidoria do município'],
        ].map(([f, dep]) => `
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 7px; padding: 7px 10px;">
            <div style="font-size: 11px; font-weight: 600; color: #1D4ED8; margin-bottom: 2px;">${f}</div>
            <div style="font-size: 10px; color: #2563EB;">Depende: ${dep}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 8: MODELO DE IMPLANTAÇÃO                         -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>6. Modelo de Implantação</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 8</span>
  </div>
  <div class="page-content">
    <p style="font-size: 12px; color: ${TEXT_MUTED}; margin-bottom: 14px;">Jornada faseada e assistida, adaptada à realidade de cada município. A sequência garante entrada em produção com dados reais, equipe treinada e fluxos validados.</p>

    ${[
      ['1', '#3B82F6', 'Diagnóstico Municipal e Levantamento de Bases', '2–4 sem.', 'Mapeamento dos sistemas e bases existentes (CTM, IPTU, GIS, 156). Identificação de perfis de usuários, secretarias e requisitos de integração com sistemas legados.'],
      ['2', '#8B5CF6', 'Importação e Saneamento de Dados', '3–6 sem.', 'Importação da base cadastral do município (GeoJSON, Shapefile, planilha). Limpeza, normalização e validação geoespacial. Carga inicial de lotes no WebGIS.'],
      ['3', '#EC4899', 'Parametrização do Tenant Municipal', '1–2 sem.', 'Configuração do ambiente exclusivo do município. Planta de Valores, alíquotas de IPTU, perfis, secretarias, fluxos de aprovação e personalização visual.'],
      ['4', '#F59E0B', 'Treinamento de Servidores e Fiscais', '1–2 sem.', 'Capacitação de servidores no CTM e relatórios. Treinamento de fiscais em vistorias. Workshop para gestores nos dashboards executivos.'],
      ['5', '#10B981', 'Operação Assistida', '4–8 sem.', 'Entrada em produção com acompanhamento técnico dedicado. Monitoramento de fluxos críticos e correções operacionais identificadas em campo.'],
      ['6', '#0EA5E9', 'Evolução, Integrações e Suporte Contínuo', 'Contínuo', 'Integração progressiva com sistemas legados, ativação de novos módulos conforme demanda e suporte técnico com SLA contratual.'],
    ].map(([n, color, title, est, desc]) => `
      <div class="phase-card">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}; color: white; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">${n}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-family: 'Outfit', sans-serif; font-size: 12px; color: ${NAVY};">${title}</strong>
            <span style="font-size: 10px; color: white; background: ${color}; padding: 2px 8px; border-radius: 100px; white-space: nowrap; flex-shrink: 0; margin-left: 8px;">${est}</span>
          </div>
          <p style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5; margin: 0;">${desc}</p>
        </div>
      </div>
    `).join('')}
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 9: VALOR PARA A PREFEITURA                       -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>7. Valor para a Prefeitura</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 9</span>
  </div>
  <div class="page-content">
    ${[
      ['🏛️', '#F0F9FF', '#0369A1', 'Prefeito e Secretários', [
        'Painel executivo com KPIs territoriais, fiscais e operacionais atualizados em tempo real',
        'Reduz decisões baseadas em percepção: substitui relatórios manuais por dados objetivos',
        'Aumenta a rastreabilidade da arrecadação de IPTU por cruzamento de vistoria e cadastro',
        'Apoia processos de conformidade, auditoria e prestação de contas ao TCE e CGU',
      ]],
      ['🖥️', '#F0FDF4', '#15803D', 'Servidores Públicos — Analistas e Engenheiros', [
        'Elimina a redigitação de dados entre sistemas e secretarias',
        'Reduz retrabalho operacional com fluxos digitais integrados entre departamentos',
        'Histórico auditável de cada alteração protege o servidor em eventuais contestações',
        'Aprovação de processos com tramitação integrada entre secretarias',
      ]],
      ['🏃', '#FFFBEB', '#B45309', 'Fiscais de Campo', [
        'Ordens de vistoria recebidas diretamente no dispositivo, vinculadas ao lote',
        'Registro de checklists e fotos sincronizado imediatamente com o CTM',
        'Rastreabilidade completa das vistorias por fiscal, data e resultado',
        'Informações do lote disponíveis antes da visita, reduzindo deslocamentos desnecessários',
      ]],
      ['👤', '#FDF4FF', '#7E22CE', 'Cidadãos e Construtores', [
        'Portal de serviços acessível 24 horas por dia sem necessidade de fila presencial',
        'Consulta de certidões, débitos e processos por protocolo, de qualquer dispositivo',
        'Acompanhamento de alvarás e solicitações de forma transparente e documentada',
        'Resposta mais ágil, com prazos rastreáveis e comprovantes digitais',
      ]],
    ].map(([icon, bg, color, group, items]) => `
      <div style="background: ${bg}; border-radius: 10px; padding: 11px 14px; margin-bottom: 9px; border-left: 3px solid ${color};">
        <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 7px;">
          <span style="font-size: 15px;">${icon}</span>
          <strong style="font-family: 'Outfit', sans-serif; font-size: 12px; color: ${color};">${group}</strong>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px 12px;">
          ${items.map(i => `
            <div style="display: flex; gap: 6px; align-items: flex-start; font-size: 10.5px; color: #374151; line-height: 1.5;">
              <span style="color: ${color}; margin-top: 1px; flex-shrink: 0;">•</span>
              <span>${i}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 10: DIFERENCIAIS COMPETITIVOS                    -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>8. Diferenciais Competitivos</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 10</span>
  </div>
  <div class="page-content">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      ${[
        ['01', 'CTM Integrado ao WebGIS Operacional', 'O mapa não é decorativo. Cada parcela no WebGIS abre sua ficha cadastral, vincula vistorias, tributos e processos. O mapa é o ponto de entrada do sistema.'],
        ['02', 'SaaS Multi-Tenant por Município', 'Cada prefeitura opera em ambiente completamente isolado. Custo de operação menor do que soluções on-premise e sem risco de vazamento entre tenants.'],
        ['03', 'Portal do Cidadão Integrado', 'O portal público não é sistema separado. Solicitações do cidadão criam processos reais no back-office, tramitam entre secretarias e retornam status ao munícipe automaticamente.'],
        ['04', 'Fluxos Digitais de Ponta a Ponta', 'Alvará, vistoria e REURB funcionam de ponta a ponta dentro do sistema. Cada transição de status é registrada, auditável e vinculada ao lote correspondente.'],
        ['05', 'Parcela como Eixo Central', 'O lote conecta obras, fiscalização, tributação e regularização. Sistemas departamentais isolados não conseguem oferecer essa coesão de dados.'],
        ['06', 'Auditoria e Rastreabilidade Nativas', 'Toda ação de escrita gera registro auditável: quem, quando, o quê e em qual tenant. Atende LGPD e facilita prestação de contas a órgãos de controle.'],
        ['07', 'Evolução por Módulos', 'Novos módulos ativados progressivamente sem reimplantação. A prefeitura começa pelo essencial e expande conforme a maturidade operacional.'],
        ['08', 'Preparado para Integrações', 'API REST com OpenAPI/Swagger, suporte a GeoJSON e Shapefile e estrutura de webhooks facilitam integração com sistemas existentes na prefeitura.'],
      ].map(([num, title, desc]) => `
        <div class="card" style="padding: 12px 13px;">
          <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px;">
            <span style="font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 22px; color: #DBEAFE; line-height: 1; flex-shrink: 0;">${num}</span>
            <strong style="font-family: 'Outfit', sans-serif; font-size: 11.5px; color: ${NAVY}; line-height: 1.4;">${title}</strong>
          </div>
          <p style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.6; margin: 0;">${desc}</p>
        </div>
      `).join('')}
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINAS 11–16: DEMONSTRAÇÃO VISUAL DAS TELAS            -->
<!-- ====================================================== -->
${screenshotsData.map((s, i) => `
<div class="pdf-page">
  <div class="page-header">
    <h2>9.${s.num} — ${s.title}</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. ${11 + i}</span>
  </div>
  <div class="page-content" style="display: flex; flex-direction: column; gap: 12px;">

    <!-- Badge info row -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 13px; font-weight: 700; font-family: 'Outfit', sans-serif; color: ${NAVY}; margin-bottom: 3px;">${s.subtitle}</div>
        <p style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5; max-width: 540px; margin: 0;">${s.desc}</p>
      </div>
      <span class="tag" style="background: ${s.userColor}22; color: ${s.userColor}; border: 1px solid ${s.userColor}44; white-space: nowrap; flex-shrink: 0; margin-left: 10px; font-size: 9px;">${s.user}</span>
    </div>

    <!-- Screenshot -->
    <div class="screenshot-img-container">
      ${s.file && imgs[s.file]
        ? `<img src="${imgs[s.file]}" alt="${s.title}" />`
        : `<div style="color: ${TEXT_MUTED}; font-size: 12px; text-align: center;">📷 Captura de tela não disponível</div>`
      }
    </div>

    <!-- Benefit card -->
    <div style="background: ${SLATE_LIGHT}; border-radius: 9px; padding: 11px 14px; border-left: 3px solid ${s.userColor}; display: flex; align-items: flex-start; gap: 10px;">
      <span style="font-size: 16px; flex-shrink: 0;">💡</span>
      <div>
        <div style="font-size: 10px; font-weight: 700; color: ${TEXT_MUTED}; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px;">Benefício Prático</div>
        <div style="font-size: 11.5px; color: ${TEXT}; line-height: 1.5;">${s.benefit}</div>
      </div>
    </div>

    <!-- Production note -->
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; flex-shrink: 0;"></span>
      <span style="font-size: 10px; color: ${TEXT_MUTED};">Captura do ambiente de demonstração ativo: <strong>labspaulo.site</strong> (tenant: demo)</span>
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>
`).join('\n')}

<!-- ====================================================== -->
<!-- PÁGINA 17: CASOS DE USO CONCRETOS                       -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>10. Casos de Uso Concretos</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 17</span>
  </div>
  <div class="page-content">

    <!-- Caso 1 -->
    <div style="margin-bottom: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <span style="background: ${NAVY}; color: white; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 12px; padding: 3px 12px; border-radius: 100px;">Caso 01</span>
        <strong style="font-size: 13px; color: ${NAVY}; font-family: 'Outfit', sans-serif;">Atualização Fiscal por Cruzamento de Vistoria e CTM</strong>
      </div>
      ${[
        'O WebGIS identifica, via análise territorial, um lote cadastrado como terreno baldio com indícios de edificação.',
        'O analista do CTM abre uma ordem de vistoria técnica vinculada ao lote.',
        'O fiscal recebe a ordem em campo, confirma a construção, registra dimensões e anexa fotos georreferenciadas.',
        'O sistema atualiza a ficha do lote no CTM com os novos dados cadastrais.',
        'O engine de IPTU recalcula o valor venal com a Planta Genérica de Valores, corrigindo o lançamento fiscal de forma rastreável.',
      ].map((step, i) => `
        <div class="uc-step">
          <div class="uc-step-num">${i+1}</div>
          <span style="font-size: 11.5px; color: ${TEXT}; line-height: 1.5;">${step}</span>
        </div>
      `).join('')}
      <div style="background: #ECFDF5; border-radius: 8px; padding: 8px 12px; margin-top: 8px; font-size: 11px; color: #065F46; font-style: italic;">
        <strong>Resultado esperado:</strong> Redução de inconsistências cadastrais com impacto positivo na arrecadação — a ser validado em diagnóstico municipal específico.
      </div>
    </div>

    <!-- Caso 2 -->
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <span style="background: #6D28D9; color: white; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 12px; padding: 3px 12px; border-radius: 100px;">Caso 02</span>
        <strong style="font-size: 13px; color: ${NAVY}; font-family: 'Outfit', sans-serif;">Tramitação Digital de Alvará de Construção</strong>
      </div>
      ${[
        'O construtor acessa o Portal do Cidadão e solicita um Alvará de Construção, anexando o projeto arquitetônico digital.',
        'O sistema valida automaticamente se o lote existe no CTM e se está em zona de uso compatível.',
        'O analista de obras revisa o processo, registra o parecer técnico e agenda a vistoria de conformidade.',
        'O fiscal realiza a vistoria e registra o resultado diretamente no sistema.',
        'Com o parecer aprovado, o sistema gera a certidão de Alvará com assinatura digital e QR Code de validação.',
        'O construtor recebe o documento disponível para download diretamente no portal.',
      ].map((step, i) => `
        <div class="uc-step">
          <div class="uc-step-num">${i+1}</div>
          <span style="font-size: 11.5px; color: ${TEXT}; line-height: 1.5;">${step}</span>
        </div>
      `).join('')}
      <div style="background: #EDE9FE; border-radius: 8px; padding: 8px 12px; margin-top: 8px; font-size: 11px; color: #5B21B6; font-style: italic;">
        <strong>Resultado esperado:</strong> Tramitação completamente digital, com rastreabilidade de cada etapa e redução do tempo de espera dependente do volume de demanda de cada secretaria.
      </div>
    </div>

  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

<!-- ====================================================== -->
<!-- PÁGINA 18: PRÓXIMOS PASSOS                              -->
<!-- ====================================================== -->
<div class="pdf-page">
  <div class="page-header">
    <h2>11. Próximos Passos</h2>
    <span class="page-num">FlyDea GovTech Overview · Pág. 18</span>
  </div>
  <div class="page-content">
    <p style="font-size: 12px; color: ${TEXT_MUTED}; margin-bottom: 16px; line-height: 1.6;">
      O FlyDea está disponível para demonstração guiada e para início de um processo estruturado de avaliação técnica e comercial. Propomos a seguinte jornada de engajamento:
    </p>

    <div class="step-card">
      <div class="step-icon-box">🎯</div>
      <div>
        <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px; color: ${NAVY}; margin-bottom: 3px;">1. Demonstração Guiada</div>
        <div style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5;">Apresentação ao vivo do sistema em funcionamento, com foco nos módulos prioritários para o município. Duração: 60 a 90 minutos, presencial ou remoto. Acesso disponível em: <strong>labspaulo.site</strong></div>
      </div>
    </div>

    <div class="step-card">
      <div class="step-icon-box">🗂️</div>
      <div>
        <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px; color: ${NAVY}; margin-bottom: 3px;">2. Levantamento de Dados do Município</div>
        <div style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5;">Reunião técnica para mapear bases existentes, sistemas em uso, volume de parcelas e prioridades de implantação. Sem compromisso de contratação.</div>
      </div>
    </div>

    <div class="step-card">
      <div class="step-icon-box">🔬</div>
      <div>
        <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px; color: ${NAVY}; margin-bottom: 3px;">3. Prova de Conceito</div>
        <div style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5;">Implantação do sistema com dados reais do município em ambiente controlado para validação técnica dos fluxos prioritários (CTM, WebGIS, vistorias). Prazo estimado: 4 a 6 semanas.</div>
      </div>
    </div>

    <div class="step-card">
      <div class="step-icon-box">📋</div>
      <div>
        <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px; color: ${NAVY}; margin-bottom: 3px;">4. Proposta Técnica e Comercial</div>
        <div style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5;">Com base no diagnóstico, proposta formal com escopo de implantação, prazos, SLA e condições comerciais para formalização contratual.</div>
      </div>
    </div>

    <div class="step-card" style="margin-bottom: 0;">
      <div class="step-icon-box">🗓️</div>
      <div>
        <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px; color: ${NAVY}; margin-bottom: 3px;">5. Planejamento de Implantação</div>
        <div style="font-size: 11px; color: ${TEXT_MUTED}; line-height: 1.5;">Plano detalhado em 6 fases com cronograma, responsáveis, critérios de aceite e plano de treinamento adaptado à realidade do município.</div>
      </div>
    </div>

    <!-- CTA final -->
    <div style="background: ${NAVY}; border-radius: 12px; padding: 16px 20px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 14px; color: white; margin-bottom: 3px;">Inicie o processo agora</div>
        <div style="font-size: 11px; color: #94A3B8;">Paulo — Engenharia e DevOps · FlyDea GovTech · Catanduva - SP</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; font-weight: 600; color: #60A5FA; margin-bottom: 2px;">🌐 labspaulo.site</div>
        <div style="font-size: 10px; color: #64748B;">Ambiente de demonstração ativo</div>
      </div>
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-logo">FlyDea GovTech</span>
    <span>Documento Técnico e Comercial · v2.0 · Maio 2026 · Confidencial</span>
  </div>
</div>

</body>
</html>`;
}

generatePdf().catch(err => {
  console.error('Erro fatal na geração do PDF:', err);
  process.exit(1);
});
