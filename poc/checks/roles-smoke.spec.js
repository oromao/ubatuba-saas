const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';
const TENANT = process.env.TEST_TENANT || 'demo';
const ADMIN_EMAIL = process.env.TEST_EMAIL || 'admin@demo.local';
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || 'Admin@12345';

const runId = Date.now();

const profiles = {
  admin: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'ADMIN' },
  gestor: { email: `gestor.smoke.${runId}@demo.local`, password: 'Gestor@12345', role: 'GESTOR' },
  operador: { email: `operador.smoke.${runId}@demo.local`, password: 'Operador@12345', role: 'OPERADOR' },
  campo: { email: `campo.smoke.${runId}@demo.local`, password: 'Campo@12345', role: 'OPERADOR' },
  leitor: { email: `leitor.smoke.${runId}@demo.local`, password: 'Leitor@12345', role: 'LEITOR' },
};

const auth = {};

async function apiJson(request, method, path, body, headers = {}) {
  const res = await request.fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    ...(body ? { data: body } : {}),
  });
  const payload = await res.json().catch(() => ({}));
  return { res, payload: payload?.data ?? payload };
}

async function loginApi(request, profile) {
  const { res, payload } = await apiJson(request, 'POST', '/auth/login', {
    email: profile.email,
    password: profile.password,
    tenantSlug: TENANT,
  });
  expect(res.status(), `login ${profile.email}`).toBe(201);
  return payload;
}

async function loginUiFromToken(page, tokens) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((value) => {
    window.localStorage.setItem('accessToken', value.accessToken);
    window.localStorage.setItem('refreshToken', value.refreshToken);
    window.localStorage.setItem('tenantId', value.tenantId);
  }, tokens);
  await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Painel Executivo').first().waitFor({ state: 'visible' });
}

test.beforeAll(async ({ request }) => {
  auth.admin = await loginApi(request, profiles.admin);

  for (const key of ['gestor', 'operador', 'campo', 'leitor']) {
    const profile = profiles[key];

    const { res: createUserRes, payload: createUserPayload } = await apiJson(
      request,
      'POST',
      '/admin/users',
      { email: profile.email, password: profile.password },
      {
        Authorization: `Bearer ${auth.admin.accessToken}`,
        'X-Tenant-Id': auth.admin.tenantId,
      },
    );
    expect([200, 201]).toContain(createUserRes.status());
    const userId = createUserPayload?.id || createUserPayload?._id;
    expect(userId, `id do usuario para ${profile.email}`).toBeTruthy();

    const { res: membershipRes } = await apiJson(
      request,
      'POST',
      '/admin/memberships',
      { tenantId: auth.admin.tenantId, userId, role: profile.role },
      {
        Authorization: `Bearer ${auth.admin.accessToken}`,
        'X-Tenant-Id': auth.admin.tenantId,
      },
    );
    expect([200, 201]).toContain(membershipRes.status());

    auth[key] = await loginApi(request, profile);
  }
});

test('@smoke @roles admin navega modulos principais', async ({ page }) => {
  await loginUiFromToken(page, auth.admin);

  await page.getByTestId('nav-link-app-dashboard').click();
  await page.getByText('Painel Executivo').first().waitFor({ state: 'visible' });

  await page.getByTestId('nav-link-app-levantamentos').click();
  await page.getByText('Levantamentos & Entregaveis').first().waitFor({ state: 'visible' });

  await page.getByTestId('global-search-open').click();
  await page.getByTestId('global-search-input').fill('Parcelas');
  await page.getByText('Parcelas').first().waitFor({ state: 'visible' });
});

test('@smoke @roles operador acessa mapas e mobile', async ({ page }) => {
  await loginUiFromToken(page, auth.operador);

  await page.goto(`${BASE_URL}/app/ctm/parcelas`, { waitUntil: 'domcontentloaded' });
  await page.getByText('CTM - Parcelas').first().waitFor({ state: 'visible' });

  await page.goto(`${BASE_URL}/mobile`, { waitUntil: 'domcontentloaded' });
  await page.getByText('FlyDea Mobile Campo').first().waitFor({ state: 'visible' });
  await page.getByTestId('mobile-search-input').waitFor({ state: 'visible' });
});

test('@smoke @roles leitor menu limitado e sem escrita mobile', async ({ page, request }) => {
  await loginUiFromToken(page, auth.leitor);

  await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('global-search-open').click();
  await page.getByTestId('global-search-input').fill('Parcelas');
  await expect(page.getByText('Parcelas', { exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page.goto(`${BASE_URL}/mobile`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Acesso restrito').first().waitFor({ state: 'visible' });

  const { res } = await apiJson(
    request,
    'POST',
    '/mobile/ctm-sync',
    { items: [] },
    {
      Authorization: `Bearer ${auth.leitor.accessToken}`,
      'X-Tenant-Id': auth.leitor.tenantId,
    },
  );
  expect(res.status()).toBe(403);
});
