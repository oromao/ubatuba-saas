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

const apiFetch = async (token: string, tenantId: string, pathUrl: string, init: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${pathUrl}`, {
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

test.describe('reurb auditoria + lgpd + dossier', () => {
  test('registro de acesso LGPD e checklist de dossier', async () => {
    const { token, tenantId } = await loginApi('admin');

    const projectName = `Projeto LGPD ${Date.now()}`;
    const createProject = await apiFetch(token, tenantId, '/reurb/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: projectName,
        area: 'Centro',
        reurbType: 'REURB-S',
        status: 'RASCUNHO',
      }),
    });
    expect(createProject.status).toBe(201);
    const projectId = createProject.data?.id ?? createProject.data?._id;
    expect(projectId).toBeTruthy();

    const updateConfig = await apiFetch(token, tenantId, '/reurb/tenant-config', {
      method: 'PUT',
      body: JSON.stringify({
        documentNaming: {
          requiredDocumentTypes: ['RG'],
          requiredProjectDocumentTypes: ['PLANTA'],
          requiredUnitDocumentTypes: ['MEMORIAL'],
        },
      }),
    });
    expect([200, 201].includes(updateConfig.status)).toBeTruthy();

    const createFamily = await apiFetch(token, tenantId, '/reurb/families', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        familyCode: `FAM-LGPD-${Date.now()}`,
        nucleus: 'N1',
        responsibleName: 'Responsavel LGPD',
      }),
    });
    expect(createFamily.status).toBe(201);
    const familyId = createFamily.data?.id ?? createFamily.data?._id;
    expect(familyId).toBeTruthy();

    const createUnit = await apiFetch(token, tenantId, '/reurb/units', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        code: `UNI-${Date.now()}`,
        block: 'Q1',
        lot: 'L1',
      }),
    });
    expect(createUnit.status).toBe(201);
    const unitId = createUnit.data?.id ?? createUnit.data?._id;
    expect(unitId).toBeTruthy();

    const dossierBefore = await apiFetch(token, tenantId, `/reurb/dossier?projectId=${projectId}`);
    expect(dossierBefore.status).toBe(200);
    expect(dossierBefore.data?.project?.missingDocuments?.length).toBeGreaterThan(0);
    expect(dossierBefore.data?.families?.[0]?.missing?.length).toBeGreaterThan(0);
    expect(dossierBefore.data?.units?.[0]?.missing?.length).toBeGreaterThan(0);

    const projectDoc = await apiFetch(token, tenantId, '/reurb/project-documents/complete-upload', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        documentType: 'PLANTA',
        key: `fake/${Date.now()}-planta.pdf`,
        fileName: 'planta.pdf',
        status: 'APROVADO',
      }),
    });
    expect([200, 201].includes(projectDoc.status)).toBeTruthy();

    const familyDoc = await apiFetch(token, tenantId, '/reurb/documents/complete-upload', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        familyId,
        documentType: 'RG',
        key: `fake/${Date.now()}-rg.pdf`,
        fileName: 'rg.pdf',
        status: 'APROVADO',
      }),
    });
    expect([200, 201].includes(familyDoc.status)).toBeTruthy();

    const unitDoc = await apiFetch(token, tenantId, '/reurb/unit-documents/complete-upload', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        unitId,
        documentType: 'MEMORIAL',
        key: `fake/${Date.now()}-memorial.pdf`,
        fileName: 'memorial.pdf',
        status: 'APROVADO',
      }),
    });
    expect([200, 201].includes(unitDoc.status)).toBeTruthy();

    const dossierAfter = await apiFetch(token, tenantId, `/reurb/dossier?projectId=${projectId}`);
    expect(dossierAfter.status).toBe(200);
    expect(dossierAfter.data?.project?.missingDocuments?.length).toBe(0);
    expect(dossierAfter.data?.families?.[0]?.missing?.length).toBe(0);
    expect(dossierAfter.data?.units?.[0]?.missing?.length).toBe(0);

    const purpose = `licitacao_mvp_${Date.now()}`;
    const listFamilies = await apiFetch(token, tenantId, `/reurb/families?projectId=${projectId}`, {
      headers: { 'x-lgpd-purpose': purpose },
    });
    expect(listFamilies.status).toBe(200);

    const audit = await apiFetch(
      token,
      tenantId,
      `/reurb/audit?projectId=${projectId}&action=ACCESS_FAMILIES_LIST&limit=5`,
    );
    expect(audit.status).toBe(200);
    const record = Array.isArray(audit.data)
      ? audit.data.find((item: any) => item?.details?.purpose === purpose)
      : null;
    expect(record).toBeTruthy();
  });
});
