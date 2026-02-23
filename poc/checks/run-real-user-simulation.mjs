#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const TENANT_SLUG = process.env.TEST_TENANT || "demo";
const ADMIN_EMAIL = process.env.TEST_EMAIL || "admin@demo.local";
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || "Admin@12345";
const HEADLESS = (process.env.PW_HEADLESS ?? "false") !== "false";
const SLOW_MO_MS = Number(process.env.PW_SLOWMO_MS ?? "120");
const SCREEN_DIR = path.resolve(process.cwd(), "poc/checks/real-user-screens");
const REPORT_PATH = path.resolve(process.cwd(), "poc/checks/real-user-simulation-report.json");

const GEO = {
  baseLng: -50.553,
  baseLat: -20.278,
};

const runId = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const results = [];

const profiles = [
  { key: "admin", label: "Admin", role: "ADMIN", email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  { key: "gestor", label: "Gestor", role: "GESTOR", email: `gestor.${runId}@demo.local`, password: "Gestor@12345" },
  { key: "operador", label: "Operador", role: "OPERADOR", email: `operador.${runId}@demo.local`, password: "Operador@12345" },
  { key: "campo", label: "Campo", role: "OPERADOR", email: `campo.${runId}@demo.local`, password: "Campo@12345" },
  { key: "leitor", label: "Leitor", role: "LEITOR", email: `leitor.${runId}@demo.local`, password: "Leitor@12345" },
];

const pushResult = (name, ok, details = {}) => {
  results.push({
    name,
    ok,
    at: new Date().toISOString(),
    ...details,
  });
};

const runStep = async (name, fn) => {
  const started = Date.now();
  try {
    const data = await fn();
    pushResult(name, true, { elapsedMs: Date.now() - started, ...(data ?? {}) });
    return data;
  } catch (error) {
    pushResult(name, false, {
      elapsedMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const apiCall = async ({ method = "GET", endpoint, token, tenantId, body }) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await parseBody(response);
  return {
    status: response.status,
    payload,
    data: payload?.data ?? payload,
  };
};

const expectStatus = (res, expected, context) => {
  const list = Array.isArray(expected) ? expected : [expected];
  if (!list.includes(res.status)) {
    throw new Error(`${context}: status ${res.status} (esperado ${list.join(", ")})`);
  }
};

const polygonAt = (offset = 0) => {
  const x = GEO.baseLng + offset * 0.0013;
  const y = GEO.baseLat + offset * 0.001;
  return {
    type: "Polygon",
    coordinates: [[[x, y], [x + 0.0008, y], [x + 0.0008, y + 0.0008], [x, y + 0.0008], [x, y]]],
  };
};

const waitForClientHydration = async (page) => {
  await page.waitForFunction(() => Boolean(window.next), null, { timeout: 20_000 });
};

const assertNoRuntimeOverlay = async (page) => {
  const hasRuntimeOverlay = await page.getByText("Unhandled Runtime Error").count();
  if (hasRuntimeOverlay > 0) {
    throw new Error("Overlay de erro de runtime detectado");
  }
};

const clearSession = async (page) => {
  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForClientHydration(page);
};

const loginUi = async (page, profile) => {
  await clearSession(page);
  await page.locator('input[placeholder="nome@prefeitura.gov.br"]').fill(profile.email);
  await page.locator('input[type="password"]').fill(profile.password);
  await page.locator('input[placeholder="ex: prefeitura-jales"]').fill(TENANT_SLUG);
  const loginReq = page.waitForResponse(
    (res) => res.url().includes("/auth/login") && res.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Entrar" }).click();
  const loginRes = await loginReq;
  if (loginRes.status() >= 400) {
    throw new Error(`Login falhou para ${profile.key}: ${loginRes.status()}`);
  }
  await page.waitForURL(/\/app\/dashboard/);
  await assertNoRuntimeOverlay(page);
};

const visitRoute = async (page, profileKey, route, anchorText) => {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
  if (anchorText) {
    await page.getByText(anchorText).first().waitFor({ state: "visible", timeout: 20_000 });
  }
  await assertNoRuntimeOverlay(page);
  const safeRoute = route.replace(/\//g, "_").replace(/^_+/, "") || "root";
  await page.screenshot({
    path: path.join(SCREEN_DIR, `${profileKey}-${safeRoute}.png`),
    fullPage: true,
  });
};

const drawAndDeleteMapFeatureUi = async (page) => {
  await page.goto(`${BASE_URL}/app/maps`, { waitUntil: "domcontentloaded" });
  await page.getByText("Mapas & Drones").first().waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Desenhar Terreno" }).click();
  const canvas = page.locator("canvas.maplibregl-canvas").first();
  await canvas.waitFor({ state: "visible" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas do mapa nao encontrado");

  const p1 = { x: box.x + box.width * 0.62, y: box.y + box.height * 0.40 };
  const p2 = { x: box.x + box.width * 0.66, y: box.y + box.height * 0.46 };
  const p3 = { x: box.x + box.width * 0.60, y: box.y + box.height * 0.54 };
  await page.mouse.click(p1.x, p1.y);
  await page.mouse.click(p2.x, p2.y);
  await page.mouse.dblclick(p3.x, p3.y);
  await page.getByText("Salvar geometria").waitFor({ state: "visible" });
  await page.locator('input[placeholder="Opcional"]').first().fill(`Simulacao ${runId}`);
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Excluir" }).click();
  await page.mouse.click(p1.x, p1.y);
  await page.waitForTimeout(900);
};

await fs.mkdir(SCREEN_DIR, { recursive: true });

const adminLogin = await apiCall({
  method: "POST",
  endpoint: "/auth/login",
  body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, tenantSlug: TENANT_SLUG },
});
expectStatus(adminLogin, 201, "login admin bootstrap");
const adminToken = adminLogin.data?.accessToken;
const tenantId = adminLogin.data?.tenantId;
if (!adminToken || !tenantId) {
  throw new Error("Nao foi possivel obter token/tenant do admin");
}

const ensureProfileAccounts = async () => {
  for (const profile of profiles.filter((p) => p.role !== "ADMIN")) {
    const createUser = await apiCall({
      method: "POST",
      endpoint: "/admin/users",
      token: adminToken,
      tenantId,
      body: { email: profile.email, password: profile.password },
    });
    expectStatus(createUser, [200, 201], `create user ${profile.key}`);
    const userId = createUser.data?.id ?? createUser.data?._id;
    if (!userId) {
      throw new Error(`Usuario ${profile.key} criado sem id`);
    }

    const grantMembership = await apiCall({
      method: "POST",
      endpoint: "/admin/memberships",
      token: adminToken,
      tenantId,
      body: { tenantId, userId, role: profile.role },
    });
    expectStatus(grantMembership, [200, 201], `grant membership ${profile.key}`);
  }
};

await runStep("setup_profiles_admin_gestor_operador_campo_leitor", ensureProfileAccounts);

const authByProfile = {};
for (const profile of profiles) {
  await runStep(`api_login_${profile.key}`, async () => {
    const login = await apiCall({
      method: "POST",
      endpoint: "/auth/login",
      body: { email: profile.email, password: profile.password, tenantSlug: TENANT_SLUG },
    });
    expectStatus(login, 201, `login ${profile.key}`);
    authByProfile[profile.key] = {
      token: login.data?.accessToken,
      tenantId: login.data?.tenantId,
      role: login.data?.role,
    };
    if (!authByProfile[profile.key].token) {
      throw new Error(`Perfil ${profile.key} sem token`);
    }
    return { role: authByProfile[profile.key].role ?? null };
  });
}

let defaultProjectId = null;
let adminSimulationProjectId = null;
let adminCreatedParcelId = null;
let adminCreatedMapFeatureId = null;
let adminConnectorId = null;
let adminTemplateId = null;
let defaultProjectParcelId = null;

await runStep("admin_full_flow_api_all_modules", async () => {
  const admin = authByProfile.admin;
  const projects = await apiCall({
    endpoint: "/projects",
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(projects, 200, "projects list admin");
  const demoProject = (projects.data ?? []).find((item) => item.slug === "demo");
  defaultProjectId = demoProject?.id ?? demoProject?._id ?? null;
  if (!defaultProjectId) {
    throw new Error("Projeto demo nao encontrado");
  }

  const createProject = await apiCall({
    method: "POST",
    endpoint: "/projects",
    token: admin.token,
    tenantId: admin.tenantId,
    body: { name: `Simulacao ${runId}`, slug: `sim-${runId}` },
  });
  expectStatus(createProject, [200, 201], "create project admin");
  adminSimulationProjectId = createProject.data?.id ?? createProject.data?._id;

  const createParcel = await apiCall({
    method: "POST",
    endpoint: "/ctm/parcels",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: adminSimulationProjectId,
      sqlu: `SIM-${runId}`,
      inscription: `INS-SIM-${runId}`,
      status: "ATIVO",
      workflowStatus: "PENDENTE",
      mainAddress: `Rua Simulacao ${runId}`,
      geometry: polygonAt(0),
    },
  });
  expectStatus(createParcel, [200, 201], "create parcel admin");
  adminCreatedParcelId = createParcel.data?.id ?? createParcel.data?._id;

  const createZone = await apiCall({
    method: "POST",
    endpoint: "/pgv/zones",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: adminSimulationProjectId,
      code: `ZSIM-${runId.slice(-4)}`,
      name: `Zona Simulacao ${runId}`,
      baseLandValue: 500,
      baseConstructionValue: 1100,
      geometry: polygonAt(1),
    },
  });
  expectStatus(createZone, [200, 201], "create zone admin");

  const createMapFeature = await apiCall({
    method: "POST",
    endpoint: "/map-features",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: adminSimulationProjectId,
      featureType: "parcel",
      properties: { source: "simulacao-real" },
      geometry: polygonAt(2),
    },
  });
  expectStatus(createMapFeature, [200, 201], "create map feature admin");
  adminCreatedMapFeatureId = createMapFeature.data?.id ?? createMapFeature.data?._id;

  const createSurvey = await apiCall({
    method: "POST",
    endpoint: "/surveys",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: adminSimulationProjectId,
      name: `Levantamento Sim ${runId}`,
      type: "AEROFOTO_RGB_5CM",
      municipality: "Jales",
      surveyDate: new Date().toISOString().slice(0, 10),
      gsdCm: 5,
      srcDatum: "SIRGAS2000 / EPSG:4326",
      precision: "PoC",
      supplier: "FlyDea",
    },
  });
  expectStatus(createSurvey, [200, 201], "create survey admin");

  const createConnector = await apiCall({
    method: "POST",
    endpoint: "/tax-integration/connectors",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: adminSimulationProjectId,
      name: `Conector Sim ${runId}`,
      mode: "CSV_UPLOAD",
      fieldMapping: {
        inscription: "inscricao",
        owner: "contribuinte",
      },
      config: {
        csvSample: "inscricao,contribuinte\nINS-SIM,Contribuinte Simulacao",
      },
    },
  });
  expectStatus(createConnector, [200, 201], "create connector admin");
  adminConnectorId = createConnector.data?.id ?? createConnector.data?._id;

  const testConnection = await apiCall({
    method: "POST",
    endpoint: `/tax-integration/connectors/${adminConnectorId}/test-connection?projectId=${adminSimulationProjectId}`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(testConnection, [200, 201], "test connector admin");

  const createTemplate = await apiCall({
    method: "POST",
    endpoint: "/notifications-letters/templates",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: defaultProjectId,
      name: `Template Sim ${runId}`,
      html: "<h1>Notificacao {{inscription}}</h1><p>Status {{workflowStatus}}</p>",
    },
  });
  expectStatus(createTemplate, [200, 201], "create letter template admin");
  adminTemplateId = createTemplate.data?.id ?? createTemplate.data?._id;

  const generateBatch = await apiCall({
    method: "POST",
    endpoint: "/notifications-letters/batches/generate",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: defaultProjectId,
      templateId: adminTemplateId,
      parcelWorkflowStatus: "PENDENTE",
    },
  });
  expectStatus(generateBatch, [200, 201], "generate letter batch admin");

  const complianceCompany = await apiCall({
    method: "PUT",
    endpoint: `/compliance/company?projectId=${defaultProjectId}`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      legalName: "FlyDea Simulacao Ltda",
      cnpj: "12.345.678/0001-90",
      mdRegistry: "MD-1234",
      creaCauNumber: "CREA-9999",
    },
  });
  expectStatus(complianceCompany, [200, 201], "upsert company admin");

  const complianceResponsible = await apiCall({
    method: "POST",
    endpoint: `/compliance/responsibles?projectId=${defaultProjectId}`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      name: "Responsavel Simulacao",
      registryType: "CREA",
      creaCauNumber: "CREA-0001",
    },
  });
  expectStatus(complianceResponsible, [200, 201], "add responsible admin");

  const parcels = await apiCall({
    endpoint: `/ctm/parcels?projectId=${defaultProjectId}`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(parcels, 200, "list parcels default project");
  defaultProjectParcelId = parcels.data?.[0]?.id ?? parcels.data?.[0]?._id ?? null;
  if (!defaultProjectParcelId) {
    throw new Error("Nao foi possivel obter parcela para fluxo mobile");
  }

  const mobileSync = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: defaultProjectId,
      items: [
        {
          parcelId: defaultProjectParcelId,
          checklist: { occupancyChecked: true, addressChecked: true, notes: "vistoria simulada" },
          location: { lat: -20.278, lng: -50.553 },
        },
      ],
    },
  });
  expectStatus(mobileSync, [200, 201], "mobile sync admin");

  const deleteMapFeature = await apiCall({
    method: "DELETE",
    endpoint: `/map-features/${adminCreatedMapFeatureId}?projectId=${adminSimulationProjectId}`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteMapFeature, [200, 204], "delete map feature admin");

  const pocScore = await apiCall({ endpoint: "/poc/score", token: admin.token, tenantId: admin.tenantId });
  expectStatus(pocScore, 200, "poc score admin");
  const scorePayload = pocScore.data?.score !== undefined ? pocScore.data : pocScore.payload?.data;
  if (Number(scorePayload?.score ?? 0) < Number(scorePayload?.threshold ?? 95)) {
    throw new Error("Score de aderencia abaixo do limiar da licitacao");
  }
});

await runStep("gestor_permissions_flow", async () => {
  const gestor = authByProfile.gestor;
  const createProject = await apiCall({
    method: "POST",
    endpoint: "/projects",
    token: gestor.token,
    tenantId: gestor.tenantId,
    body: { name: `Projeto Gestor ${runId}`, slug: `gestor-${runId}` },
  });
  expectStatus(createProject, [200, 201], "gestor create project");
  const gestorProjectId = createProject.data?.id ?? createProject.data?._id;

  const createFeature = await apiCall({
    method: "POST",
    endpoint: "/map-features",
    token: gestor.token,
    tenantId: gestor.tenantId,
    body: {
      projectId: gestorProjectId,
      featureType: "building",
      properties: { actor: "gestor" },
      geometry: polygonAt(3),
    },
  });
  expectStatus(createFeature, [200, 201], "gestor create map feature");
  const featureId = createFeature.data?.id ?? createFeature.data?._id;

  const deleteFeature = await apiCall({
    method: "DELETE",
    endpoint: `/map-features/${featureId}?projectId=${gestorProjectId}`,
    token: gestor.token,
    tenantId: gestor.tenantId,
  });
  expectStatus(deleteFeature, 403, "gestor delete map feature forbidden");
});

await runStep("operador_permissions_flow", async () => {
  const operador = authByProfile.operador;
  const createProject = await apiCall({
    method: "POST",
    endpoint: "/projects",
    token: operador.token,
    tenantId: operador.tenantId,
    body: { name: `Projeto Operador ${runId}`, slug: `operador-${runId}` },
  });
  expectStatus(createProject, 403, "operador create project forbidden");

  const createParcel = await apiCall({
    method: "POST",
    endpoint: "/ctm/parcels",
    token: operador.token,
    tenantId: operador.tenantId,
    body: {
      projectId: adminSimulationProjectId,
      sqlu: `OP-${runId}`,
      inscription: `INS-OP-${runId}`,
      status: "ATIVO",
      workflowStatus: "EM_VALIDACAO",
      mainAddress: `Rua Operador ${runId}`,
      geometry: polygonAt(4),
    },
  });
  expectStatus(createParcel, [200, 201], "operador create parcel");

  const mobileSync = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: operador.token,
    tenantId: operador.tenantId,
    body: {
      projectId: defaultProjectId,
      items: [{ parcelId: defaultProjectParcelId, checklist: { occupancyChecked: true } }],
    },
  });
  expectStatus(mobileSync, [200, 201], "operador mobile sync");
});

