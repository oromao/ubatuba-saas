import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const storageDir = path.resolve(process.cwd(), 'storage');
const rolesPath = path.resolve(storageDir, 'roles.json');

const loginApi = async (roleKey: string) => {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === roleKey);
  if (!profile) throw new Error(`Perfil ${roleKey} nao encontrado`);

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
  if (!response.ok) {
    throw new Error(`Falha login ${roleKey}: ${response.status}`);
  }

  return {
    token: payload.data.accessToken as string,
    tenantId: payload.data.tenantId as string,
  };
};

const apiFetch = async (token: string, tenantId: string, path: string, init: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId,
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, data: payload?.data ?? payload };
};

test.describe('reurb rbac api', () => {
  test('admin e gestor podem criar e exportar', async () => {
    for (const roleKey of ['admin', 'gestor']) {
      const { token, tenantId } = await loginApi(roleKey);
      const projects = await apiFetch(token, tenantId, '/reurb/projects');
      expect(projects.status).toBe(200);
      const projectId = projects.data?.[0]?.id ?? projects.data?.[0]?._id;
      expect(projectId).toBeTruthy();

      const createFamily = await apiFetch(token, tenantId, '/reurb/families', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          familyCode: `FAM-RBAC-${roleKey}-${Date.now()}`,
          nucleus: 'N1',
          responsibleName: 'Teste RBAC',
        }),
      });
      expect(createFamily.status).not.toBe(403);

      const exportCsv = await apiFetch(token, tenantId, '/reurb/families/export.csv', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
      expect(exportCsv.status).not.toBe(403);

      const exportXlsx = await apiFetch(token, tenantId, '/reurb/families/export.xlsx', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
      expect(exportXlsx.status).not.toBe(403);

      const exportJson = await apiFetch(token, tenantId, '/reurb/families/export.json', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
      expect(exportJson.status).not.toBe(403);

      const planilha = await apiFetch(token, tenantId, '/reurb/planilha-sintese/generate', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
      expect(planilha.status).not.toBe(403);

      const cartorio = await apiFetch(token, tenantId, '/reurb/cartorio/package', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });
      expect(cartorio.status).not.toBe(403);
    }
  });

  test('operador nao gera pacote cartorio e leitor nao cria familia', async () => {
    const operador = await loginApi('operador');
    const projects = await apiFetch(operador.token, operador.tenantId, '/reurb/projects');
    const projectId = projects.data?.[0]?.id ?? projects.data?.[0]?._id;
    expect(projectId).toBeTruthy();

    const cartorio = await apiFetch(operador.token, operador.tenantId, '/reurb/cartorio/package', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
    expect(cartorio.status).toBe(403);

    const leitor = await loginApi('leitor');
    const createFamily = await apiFetch(leitor.token, leitor.tenantId, '/reurb/families', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        familyCode: `FAM-RBAC-LEITOR-${Date.now()}`,
        nucleus: 'N1',
        responsibleName: 'Teste Leitor',
      }),
    });
    expect(createFamily.status).toBe(403);
  });

  test('integracao http permitida somente admin/gestor', async () => {
    const gestor = await loginApi('gestor');
    const projects = await apiFetch(gestor.token, gestor.tenantId, '/reurb/projects');
    const projectId = projects.data?.[0]?.id ?? projects.data?.[0]?._id;
    const ok = await apiFetch(gestor.token, gestor.tenantId, '/reurb/integrations/ping', {
      method: 'POST',
      body: JSON.stringify({ projectId, payload: { ping: 'ok' } }),
    });
    expect([200, 201].includes(ok.status)).toBeTruthy();

    const operador = await loginApi('operador');
    const blocked = await apiFetch(operador.token, operador.tenantId, '/reurb/integrations/ping', {
      method: 'POST',
      body: JSON.stringify({ projectId, payload: { ping: 'no' } }),
    });
    expect(blocked.status).toBe(403);
  });
});
