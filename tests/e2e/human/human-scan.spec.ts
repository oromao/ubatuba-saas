import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

type Profile = {
  key: string;
  role: 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'LEITOR';
  email: string;
  password: string;
};

const API_URL = process.env.API_URL || 'http://localhost:4000';
const TENANT = process.env.TEST_TENANT || 'demo';
const ADMIN_EMAIL = process.env.TEST_EMAIL || 'admin@demo.local';
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || 'Admin@12345';
const TEST_MODE = String(process.env.TEST_MODE || 'false') === 'true';
const runId = Date.now();

const profiles: Profile[] = [
  { key: 'admin', role: 'ADMIN', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  { key: 'gestor', role: 'GESTOR', email: `gestor.human.${runId}@demo.local`, password: 'Gestor@12345' },
  { key: 'operador', role: 'OPERADOR', email: `operador.human.${runId}@demo.local`, password: 'Operador@12345' },
  { key: 'leitor', role: 'LEITOR', email: `leitor.human.${runId}@demo.local`, password: 'Leitor@12345' },
];

const defaultRoutes = [
  '/app/dashboard',
  '/app/maps',
  '/app/levantamentos',
  '/app/ctm/parcelas',
  '/app/ctm/logradouros',
  '/app/ctm/mobiliario',
  '/app/pgv/zonas',
  '/app/pgv/faces',
  '/app/pgv/fatores',
  '/app/pgv/relatorio',
  '/app/integracoes',
  '/app/cartas',
  '/app/compliance',
  '/app/assets',
  '/app/alerts',
  '/app/processes',
  '/app/poc',
  '/mobile',
];

const destructivePattern = /(excluir|apagar|remover|deletar|delete|trash|encerrar|finalizar lote|sair|logout)/i;
const scanOutput: Array<Record<string, unknown>> = [];
test.setTimeout(6 * 60_000);

async function apiCall(request: any, method: string, endpoint: string, body?: unknown, token?: string, tenantId?: string) {
  const response = await request.fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
    },
    ...(body ? { data: body } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status(), data: payload?.data ?? payload };
}

async function setupProfiles(request: any) {
  const adminLogin = await apiCall(request, 'POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    tenantSlug: TENANT,
  });
  expect(adminLogin.status).toBe(201);
  const adminToken = adminLogin.data.accessToken;
  const tenantId = adminLogin.data.tenantId;

  for (const profile of profiles.filter((p) => p.key !== 'admin')) {
    const user = await apiCall(
      request,
      'POST',
      '/admin/users',
      { email: profile.email, password: profile.password },
      adminToken,
      tenantId,
    );
    expect([200, 201]).toContain(user.status);

    const userId = user.data?.id || user.data?._id;
    expect(userId).toBeTruthy();

    const membership = await apiCall(
      request,
      'POST',
      '/admin/memberships',
      { tenantId, userId, role: profile.role },
      adminToken,
      tenantId,
    );
    expect([200, 201]).toContain(membership.status);
  }
}

async function humanType(page: any, locator: any, value: string) {
  await locator.scrollIntoViewIfNeeded();
  await locator.hover();
  await locator.click();
  await locator.fill('');
  await page.keyboard.type(value, { delay: 45 });
}

async function loginHuman(page: any, profile: Profile) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await humanType(page, page.locator('input[type="email"]'), profile.email);
  await humanType(page, page.locator('input[type="password"]'), profile.password);
  await humanType(page, page.locator('input[placeholder="ex: prefeitura-ubatuba"]'), TENANT);

  await page.getByRole('button', { name: 'Entrar' }).hover();
  await Promise.all([
    page.waitForResponse((res: any) => res.url().includes('/auth/login') && res.request().method() === 'POST'),
    page.getByRole('button', { name: 'Entrar' }).click(),
  ]);
  await page.waitForURL(/\/app\/dashboard/);
  await expect(page.getByText('Painel Executivo').first()).toBeVisible();
}

async function discoverRoutes(page: any) {
  const discovered = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href^="/app"], a[href^="/mobile"]'))
      .map((el) => el.getAttribute('href'))
      .filter(Boolean) as string[],
  );
  return [...new Set([...defaultRoutes, ...discovered])];
}