await runStep("campo_mobile_flow", async () => {
  const campo = authByProfile.campo;
  const mobileSync = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: campo.token,
    tenantId: campo.tenantId,
    body: {
      projectId: defaultProjectId,
      items: [{ parcelId: defaultProjectParcelId, checklist: { occupancyChecked: true, notes: "coleta campo" } }],
    },
  });
  expectStatus(mobileSync, [200, 201], "campo mobile sync");
});

await runStep("leitor_permissions_flow", async () => {
  const leitor = authByProfile.leitor;
  const listProjects = await apiCall({
    endpoint: "/projects",
    token: leitor.token,
    tenantId: leitor.tenantId,
  });
  expectStatus(listProjects, 200, "leitor list projects");

  const createFeature = await apiCall({
    method: "POST",
    endpoint: "/map-features",
    token: leitor.token,
    tenantId: leitor.tenantId,
    body: {
      projectId: adminSimulationProjectId,
      featureType: "parcel",
      geometry: polygonAt(5),
    },
  });
  expectStatus(createFeature, 403, "leitor create feature forbidden");

  const complianceWrite = await apiCall({
    method: "PUT",
    endpoint: `/compliance/company?projectId=${defaultProjectId}`,
    token: leitor.token,
    tenantId: leitor.tenantId,
    body: { legalName: "Leitor sem permissao" },
  });
  expectStatus(complianceWrite, 403, "leitor compliance write forbidden");

  const mobileWrite = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: leitor.token,
    tenantId: leitor.tenantId,
    body: { projectId: defaultProjectId, items: [{ parcelId: defaultProjectParcelId }] },
  });
  expectStatus(mobileWrite, 403, "leitor mobile sync forbidden");
});

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO_MS });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(45_000);

