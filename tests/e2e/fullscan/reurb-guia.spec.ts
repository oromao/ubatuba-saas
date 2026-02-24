import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';

const storageDir = path.resolve(process.cwd(), 'storage');
const fixtureDir = path.resolve(process.cwd(), 'tests', 'fixtures', 'reurb');
const rolesPath = path.resolve(storageDir, 'roles.json');
const API_URL = process.env.API_URL || 'http://localhost:4000';

const ensureSession = async (page: any) => {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === 'admin');
  if (!profile) throw new Error('Perfil admin nao encontrado');
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: profile.email,
      password: profile.password,
      tenantSlug: roles.tenant,
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Falha login admin: ${response.status}`);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (tokens) => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken: payload.data.accessToken, refreshToken: payload.data.refreshToken, tenantId: payload.data.tenantId },
  );
};

test.describe('reurb guia ponta a ponta', () => {
  test.use({ storageState: path.resolve(storageDir, 'admin.json') });

  test('@reurb guia completo conforme edital', async ({ page }, testInfo) => {
    await page.route('**/tenants/**', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': '*',
          },
          body: '',
        });
        return;
      }
      if (method === 'PUT') {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: '',
        });
        return;
      }
      await route.continue();
    });

    await test.step('Login e ativacao REURB', async () => {
      await ensureSession(page);
      await page.goto('/app/reurb', { waitUntil: 'domcontentloaded' });

      const enableButton = page.getByRole('button', { name: /Ativar REURB/i });
      if (await enableButton.isVisible().catch(() => false)) {
        await Promise.all([
          page.waitForResponse((res) => res.url().includes('/reurb/tenant-config') && res.request().method() === 'PUT'),
          enableButton.click(),
        ]);
      }
    });

    const projectName = `Projeto REURB ${Date.now()}`;

    await test.step('Criar projeto REURB-S', async () => {
      await page.getByPlaceholder('Nome do projeto').fill(projectName);
      await page.getByPlaceholder('Area / bairro').fill('Centro');
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/projects') && res.request().method() === 'POST'),
        page.getByRole('button', { name: 'Criar projeto' }).click(),
      ]);
    });

    await test.step('Selecionar projeto', async () => {
      const projectButton = page.getByRole('button', { name: projectName });
      await projectButton.waitFor();
      await projectButton.click();
    });

    await test.step('Cadastrar familias + importar CSV', async () => {
      const familyCard = page.locator('div', {
        has: page.getByRole('heading', { name: 'Cadastro de familias beneficiarias' }),
      });
      await familyCard.getByPlaceholder('Codigo da familia', { exact: true }).fill(`FAM-${Date.now()}`);
      await familyCard.getByPlaceholder('Nucleo', { exact: true }).fill('N1');
      await familyCard.getByPlaceholder('Responsavel', { exact: true }).fill('Maria Silva');
      await familyCard.getByPlaceholder('CPF', { exact: true }).fill('12345678900');
      await familyCard.locator('select').filter({ hasText: /Pendente/i }).selectOption('APTA');
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/families') && res.request().method() === 'POST'),
        familyCard.getByRole('button', { name: 'Cadastrar familia' }).click(),
      ]);

      await familyCard.getByPlaceholder('CSV (familyCode,nucleus,responsibleName,cpf,address)').fill(
        [
          'familyCode,nucleus,responsibleName,cpf,address,status',
          `FAM-CSV-${Date.now()},N2,Familia CSV,00011122233,Rua B,APTA`,
        ].join('\n'),
      );
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/families/import.csv')),
        familyCard.getByRole('button', { name: 'Importar CSV' }).click(),
      ]);
    });

    await test.step('Cadastrar unidades e vincular', async () => {
      const unitCard = page.locator('div', { has: page.getByRole('heading', { name: 'Unidades / Imoveis' }) });
      await unitCard.getByPlaceholder('Codigo da unidade').fill(`U-${Date.now()}`);
      await unitCard.getByPlaceholder('Quadra').fill('Q1');
      await unitCard.getByPlaceholder('Lote').fill('L1');
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/units') && res.request().method() === 'POST'),
        unitCard.getByRole('button', { name: 'Cadastrar unidade' }).click(),
      ]);
    });

    await test.step('Upload de documentos (projeto/familia/unidade)', async () => {
      await page.getByPlaceholder('Tipo de documento (ex: planta, memorial)').fill('Planta');
      const projectDocSection = page.getByText('Documento do projeto', { exact: true }).locator('..');
      await projectDocSection.locator('input[type="file"]').setInputFiles(path.join(fixtureDir, 'planta.txt'));
      const presignProjectDoc = page.waitForResponse(
        (res) => res.url().includes('/reurb/project-documents/presign-upload') && res.request().method() === 'POST',
      );
      await projectDocSection.getByRole('button', { name: 'Enviar documento' }).click();
      await presignProjectDoc;

      const familyDocSection = page.getByText('Documento de familia', { exact: true }).locator('..');
      await familyDocSection.getByRole('combobox').selectOption({ index: 1 });
      await familyDocSection.getByPlaceholder('Tipo de documento (ex: RG, CPF, comprovante)').fill('RG');
      await familyDocSection.locator('input[type="file"]').setInputFiles(path.join(fixtureDir, 'rg.txt'));
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/documents/presign-upload')),
        familyDocSection.getByRole('button', { name: 'Enviar documento' }).click(),
      ]);

      const unitDocSection = page.getByText('Documento da unidade', { exact: true }).locator('..');
      await unitDocSection.getByRole('combobox').selectOption({ index: 1 });
      await unitDocSection.getByPlaceholder('Tipo de documento (ex: foto, memorial)').fill('Foto');
      await unitDocSection.locator('input[type="file"]').setInputFiles(path.join(fixtureDir, 'foto.txt'));
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/unit-documents/presign-upload')),
        unitDocSection.getByRole('button', { name: 'Enviar documento' }).click(),
      ]);
    });

    await test.step('Notificacao + evidencia', async () => {
      await page.getByPlaceholder('Nome do template').fill('Notificacao Inicial');
      await page.getByPlaceholder('Assunto').fill('Convocacao {{nome}}');
      await page.getByPlaceholder('Corpo (use {{variavel}})').fill('Prezado {{nome}}, favor comparecer.');
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/notification-templates') && res.request().method() === 'POST'),
        page.getByRole('button', { name: 'Criar template' }).click(),
      ]);

      const templateSelect = page.getByRole('combobox').filter({ hasText: /Selecione um template/ });
      await templateSelect.waitFor();
      const templateSelectHandle = await templateSelect.elementHandle();
      if (!templateSelectHandle) throw new Error('Template select nao encontrado');
      await page.waitForFunction((el) => (el as HTMLSelectElement).options.length > 1, templateSelectHandle);
      await templateSelect.selectOption({ index: 1 });
      await page.getByPlaceholder('Email destinatario').fill('teste@demo.local');
      await page.getByPlaceholder('Variaveis JSON (ex: {"nome":"Maria"})').fill('{"nome":"Maria"}');
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/notifications/send-email')),
        page.getByRole('button', { name: 'Enviar notificacao' }).click(),
      ]);

      await page.getByRole('combobox').filter({ hasText: /Selecione uma notificacao/ }).selectOption({ index: 1 });
      const evidenceSection = page.getByText('Evidencia de notificacao', { exact: true }).locator('..');
      await evidenceSection.locator('input[type="file"]').setInputFiles(path.join(fixtureDir, 'evidencia_ar.txt'));
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/notifications/') && res.request().method() === 'POST'),
        page.getByRole('button', { name: 'Anexar evidencia' }).click(),
      ]);
    });

    await test.step('Exportacoes obrigatorias + pacote cartorio', async () => {
      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/families/export.csv')),
        page.getByRole('button', { name: 'Exportar Banco Tabulado (CSV)' }).click(),
      ]);

      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/families/export.json')),
        page.getByRole('button', { name: 'Exportar Banco Tabulado (JSON)' }).click(),
      ]);

      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/planilha-sintese/generate')),
        page.getByRole('button', { name: 'Gerar Planilha Sintese' }).click(),
      ]);

      await Promise.all([
        page.waitForResponse((res) => res.url().includes('/reurb/cartorio/package')),
        page.getByRole('button', { name: 'Gerar Pacote Cartorio (ZIP)' }).click(),
      ]);
    });

    await page.screenshot({ path: testInfo.outputPath('reurb-guia.png'), fullPage: true });
  });
});
