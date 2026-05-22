import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = 'https://labspaulo.site';
const storageDir = path.resolve(process.cwd(), 'storage');
const adminSessionPath = path.join(storageDir, 'admin.json');
const outputDir = path.resolve(process.cwd(), 'docs/screenshots/govtech');

async function run() {
  console.log('Iniciando captura de telas GovTech em Produção...');
  
  // Garantir diretório de saída
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(storageDir, { recursive: true });
  
  // Lançar navegador com suporte a WebGL e GPU SwiftShader no modo headless
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--ignore-gpu-blocklist',
      '--enable-webgl'
    ]
  });
  
  // Criar um único contexto para toda a operação
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  // 1. Portal Público
  console.log('Capturando: Portal Público...');
  await page.goto(`${BASE_URL}/cidadao`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // tempo de acomodação do layout
  await page.screenshot({ path: path.join(outputDir, '01_portal_publico.png') });
  
  // 2. Tela de Login
  console.log('Capturando: Tela de Login...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDir, '02_login.png') });

  // 3. Fazer login programático real na produção
  console.log(`Efetuando login programático na produção em ${BASE_URL}...`);
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    
    // Preencher campos
    await page.fill('input[type="email"]', 'admin@sp.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.fill('input[name="tenantSlug"]', 'saopaulo');
    
    console.log('Preencheu campos de login. Enviando formulário...');
    
    // Clicar em Entrar e esperar o redirecionamento
    await page.click('button[type="submit"]');
    
    // Esperar a URL mudar para /app/dashboard
    console.log('Aguardando redirecionamento para o Dashboard...');
    await page.waitForURL('**/app/dashboard', { timeout: 25000 });
    
    // Esperar um pouco para a sessão e os dados serem hidratados na UI
    await page.waitForTimeout(6000);
    
    // Salvar o estado da sessão autenticada (cookies e localStorage) para fins de compatibilidade
    console.log(`Salvando estado de sessão em ${adminSessionPath}...`);
    await context.storageState({ path: adminSessionPath });
    console.log('Sessão de produção gerada e salva com sucesso!');
  } catch (loginErr) {
    console.error('Falha crítica ao tentar efetuar login automático:', loginErr.message);
    await browser.close();
    throw loginErr;
  }

  // 4. Dashboard Administrativo (já estamos nele, mas vamos tirar o print com dados hidratados)
  console.log('Capturando: Dashboard Administrativo...');
  await page.screenshot({ path: path.join(outputDir, '03_dashboard.png') });

  // 5. Mapa WebGIS interativo
  console.log('Capturando: Mapa WebGIS...');
  await page.goto(`${BASE_URL}/app/maps`, { waitUntil: 'networkidle' });
  
  // Aguardar deterministicamente que as geometrias das parcelas de SP sejam carregadas e renderizadas pelo MapLibre
  try {
    console.log('Aguardando até que o WebGIS termine de carregar as parcelas de São Paulo...');
    await page.waitForFunction(() => {
      const probe = window.__gisScaleProbe;
      return probe && probe.builtInParcelSourceReady === true;
    }, { timeout: 35000 });
    console.log('WebGIS detectou parcelas de São Paulo carregadas com sucesso!');
  } catch (probeErr) {
    console.warn('Timeout aguardando __gisScaleProbe.builtInParcelSourceReady. Tentando esperar mais 10s...');
    await page.waitForTimeout(10000);
  }
  
  // Dar um tempo extra (8 segundos) para renderizar visualmente todos os polígonos e tiles na tela
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.join(outputDir, '04_webgis.png') });

  // 6. Listagem de Parcelas (CTM)
  console.log('Capturando: Listagem de Parcelas (CTM)...');
  await page.goto(`${BASE_URL}/app/ctm/parcelas`, { waitUntil: 'networkidle' });
  
  // Aguardar explicitamente a tabela carregar linhas da API remota
  let hasParcels = false;
  try {
    await page.waitForSelector('table tbody tr', { timeout: 25000 });
    console.log('Tabela de parcelas carregada com sucesso da API.');
    hasParcels = true;
  } catch (timeoutErr) {
    console.warn('Timeout aguardando linhas da tabela de parcelas (ou sem dados). Tentando prosseguir...');
  }
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outputDir, '05_ctm_parcelas.png') });

  // 7. Detalhes de uma Parcela (Descobrir ID dinamicamente clicando na primeira linha)
  console.log('Capturando: Detalhes da Parcela...');
  if (hasParcels) {
    try {
      const row = page.locator('table tbody tr').first();
      if (await row.isVisible()) {
        console.log('Primeira linha de parcela encontrada. Clicando...');
        await row.click();
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
        
        // Aguardar o mini mapa da ficha cadastral carregar suas parcelas também
        try {
          console.log('Aguardando até que o mini mapa termine de carregar as parcelas locais...');
          await page.waitForFunction(() => {
            const probe = window.__gisScaleProbe;
            return probe && probe.builtInParcelSourceReady === true;
          }, { timeout: 15000 });
          console.log('Mini mapa detectou parcelas de São Paulo carregadas!');
        } catch (mErr) {
          console.warn('Timeout no mini mapa. Prosseguindo com tempo fixo...');
        }
        
        await page.waitForTimeout(10000); // Tempo para o mini mapa renderizar e os gráficos de IPTU/PGV estabilizarem
        await page.screenshot({ path: path.join(outputDir, '06_detalhe_parcela.png') });
        console.log(`Detalhe da parcela capturado com sucesso! URL atual: ${page.url()}`);
      } else {
        console.warn('Tabela de parcelas visível mas linha não visível. Pulando print de detalhe da parcela.');
      }
    } catch (err) {
      console.error('Falha ao capturar detalhe da parcela:', err.message);
    }
  } else {
    console.warn('Tabela de parcelas vazia. Pulando detalhe da parcela.');
  }

  // 8. Ordens de Vistoria
  console.log('Capturando: Módulo de Vistorias...');
  await page.goto(`${BASE_URL}/app/ctm/vistorias`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outputDir, '07_vistorias.png') });

  // 9. Listagem de Logradouros
  console.log('Capturando: Listagem de Logradouros...');
  await page.goto(`${BASE_URL}/app/ctm/logradouros`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outputDir, '08_logradouros.png') });

  // 10. Regularização Fundiária (REURB)
  console.log('Capturando: Regularização Fundiária (REURB)...');
  await page.goto(`${BASE_URL}/app/reurb`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outputDir, '09_reurb.png') });

  // 11. Alvarás e Aprovações
  console.log('Capturando: Alvarás e Aprovações...');
  await page.goto(`${BASE_URL}/app/aprovacao`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outputDir, '10_alvaras.png') });

  // 12. Módulo de Relatórios
  console.log('Capturando: Módulo de Relatórios...');
  await page.goto(`${BASE_URL}/app/relatorios`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outputDir, '11_relatorios.png') });

  await browser.close();
  console.log('Todas as capturas de tela foram concluídas com sucesso!');
  console.log(`Arquivos salvos em: ${outputDir}`);
}

run().catch((err) => {
  console.error('Erro catastrófico na automação de capturas:', err);
  process.exit(1);
});
