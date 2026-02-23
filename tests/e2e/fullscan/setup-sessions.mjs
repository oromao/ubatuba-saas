#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';
const TENANT = process.env.TEST_TENANT || 'demo';
const ADMIN_EMAIL = process.env.TEST_EMAIL || 'admin@demo.local';
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || 'Admin@12345';

const runId = Date.now();
const storageDir = path.resolve(process.cwd(), 'storage');
const rolesFile = path.resolve(process.cwd(), 'storage/roles.json');

const roleProfiles = [
  { key: 'admin', role: 'ADMIN', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  { key: 'gestor', role: 'GESTOR', email: `gestor.scan.${runId}@demo.local`, password: 'Gestor@12345' },
  { key: 'operador', role: 'OPERADOR', email: `operador.scan.${runId}@demo.local`, password: 'Operador@12345' },
  { key: 'leitor', role: 'LEITOR', email: `leitor.scan.${runId}@demo.local`, password: 'Leitor@12345' },
];

const api = async ({ method = 'GET', endpoint, token, tenantId, body }) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, data: payload?.data ?? payload };
};

const createStorageState = async (tokens, key) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((value) => {
    localStorage.setItem('accessToken', value.accessToken);
    localStorage.setItem('refreshToken', value.refreshToken);
    localStorage.setItem('tenantId', value.tenantId);
  }, tokens);
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
  await context.storageState({ path: path.join(storageDir, `${key}.json`) });
  await browser.close();
};

await fs.mkdir(storageDir, { recursive: true });

const adminLogin = await api({
  method: 'POST',
  endpoint: '/auth/login',
  body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, tenantSlug: TENANT },
});
if (adminLogin.status !== 201) {
  throw new Error(`Falha login admin: ${adminLogin.status}`);
}

const adminToken = adminLogin.data?.accessToken;
const tenantId = adminLogin.data?.tenantId;
if (!adminToken || !tenantId) throw new Error('Token/tenant admin ausente');

for (const profile of roleProfiles.filter((p) => p.key !== 'admin')) {
  const created = await api({
    method: 'POST',
    endpoint: '/admin/users',
    token: adminToken,
    tenantId,
    body: { email: profile.email, password: profile.password },
  });
  if (![200, 201].includes(created.status)) {
    throw new Error(`Falha criar user ${profile.key}: ${created.status}`);
  }

  const userId = created.data?.id ?? created.data?._id;
  if (!userId) throw new Error(`ID ausente para role ${profile.key}`);

  const membership = await api({
    method: 'POST',
    endpoint: '/admin/memberships',
    token: adminToken,
    tenantId,
    body: { tenantId, userId, role: profile.role },
  });
  if (![200, 201].includes(membership.status)) {
    throw new Error(`Falha membership ${profile.key}: ${membership.status}`);
  }
}

const auth = {};
for (const profile of roleProfiles) {
  const login = await api({
    method: 'POST',
    endpoint: '/auth/login',
    body: { email: profile.email, password: profile.password, tenantSlug: TENANT },
  });
  if (login.status !== 201) {
    throw new Error(`Falha login ${profile.key}: ${login.status}`);
  }
  auth[profile.key] = login.data;
  await createStorageState(login.data, profile.key);
}

await fs.writeFile(
  rolesFile,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), tenant: TENANT, profiles: roleProfiles }, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      storageDir,
      files: roleProfiles.map((p) => path.join(storageDir, `${p.key}.json`)),
      rolesFile,
    },
    null,
    2,
  ),
);