async function interactPage(page: any, testInfo: any, profileKey: string, route: string) {
  const beforePath = testInfo.outputPath(`${profileKey}-${route.replace(/[^a-z0-9]/gi, '-')}-before.png`);
  const afterPath = testInfo.outputPath(`${profileKey}-${route.replace(/[^a-z0-9]/gi, '-')}-after.png`);

  const consoleErrors: string[] = [];
  const serverErrors: Array<{ status: number; url: string }> = [];

  const consoleHandler = (msg: any) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  };
  const responseHandler = (res: any) => {
    const status = res.status();
    const url = res.url();
    if (status >= 500 || (status >= 400 && ![401, 403, 404].includes(status))) {
      serverErrors.push({ status, url });
    }
  };

  page.on('console', consoleHandler);
  page.on('response', responseHandler);

  const actions: Array<{ kind: string; label: string }> = [];

  try {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: beforePath, fullPage: true });

    const inputs = page.locator('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])');
    const inputCount = await inputs.count();
    for (let i = 0; i < Math.min(inputCount, 3); i += 1) {
      const input = inputs.nth(i);
      const handle = await input.elementHandle();
      if (!handle) continue;
      const type = (await handle.getAttribute('type')) || 'text';
      const readOnly = await handle.getAttribute('readonly');
      if (readOnly) continue;
      if (type === 'checkbox' || type === 'radio') {
        await input.hover();
        await input.click();
        actions.push({ kind: 'toggle', label: `input-${i}` });
        continue;
      }
      const value = type === 'email' ? `qa.human.${runId}@demo.local` : type === 'number' ? '123' : `QA Human ${runId}`;
      await humanType(page, input, value);
      actions.push({ kind: 'input', label: `input-${i}` });
    }

    const selects = page.locator('select:not([disabled])');
    const selectCount = await selects.count();
    for (let i = 0; i < Math.min(selectCount, 2); i += 1) {
      const select = selects.nth(i);
      const options = await select.locator('option').all();
      if (options.length > 1) {
        await select.hover();
        const value = await options[1].getAttribute('value');
        if (value !== null) {
          await select.selectOption(value);
          actions.push({ kind: 'select', label: `select-${i}` });
        }
      }
    }

    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 6); i += 1) {
      const button = buttons.nth(i);
      const label = ((await button.textContent().catch(() => '')) || '').trim();
      if (!label) continue;
      if (/dashboard|mapas|levantamentos|parcelas|logradouros|mobiliario|zonas|faces|fatores|relatorio|integracoes|cartas|compliance|poc|ativos|alertas|processos|mobile/i.test(label)) {
        continue;
      }

      const disabled = !(await button.isEnabled().catch(() => false));
      if (disabled) continue;

      await button.scrollIntoViewIfNeeded();
      await button.hover();

      if (destructivePattern.test(label) && !TEST_MODE) {
        await button.click().catch(() => undefined);
        const cancelBtn = page.getByRole('button', { name: /cancelar|nao|fechar|voltar/i }).first();
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.hover();
          await cancelBtn.click().catch(() => undefined);
        }
        actions.push({ kind: 'destructive-cancelled', label });
        continue;
      }

      await button.click().catch(() => undefined);
      actions.push({ kind: 'button', label });
      await page.waitForTimeout(150);
    }

    const escCloseTargets = page.locator('[role="dialog"], [data-state="open"]');
    if ((await escCloseTargets.count()) > 0) {
      await page.keyboard.press('Escape').catch(() => undefined);
      await page.waitForTimeout(120);
    }

    await page.screenshot({ path: afterPath, fullPage: true });
  } finally {
    page.off('console', consoleHandler);
    page.off('response', responseHandler);
  }

  scanOutput.push({
    profile: profileKey,
    route,
    url: page.url(),
    actions,
    consoleErrors,
    serverErrors,
    beforePath,
    afterPath,
    at: new Date().toISOString(),
  });
}

test.beforeAll(async ({ request }) => {
  await setupProfiles(request);
});

for (const profile of profiles) {
  test(`@human @scan @${profile.key} fluxo ponta a ponta`, async ({ page }, testInfo) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/FlyDea|GeoInteligencia|Geointeligencia/i);

    await loginHuman(page, profile);

    const routes = await discoverRoutes(page);
    const prioritized = profile.key === 'admin' ? routes : routes.slice(0, 10);
    for (const route of prioritized) {
      await interactPage(page, testInfo, profile.key, route);
    }

    const logoutBtn = page.getByTestId('sidebar-logout').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.hover();
      await logoutBtn.click();
      await page.waitForURL(/\/login/);
    }

    const blockedErrors = scanOutput
      .filter((item) => item.profile === profile.key)
      .flatMap((item) => (item.consoleErrors as string[]).filter((msg) => !/WebGL|favicon|extensions/i.test(msg)));
    const serverErrors = scanOutput
      .filter((item) => item.profile === profile.key)
      .flatMap((item) => item.serverErrors as Array<{ status: number; url: string }>);

    expect(serverErrors.length).toBe(0);
    expect(blockedErrors.length).toBeLessThan(40);
  });
}

test.afterAll(async () => {
  const target = path.resolve(process.cwd(), 'docs/human-scan-report.json');
  await fs.writeFile(target, `${JSON.stringify(scanOutput, null, 2)}\n`);
});