try {
  for (const profile of profiles) {
    await runStep(`ui_login_${profile.key}`, async () => {
      await loginUi(page, profile);
      await page.screenshot({
        path: path.join(SCREEN_DIR, `${profile.key}-login-dashboard.png`),
        fullPage: true,
      });
      return { role: authByProfile[profile.key]?.role ?? null };
    });

    await runStep(`ui_navigation_${profile.key}`, async () => {
      await visitRoute(page, profile.key, "/app/dashboard", "Dashboard");
      await visitRoute(page, profile.key, "/app/maps", "Mapas & Drones");
      await visitRoute(page, profile.key, "/app/levantamentos", "Levantamentos");
      await visitRoute(page, profile.key, "/app/ctm/parcelas", "Parcelas");
      await visitRoute(page, profile.key, "/app/pgv/zonas", "Zonas");
      await visitRoute(page, profile.key, "/app/integracoes", "Integracoes");
      await visitRoute(page, profile.key, "/app/cartas", "Cartas");
      await visitRoute(page, profile.key, "/app/compliance", "Compliance");
      await visitRoute(page, profile.key, "/app/poc", "PoC");
      await visitRoute(page, profile.key, "/mobile", "FlyDea Mobile Campo");
    });

    if (profile.key === "admin") {
      await runStep("ui_admin_map_draw_delete", async () => {
        await drawAndDeleteMapFeatureUi(page);
        await page.screenshot({
          path: path.join(SCREEN_DIR, "admin-map-draw-delete.png"),
          fullPage: true,
        });
      });
    }
  }
} finally {
  await context.close();
  await browser.close();
}

const passed = results.filter((item) => item.ok).length;
const failed = results.length - passed;
const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  apiUrl: API_URL,
  tenantSlug: TENANT_SLUG,
  runId,
  profiles: profiles.map((p) => ({ key: p.key, email: p.email, expectedRole: p.role })),
  passed,
  failed,
  total: results.length,
  score: results.length === 0 ? 0 : Math.round((passed / results.length) * 100),
  results,
};

await fs.writeFile(REPORT_PATH, `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));

if (failed > 0) {
  process.exitCode = 1;
}

