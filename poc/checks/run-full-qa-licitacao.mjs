#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const TENANT_SLUG = process.env.TEST_TENANT || "demo";
const ADMIN_EMAIL = process.env.TEST_EMAIL || "admin@demo.local";
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || "Admin@12345";
const HEADLESS = (process.env.PW_HEADLESS ?? "true") !== "false";
const SLOW_MO_MS = Number(process.env.PW_SLOWMO_MS ?? "0");
const DEMO_WAIT_MS = Number(process.env.DEMO_WAIT_MS ?? "0");

const SCREEN_DIR = path.resolve(process.cwd(), "poc/checks/full-qa-screens");
const REPORT_JSON = path.resolve(process.cwd(), "poc/checks/full-qa-licitacao-report.json");
const REPORT_MD = path.resolve(process.cwd(), "poc/checks/full-qa-licitacao-report.md");

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

const OPS_ROLES = ["ADMIN", "GESTOR", "OPERADOR"];
const APP_ROUTE_ACCESS = [
  { prefix: "/app/dashboard", roles: ["ADMIN", "GESTOR", "OPERADOR", "LEITOR"] },
  { prefix: "/app/poc", roles: ["ADMIN", "GESTOR", "OPERADOR", "LEITOR"] },
  { prefix: "/app/maps", roles: OPS_ROLES },
  { prefix: "/app/levantamentos", roles: OPS_ROLES },
  { prefix: "/app/ctm", roles: OPS_ROLES },
  { prefix: "/app/pgv", roles: OPS_ROLES },
  { prefix: "/app/alerts", roles: OPS_ROLES },
  { prefix: "/app/processes", roles: OPS_ROLES },
  { prefix: "/app/assets", roles: OPS_ROLES },
  { prefix: "/app/integracoes", roles: OPS_ROLES },
  { prefix: "/app/cartas", roles: OPS_ROLES },
  { prefix: "/app/compliance", roles: OPS_ROLES },
];

const state = {
  defaultProjectId: null,
  defaultParcelId: null,
  qaProjectId: null,
  logradouroId: null,
  parcelId: null,
  urbanFurnitureId: null,
  assetId: null,
  alertId: null,
  processId: null,
  mapFeatureId: null,
  zoneId: null,
  faceId: null,
  landFactorId: null,
  constructionFactorId: null,
  baseVersionId: null,
  targetVersionId: null,
  surveyRgbId: null,
  surveyLidarId: null,
  taxConnectorId: null,
  letterTemplateId: null,
  letterBatchId: null,
  letterId: null,
  responsibleId: null,
  artId: null,
  catId: null,
  teamId: null,
  layerId: null,
};

const authByProfile = {};

const sanitize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

const pause = async (ms = DEMO_WAIT_MS) => {
  if (!ms || ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const pushResult = (name, ok, details = {}) => {
  results.push({
    name,
    ok,
    at: new Date().toISOString(),
    ...details,
  });
};

const runStep = async (name, fn, meta = {}) => {
  const started = Date.now();
  console.log(`STEP_START ${name}`);
  try {
    const data = await fn();
    pushResult(name, true, { elapsedMs: Date.now() - started, ...meta, ...(data ?? {}) });
    console.log(`STEP_OK ${name} ${Date.now() - started}ms`);
    return data;
  } catch (error) {
    pushResult(name, false, {
      elapsedMs: Date.now() - started,
      ...meta,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`STEP_FAIL ${name} ${Date.now() - started}ms`);
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

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
};

const asArray = (payload) => {
  const data = unwrap(payload);
  return Array.isArray(data) ? data : [];
};

const pickId = (obj) => {
  if (!obj || typeof obj !== "object") return null;
  return obj.id ?? obj._id ?? null;
};

const withQuery = (endpoint, query = {}) => {
  const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (entries.length === 0) return endpoint;
  const params = new URLSearchParams(entries);
  return `${endpoint}${endpoint.includes("?") ? "&" : "?"}${params.toString()}`;
};

const expectStatus = (res, expected, context) => {
  const list = Array.isArray(expected) ? expected : [expected];
  if (!list.includes(res.status)) {
    throw new Error(`${context}: status ${res.status} (esperado ${list.join(",")})`);
  }
};

const apiCall = async ({ method = "GET", endpoint, token, tenantId, body, rawBody, contentType }) => {
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
  };

  let payloadBody;
  if (rawBody !== undefined) {
    payloadBody = rawBody;
    if (contentType) headers["Content-Type"] = contentType;
  } else if (body !== undefined) {
    payloadBody = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  const timeoutSignal = AbortSignal.timeout(20_000);
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    signal: timeoutSignal,
    ...(payloadBody !== undefined ? { body: payloadBody } : {}),
  });

  const payload = await parseBody(response);
  return {
    status: response.status,
    payload,
    data: unwrap(payload),
    headers: response.headers,
  };
};

const polygonAt = (offset = 0) => {
  const x = GEO.baseLng + offset * 0.0015;
  const y = GEO.baseLat + offset * 0.0012;
  return {
    type: "Polygon",
    coordinates: [[[x, y], [x + 0.0009, y], [x + 0.0009, y + 0.0009], [x, y + 0.0009], [x, y]]],
  };
};

const lineAt = (offset = 0) => {
  const x = GEO.baseLng + offset * 0.001;
  const y = GEO.baseLat + offset * 0.001;
  return {
    type: "LineString",
    coordinates: [[x, y], [x + 0.0007, y + 0.0004], [x + 0.0011, y + 0.0008]],
  };
};

const waitForHydration = async (page) => {
  await page.waitForFunction(() => Boolean(window.next), null, { timeout: 20_000 });
};

const assertNoRuntimeOverlay = async (page) => {
  const hasRuntimeOverlay = await page.getByText("Unhandled Runtime Error").count();
  if (hasRuntimeOverlay > 0) {
    throw new Error("Overlay de erro de runtime detectado");
  }
};

const resetBrowserSession = async (page) => {
  await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "domcontentloaded" });
  if (new URL(page.url()).pathname.startsWith("/app")) {
    try {
      const logoutButton = page.getByRole("button", { name: "Sair" }).first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL(/\/login/);
      }
    } catch {
      // continue with cleanup
    }
  }
  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForHydration(page);
};

const loginUi = async (page, profile) => {
  await resetBrowserSession(page);
  await page.locator('input[placeholder="nome@prefeitura.gov.br"]').fill(profile.email);
  await pause();
  await page.locator('input[type="password"]').fill(profile.password);
  await pause();
  await page.locator('input[placeholder="ex: prefeitura-ubatuba"]').fill(TENANT_SLUG);
  await pause();

  const loginReq = page.waitForResponse(
    (res) => res.url().includes("/auth/login") && res.request().method() === "POST",
  );

  await page.getByRole("button", { name: "Entrar" }).click();
  const loginRes = await loginReq;
  if (loginRes.status() >= 400) {
    throw new Error(`Login UI falhou: ${loginRes.status()}`);
  }
  await page.waitForURL(/\/app\/dashboard/);
  await assertNoRuntimeOverlay(page);
  await pause();
};

const visitUiRoute = async (page, profileKey, route, expectedText, timeoutMs = 8_000, expectMap = false) => {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
  if (route === "/app/maps" && expectMap) {
    const canvas = page.locator("canvas.maplibregl-canvas").first();
    const canvasVisible = await canvas
      .waitFor({ state: "visible", timeout: 20_000 })
      .then(() => true)
      .catch(() => false);
    if (!canvasVisible) {
      const fallbackReady = await page
        .getByText(/Camadas & Filtros|Mapa indisponivel neste ambiente/i)
        .first()
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true)
        .catch(() => false);
      if (!fallbackReady) {
        throw new Error("Mapa nao carregou (canvas/fallback nao visivel)");
      }
    }
  } else if (expectedText) {
    await page.getByText(expectedText).first().waitFor({ state: "visible", timeout: timeoutMs });
  }
  await assertNoRuntimeOverlay(page);
  await page.screenshot({
    path: path.join(SCREEN_DIR, `${profileKey}-${sanitize(route)}.png`),
    fullPage: false,
  });
  await pause();
};

const isUiRouteAllowed = (role, route) => {
  if (route === "/mobile") return OPS_ROLES.includes(role);
  if (!route.startsWith("/app")) return true;
  const rule = APP_ROUTE_ACCESS.find((item) => route === item.prefix || route.startsWith(`${item.prefix}/`));
  if (!rule) return false;
  return rule.roles.includes(role);
};

await fs.mkdir(SCREEN_DIR, { recursive: true });

await runStep("public_health_metrics_poc", async () => {
  const health = await apiCall({ endpoint: "/health" });
  expectStatus(health, 200, "health public");

  const metrics = await apiCall({ endpoint: "/metrics" });
  expectStatus(metrics, 200, "metrics public");

  const pocHealth = await apiCall({ endpoint: "/poc/health" });
  expectStatus(pocHealth, 200, "poc health public");
});

const adminBootstrap = await apiCall({
  method: "POST",
  endpoint: "/auth/login",
  body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, tenantSlug: TENANT_SLUG },
});
expectStatus(adminBootstrap, 201, "admin bootstrap login");
const adminToken = adminBootstrap.data?.accessToken;
const tenantId = adminBootstrap.data?.tenantId;
if (!adminToken || !tenantId) {
  throw new Error("Nao foi possivel obter token/tenant do admin");
}
authByProfile.admin = {
  token: adminToken,
  tenantId,
  role: adminBootstrap.data?.role,
};

await runStep("setup_profiles_all_roles", async () => {
  for (const profile of profiles.filter((item) => item.key !== "admin")) {
    const createUser = await apiCall({
      method: "POST",
      endpoint: "/admin/users",
      token: adminToken,
      tenantId,
      body: { email: profile.email, password: profile.password },
    });
    expectStatus(createUser, [200, 201], `create user ${profile.key}`);

    const userId = pickId(createUser.data);
    if (!userId) throw new Error(`User sem id para perfil ${profile.key}`);

    const grantMembership = await apiCall({
      method: "POST",
      endpoint: "/admin/memberships",
      token: adminToken,
      tenantId,
      body: { tenantId, userId, role: profile.role },
    });
    expectStatus(grantMembership, [200, 201], `grant membership ${profile.key}`);
  }
});

for (const profile of profiles.filter((item) => item.key !== "admin")) {
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
    if (!authByProfile[profile.key]?.token) {
      throw new Error(`Perfil ${profile.key} sem token`);
    }
    return { role: authByProfile[profile.key]?.role ?? null };
  }, { kind: "auth", profile: profile.key });
}

await runStep("admin_projects_discovery", async () => {
  const admin = authByProfile.admin;

  const projects = await apiCall({ endpoint: "/projects", token: admin.token, tenantId: admin.tenantId });
  expectStatus(projects, 200, "list projects admin");
  const projectList = asArray(projects.payload);
  const demo = projectList.find((item) => item.slug === "demo") ?? projectList[0];
  if (!demo) throw new Error("Projeto default nao encontrado");
  state.defaultProjectId = pickId(demo);

  const parcels = await apiCall({
    endpoint: withQuery("/ctm/parcels", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(parcels, 200, "list parcels default");
  const list = asArray(parcels.payload);
  state.defaultParcelId = pickId(list[0]);
  if (!state.defaultParcelId) throw new Error("Parcela default nao encontrada");

  const createProject = await apiCall({
    method: "POST",
    endpoint: "/projects",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      name: `QA Licitacao ${runId}`,
      slug: `qa-${runId}`,
      description: "Projeto de teste funcional completo",
      defaultCenter: [GEO.baseLng, GEO.baseLat],
      defaultBbox: [GEO.baseLng - 0.01, GEO.baseLat - 0.01, GEO.baseLng + 0.01, GEO.baseLat + 0.01],
      defaultZoom: 15,
    },
  });
  expectStatus(createProject, [200, 201], "create qa project");
  state.qaProjectId = pickId(createProject.data);
  if (!state.qaProjectId) throw new Error("Projeto QA sem id");

  const patchProject = await apiCall({
    method: "PATCH",
    endpoint: `/projects/${state.qaProjectId}`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: { description: `Projeto QA atualizado ${runId}` },
  });
  expectStatus(patchProject, [200, 201], "patch qa project");

  const getProject = await apiCall({
    endpoint: `/projects/${state.qaProjectId}`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(getProject, 200, "get qa project");
});

await runStep("admin_dashboard_areas_osm", async () => {
  const admin = authByProfile.admin;

  const dashboard = await apiCall({ endpoint: "/dashboard/kpis", token: admin.token, tenantId: admin.tenantId });
  expectStatus(dashboard, 200, "dashboard kpis");

  const areas = await apiCall({ endpoint: "/areas", token: admin.token, tenantId: admin.tenantId });
  expectStatus(areas, 200, "areas list");

  const roads = await apiCall({
    endpoint: withQuery("/osm/roads", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(roads, 200, "roads list");

  const roadsGeojson = await apiCall({
    endpoint: withQuery("/osm/roads/geojson", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(roadsGeojson, 200, "roads geojson");

  const buildings = await apiCall({
    endpoint: withQuery("/osm/buildings", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(buildings, 200, "buildings list");

  const buildingsGeojson = await apiCall({
    endpoint: withQuery("/osm/buildings/geojson", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(buildingsGeojson, 200, "buildings geojson");
});

await runStep("admin_layers_read_update", async () => {
  const admin = authByProfile.admin;
  const layers = await apiCall({ endpoint: "/layers", token: admin.token, tenantId: admin.tenantId });
  expectStatus(layers, 200, "layers list");
  const list = asArray(layers.payload);
  if (list.length === 0) throw new Error("Nenhuma camada encontrada");
  state.layerId = pickId(list[0]);
  if (!state.layerId) throw new Error("Camada sem id");

  const update = await apiCall({
    method: "PATCH",
    endpoint: `/layers/${state.layerId}`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: { opacity: 0.85 },
  });
  expectStatus(update, [200, 201], "update layer opacity");
});

await runStep("admin_ctm_logradouros_crud", async () => {
  const admin = authByProfile.admin;
  const create = await apiCall({
    method: "POST",
    endpoint: "/ctm/logradouros",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      name: `Rua QA ${runId}`,
      type: "RUA",
      code: `LOG-${runId}`,
      geometry: lineAt(1),
    },
  });
  expectStatus(create, [200, 201], "create logradouro");
  state.logradouroId = pickId(create.data);
  if (!state.logradouroId) throw new Error("Logradouro sem id");

  const list = await apiCall({
    endpoint: withQuery("/ctm/logradouros", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list logradouros");

  const get = await apiCall({
    endpoint: withQuery(`/ctm/logradouros/${state.logradouroId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(get, 200, "get logradouro");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/ctm/logradouros/${state.logradouroId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { name: `Rua QA Atualizada ${runId}` },
  });
  expectStatus(patch, [200, 201], "patch logradouro");
});

await runStep("admin_ctm_parcels_crud_and_details", async () => {
  const admin = authByProfile.admin;
  const createParcel = await apiCall({
    method: "POST",
    endpoint: "/ctm/parcels",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      sqlu: `QA-${runId}`,
      inscription: `INS-QA-${runId}`,
      status: "ATIVO",
      workflowStatus: "PENDENTE",
      mainAddress: `Rua QA ${runId}, 100`,
      logradouroId: state.logradouroId,
      geometry: polygonAt(2),
    },
  });
  expectStatus(createParcel, [200, 201], "create parcel");
  state.parcelId = pickId(createParcel.data);
  if (!state.parcelId) throw new Error("Parcela sem id");

  const list = await apiCall({
    endpoint: withQuery("/ctm/parcels", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list parcels");

  const get = await apiCall({
    endpoint: withQuery(`/ctm/parcels/${state.parcelId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(get, 200, "get parcel");

  const summary = await apiCall({
    endpoint: withQuery(`/ctm/parcels/${state.parcelId}/summary`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(summary, 200, "parcel summary");

  const history = await apiCall({
    endpoint: withQuery(`/ctm/parcels/${state.parcelId}/history`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(history, 200, "parcel history");

  const pending = await apiCall({
    endpoint: withQuery("/ctm/parcels/pendencias", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(pending, 200, "parcel pendencias");

  const geojson = await apiCall({
    endpoint: withQuery("/ctm/parcels/geojson", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(geojson, 200, "parcel geojson");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/ctm/parcels/${state.parcelId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { workflowStatus: "EM_VALIDACAO", mainAddress: `Rua QA ${runId}, 200` },
  });
  expectStatus(patch, [200, 201], "patch parcel");
});

await runStep("admin_ctm_parcel_subrecords", async () => {
  const admin = authByProfile.admin;

  const building = await apiCall({
    method: "PUT",
    endpoint: withQuery(`/ctm/parcels/${state.parcelId}/building`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      useType: "RESIDENCIAL",
      constructionStandard: "MEDIO",
      builtArea: 130,
      floors: 2,
      constructionYear: 2015,
      occupancyType: "PROPRIO",
    },
  });
  expectStatus(building, [200, 201], "upsert parcel building");

  const socioeconomic = await apiCall({
    method: "PUT",
    endpoint: withQuery(`/ctm/parcels/${state.parcelId}/socioeconomic`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      incomeBracket: "2-5_SM",
      residents: 4,
      vulnerabilityIndicator: "BAIXA",
    },
  });
  expectStatus(socioeconomic, [200, 201], "upsert parcel socioeconomic");

  const infrastructure = await apiCall({
    method: "PUT",
    endpoint: withQuery(`/ctm/parcels/${state.parcelId}/infrastructure`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      water: true,
      sewage: true,
      electricity: true,
      pavingType: "ASFALTO",
      publicLighting: true,
      garbageCollection: true,
    },
  });
  expectStatus(infrastructure, [200, 201], "upsert parcel infrastructure");
});

await runStep("admin_ctm_import_geojson", async () => {
  const admin = authByProfile.admin;
  const featureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: `IMP-${runId}`,
        geometry: polygonAt(3),
        properties: {
          sqlu: `IMP-${runId}`,
          inscription: `INS-IMP-${runId}`,
          status: "ATIVO",
          workflowStatus: "PENDENTE",
          mainAddress: `Rua Importacao ${runId}`,
        },
      },
    ],
  };

  const imported = await apiCall({
    method: "POST",
    endpoint: withQuery("/ctm/parcels/import", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: featureCollection,
  });
  expectStatus(imported, [200, 201], "import parcels geojson");
});

await runStep("admin_ctm_urban_furniture_crud", async () => {
  const admin = authByProfile.admin;

  const create = await apiCall({
    method: "POST",
    endpoint: "/ctm/urban-furniture",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      type: "POSTE",
      lat: GEO.baseLat,
      lng: GEO.baseLng,
      condition: "BOM",
      notes: "Criado no QA",
    },
  });
  expectStatus(create, [200, 201], "create urban furniture");
  state.urbanFurnitureId = pickId(create.data);
  if (!state.urbanFurnitureId) throw new Error("Mobiliario sem id");

  const list = await apiCall({
    endpoint: withQuery("/ctm/urban-furniture", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list urban furniture");

  const geojson = await apiCall({
    endpoint: withQuery("/ctm/urban-furniture/geojson", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(geojson, 200, "urban furniture geojson");

  const get = await apiCall({
    endpoint: withQuery(`/ctm/urban-furniture/${state.urbanFurnitureId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(get, 200, "get urban furniture");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/ctm/urban-furniture/${state.urbanFurnitureId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { condition: "REGULAR", notes: "Atualizado no QA" },
  });
  expectStatus(patch, [200, 201], "patch urban furniture");
});

await runStep("admin_assets_crud", async () => {
  const admin = authByProfile.admin;

  const create = await apiCall({
    method: "POST",
    endpoint: "/assets",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      name: `Ativo QA ${runId}`,
      category: "Infraestrutura",
      lat: GEO.baseLat,
      lng: GEO.baseLng,
    },
  });
  expectStatus(create, [200, 201], "create asset");
  state.assetId = pickId(create.data);
  if (!state.assetId) throw new Error("Ativo sem id");

  const list = await apiCall({ endpoint: "/assets", token: admin.token, tenantId: admin.tenantId });
  expectStatus(list, 200, "list assets");

  const get = await apiCall({ endpoint: `/assets/${state.assetId}`, token: admin.token, tenantId: admin.tenantId });
  expectStatus(get, 200, "get asset");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: `/assets/${state.assetId}`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: { status: "INATIVO" },
  });
  expectStatus(patch, [200, 201], "patch asset");
});

await runStep("admin_alerts_crud_and_lifecycle", async () => {
  const admin = authByProfile.admin;

  const create = await apiCall({
    method: "POST",
    endpoint: "/alerts",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      title: `Alerta QA ${runId}`,
      level: "ALTO",
      lat: GEO.baseLat,
      lng: GEO.baseLng,
    },
  });
  expectStatus(create, [200, 201], "create alert");
  state.alertId = pickId(create.data);
  if (!state.alertId) throw new Error("Alerta sem id");

  const list = await apiCall({ endpoint: "/alerts", token: admin.token, tenantId: admin.tenantId });
  expectStatus(list, 200, "list alerts");

  const get = await apiCall({ endpoint: `/alerts/${state.alertId}`, token: admin.token, tenantId: admin.tenantId });
  expectStatus(get, 200, "get alert");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: `/alerts/${state.alertId}`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: { title: `Alerta QA atualizado ${runId}` },
  });
  expectStatus(patch, [200, 201], "patch alert");

  const ack = await apiCall({
    method: "POST",
    endpoint: `/alerts/${state.alertId}/ack`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(ack, [200, 201], "ack alert");

  const resolve = await apiCall({
    method: "POST",
    endpoint: `/alerts/${state.alertId}/resolve`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(resolve, [200, 201], "resolve alert");
});

await runStep("admin_processes_crud_and_transition", async () => {
  const admin = authByProfile.admin;

  const create = await apiCall({
    method: "POST",
    endpoint: "/processes",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      title: `Processo QA ${runId}`,
      owner: "Secretaria QA",
    },
  });
  expectStatus(create, [200, 201], "create process");
  state.processId = pickId(create.data);
  if (!state.processId) throw new Error("Processo sem id");

  const list = await apiCall({ endpoint: "/processes", token: admin.token, tenantId: admin.tenantId });
  expectStatus(list, 200, "list processes");

  const get = await apiCall({ endpoint: `/processes/${state.processId}`, token: admin.token, tenantId: admin.tenantId });
  expectStatus(get, 200, "get process");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: `/processes/${state.processId}`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: { owner: "Secretaria QA Atualizada" },
  });
  expectStatus(patch, [200, 201], "patch process");

  const transition = await apiCall({
    method: "POST",
    endpoint: `/processes/${state.processId}/transition`,
    token: admin.token,
    tenantId: admin.tenantId,
    body: { status: "APROVADO", message: "Aprovado no fluxo QA" },
  });
  expectStatus(transition, [200, 201], "transition process");

  const events = await apiCall({ endpoint: `/processes/${state.processId}/events`, token: admin.token, tenantId: admin.tenantId });
  expectStatus(events, 200, "process events");
});

await runStep("admin_map_features_crud", async () => {
  const admin = authByProfile.admin;
  const create = await apiCall({
    method: "POST",
    endpoint: "/map-features",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      featureType: "parcel",
      properties: { origin: "qa-full" },
      geometry: polygonAt(4),
    },
  });
  expectStatus(create, [200, 201], "create map feature");
  state.mapFeatureId = pickId(create.data);
  if (!state.mapFeatureId) throw new Error("Map feature sem id");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/map-features/${state.mapFeatureId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { properties: { origin: "qa-full", updated: true } },
  });
  expectStatus(patch, [200, 201], "patch map feature");

  const geojson = await apiCall({
    endpoint: withQuery("/map-features/geojson", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(geojson, 200, "map feature geojson");
});

await runStep("admin_pgv_zones_crud_and_import", async () => {
  const admin = authByProfile.admin;
  const create = await apiCall({
    method: "POST",
    endpoint: "/pgv/zones",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      code: `ZQA-${runId}`,
      name: `Zona QA ${runId}`,
      baseLandValue: 620,
      baseConstructionValue: 1320,
      geometry: polygonAt(5),
    },
  });
  expectStatus(create, [200, 201], "create zone");
  state.zoneId = pickId(create.data);
  if (!state.zoneId) throw new Error("Zona sem id");

  const list = await apiCall({
    endpoint: withQuery("/pgv/zones", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list zones");

  const get = await apiCall({
    endpoint: withQuery(`/pgv/zones/${state.zoneId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(get, 200, "get zone");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/pgv/zones/${state.zoneId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { baseLandValue: 650 },
  });
  expectStatus(patch, [200, 201], "patch zone");

  const geojson = await apiCall({
    endpoint: withQuery("/pgv/zones/geojson", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(geojson, 200, "zones geojson");

  const importGeojson = await apiCall({
    method: "POST",
    endpoint: withQuery("/pgv/zones/import", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: `ZONE-IMP-${runId}`,
          geometry: polygonAt(6),
          properties: {
            code: `ZIMP-${runId}`,
            name: `Zona importada ${runId}`,
            baseLandValue: 700,
            baseConstructionValue: 1400,
          },
        },
      ],
    },
  });
  expectStatus(importGeojson, [200, 201], "import zones geojson");
});

await runStep("admin_pgv_faces_crud_and_import", async () => {
  const admin = authByProfile.admin;
  const create = await apiCall({
    method: "POST",
    endpoint: "/pgv/faces",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      code: `FQA-${runId}`,
      logradouroId: state.logradouroId,
      zoneId: state.zoneId,
      landValuePerSqm: 640,
      geometry: lineAt(7),
    },
  });
  expectStatus(create, [200, 201], "create face");
  state.faceId = pickId(create.data);
  if (!state.faceId) throw new Error("Face sem id");

  const list = await apiCall({
    endpoint: withQuery("/pgv/faces", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list faces");

  const get = await apiCall({
    endpoint: withQuery(`/pgv/faces/${state.faceId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(get, 200, "get face");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/pgv/faces/${state.faceId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { landValuePerSqm: 680 },
  });
  expectStatus(patch, [200, 201], "patch face");

  const geojson = await apiCall({
    endpoint: withQuery("/pgv/faces/geojson", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(geojson, 200, "faces geojson");

  const importGeojson = await apiCall({
    method: "POST",
    endpoint: withQuery("/pgv/faces/import", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: `FACE-IMP-${runId}`,
          geometry: lineAt(8),
          properties: {
            code: `FIMP-${runId}`,
            landValuePerSqm: 700,
            zoneId: state.zoneId,
            logradouroId: state.logradouroId,
          },
        },
      ],
    },
  });
  expectStatus(importGeojson, [200, 201], "import faces geojson");
});

await runStep("admin_pgv_factors_and_factor_set", async () => {
  const admin = authByProfile.admin;

  const land = await apiCall({
    method: "POST",
    endpoint: "/pgv/factors",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      category: "LAND",
      key: `land_${runId}`,
      label: "Fator terreno QA",
      value: 1.1,
      isDefault: true,
    },
  });
  expectStatus(land, [200, 201], "create land factor");
  state.landFactorId = pickId(land.data);
  if (!state.landFactorId) throw new Error("Fator terreno sem id");

  const construction = await apiCall({
    method: "POST",
    endpoint: "/pgv/factors",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      category: "CONSTRUCTION",
      key: `construction_${runId}`,
      label: "Fator construcao QA",
      value: 1.05,
      isDefault: true,
    },
  });
  expectStatus(construction, [200, 201], "create construction factor");
  state.constructionFactorId = pickId(construction.data);
  if (!state.constructionFactorId) throw new Error("Fator construcao sem id");

  const list = await apiCall({
    endpoint: withQuery("/pgv/factors", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list factors");

  const getLand = await apiCall({
    endpoint: withQuery(`/pgv/factors/${state.landFactorId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(getLand, 200, "get land factor");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/pgv/factors/${state.landFactorId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { value: 1.12 },
  });
  expectStatus(patch, [200, 201], "patch factor");

  const factorSetPut = await apiCall({
    method: "PUT",
    endpoint: "/pgv/factor-sets",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      fatoresTerreno: [
        { tipo: "TOPOGRAFIA", chave: "PLANO", valorMultiplicador: 1.04 },
      ],
      fatoresConstrucao: [
        { tipo: "PADRAO", chave: "MEDIO", valorMultiplicador: 1.03 },
      ],
      valoresConstrucaoM2: [
        { uso: "RESIDENCIAL", padraoConstrutivo: "MEDIO", valorM2: 1750 },
      ],
    },
  });
  expectStatus(factorSetPut, [200, 201], "upsert factor set");

  const factorSetGet = await apiCall({
    endpoint: withQuery("/pgv/factor-sets", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(factorSetGet, 200, "get factor set");
});

await runStep("admin_pgv_versions_and_valuations", async () => {
  const admin = authByProfile.admin;

  const versionsList = await apiCall({
    endpoint: withQuery("/pgv/versions", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(versionsList, 200, "list versions");

  const existingVersions = asArray(versionsList.payload);
  state.baseVersionId = pickId(existingVersions[0]);

  if (!state.baseVersionId) {
    const createBase = await apiCall({
      method: "POST",
      endpoint: "/pgv/versions",
      token: admin.token,
      tenantId: admin.tenantId,
      body: { projectId: state.qaProjectId, name: `Versao Base ${runId}`, year: 2025 },
    });
    expectStatus(createBase, [200, 201], "create base version");
    state.baseVersionId = pickId(createBase.data);
  }

  const createTarget = await apiCall({
    method: "POST",
    endpoint: "/pgv/versions",
    token: admin.token,
    tenantId: admin.tenantId,
    body: { projectId: state.qaProjectId, name: `Versao QA ${runId}`, year: 2026 },
  });
  expectStatus(createTarget, [200, 201], "create target version");
  state.targetVersionId = pickId(createTarget.data);
  if (!state.targetVersionId) throw new Error("Versao target sem id");

  const patchTarget = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/pgv/versions/${state.targetVersionId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { isActive: true },
  });
  expectStatus(patchTarget, [200, 201], "patch target version");

  const active = await apiCall({
    endpoint: withQuery("/pgv/versions/active", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(active, 200, "active version");

  const calcBase = await apiCall({
    method: "POST",
    endpoint: "/pgv/valuations/calculate",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      parcelId: state.parcelId,
      versionId: state.baseVersionId,
      zoneId: state.zoneId,
      faceId: state.faceId,
      landFactorId: state.landFactorId,
      constructionFactorId: state.constructionFactorId,
      persist: true,
    },
  });
  expectStatus(calcBase, [200, 201], "valuation calculate base");

  const bumpFactor = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/pgv/factors/${state.landFactorId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { value: 1.25 },
  });
  expectStatus(bumpFactor, [200, 201], "bump land factor");

  const calcTarget = await apiCall({
    method: "POST",
    endpoint: "/pgv/valuations/calculate",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      parcelId: state.parcelId,
      versionId: state.targetVersionId,
      zoneId: state.zoneId,
      faceId: state.faceId,
      landFactorId: state.landFactorId,
      constructionFactorId: state.constructionFactorId,
      persist: true,
    },
  });
  expectStatus(calcTarget, [200, 201], "valuation calculate target");

  const pgvCalculate = await apiCall({
    method: "POST",
    endpoint: "/pgv/calculate",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      parcelId: state.parcelId,
      persist: true,
    },
  });
  expectStatus(pgvCalculate, [200, 201], "pgv calculate endpoint");

  const recalc = await apiCall({
    method: "POST",
    endpoint: "/pgv/recalculate-batch",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      versao: "2026",
      zoneId: state.zoneId,
    },
  });
  expectStatus(recalc, [200, 201], "pgv recalculate batch");
});

await runStep("admin_pgv_reports_and_impact", async () => {
  const admin = authByProfile.admin;

  const list = await apiCall({
    endpoint: withQuery("/pgv/valuations", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list valuations");

  const byParcel = await apiCall({
    endpoint: withQuery(`/pgv/valuations/parcel/${state.parcelId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(byParcel, 200, "valuation by parcel");

  const trace = await apiCall({
    endpoint: withQuery(`/pgv/valuations/parcel/${state.parcelId}/trace`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(trace, 200, "valuation trace");

  const csv = await apiCall({
    endpoint: withQuery("/pgv/valuations/export/csv", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(csv, 200, "valuations csv export");

  const geojson = await apiCall({
    endpoint: withQuery("/pgv/valuations/export/geojson", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(geojson, 200, "valuations geojson export");

  const reportCsv = await apiCall({
    endpoint: withQuery("/pgv/report.csv", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(reportCsv, 200, "pgv report csv");

  const parcelsGeojson = await apiCall({
    endpoint: withQuery("/pgv/parcels.geojson", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(parcelsGeojson, 200, "pgv parcels geojson");

  const impact = await apiCall({
    endpoint: withQuery("/pgv/valuations/impact-report", {
      projectId: state.qaProjectId,
      baseVersionId: state.baseVersionId,
      targetVersionId: state.targetVersionId,
    }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(impact, 200, "impact report");
});

await runStep("admin_surveys_full_pipeline", async () => {
  const admin = authByProfile.admin;

  const createRgb = await apiCall({
    method: "POST",
    endpoint: "/surveys",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      name: `RGB QA ${runId}`,
      type: "AEROFOTO_RGB_5CM",
      municipality: "Ubatuba",
      surveyDate: new Date().toISOString().slice(0, 10),
      gsdCm: 5,
      srcDatum: "SIRGAS2000 / EPSG:4326",
      precision: "5cm",
      supplier: "FlyDea",
    },
  });
  expectStatus(createRgb, [200, 201], "create rgb survey");
  state.surveyRgbId = pickId(createRgb.data);
  if (!state.surveyRgbId) throw new Error("Survey RGB sem id");

  const patchRgb = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/surveys/${state.surveyRgbId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { observations: "Atualizado no QA" },
  });
  expectStatus(patchRgb, [200, 201], "patch rgb survey");

  const presign = await apiCall({
    method: "POST",
    endpoint: withQuery(`/surveys/${state.surveyRgbId}/files/presign-upload`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      fileName: "ortomosaico-mock.tif",
      mimeType: "image/tiff",
      size: 2048,
      category: "ORTHO",
    },
  });
  expectStatus(presign, [200, 201], "survey presign upload");

  const existingGeoTiffKey = `tenants/${tenantId}/rasters/ortomosaico-mock.tif`;
  const complete = await apiCall({
    method: "POST",
    endpoint: withQuery(`/surveys/${state.surveyRgbId}/files/complete`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      key: existingGeoTiffKey,
      name: "ortomosaico-mock.tif",
      category: "ORTHO",
      mimeType: "image/tiff",
      size: 2048,
    },
  });
  expectStatus(complete, [200, 201], "survey complete upload");

  const files = await apiCall({
    endpoint: withQuery(`/surveys/${state.surveyRgbId}/files`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(files, 200, "survey list files");
  const fileList = asArray(files.payload);
  const fileId = pickId(fileList[0]);
  if (!fileId) throw new Error("Arquivo de survey sem id");

  const download = await apiCall({
    endpoint: withQuery(`/surveys/${state.surveyRgbId}/files/${fileId}/download`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(download, 200, "survey download link");

  const qa = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/surveys/${state.surveyRgbId}/qa`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      coverageOk: true,
      georeferencingOk: true,
      qualityOk: true,
      comments: "QA automatizado aprovado",
    },
  });
  expectStatus(qa, [200, 201], "survey qa");

  const publish = await apiCall({
    method: "POST",
    endpoint: withQuery(`/surveys/${state.surveyRgbId}/publish`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(publish, [200, 201], "survey publish");

  const createLidar = await apiCall({
    method: "POST",
    endpoint: "/surveys",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      name: `LiDAR 360 QA ${runId}`,
      type: "MOBILE_LIDAR_360",
      municipality: "Ubatuba",
      surveyDate: new Date().toISOString().slice(0, 10),
      srcDatum: "SIRGAS2000 / EPSG:4326",
      precision: "PoC",
      supplier: "FlyDea",
    },
  });
  expectStatus(createLidar, [200, 201], "create lidar survey");
  state.surveyLidarId = pickId(createLidar.data);
  if (!state.surveyLidarId) throw new Error("Survey LiDAR sem id");

  const completeLidar = await apiCall({
    method: "POST",
    endpoint: withQuery(`/surveys/${state.surveyLidarId}/files/complete`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      key: existingGeoTiffKey,
      name: "nuvem-pontos.laz",
      category: "LAS_LAZ",
      mimeType: "application/octet-stream",
      size: 1024,
    },
  });
  expectStatus(completeLidar, [200, 201], "complete lidar file");

  const list = await apiCall({
    endpoint: withQuery("/surveys", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list surveys");

  const get = await apiCall({
    endpoint: withQuery(`/surveys/${state.surveyRgbId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(get, 200, "get rgb survey");
});

await runStep("admin_tax_integration_full_pipeline", async () => {
  const admin = authByProfile.admin;
  const create = await apiCall({
    method: "POST",
    endpoint: "/tax-integration/connectors",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.qaProjectId,
      name: `Conector QA ${runId}`,
      mode: "CSV_UPLOAD",
      fieldMapping: {
        inscription: "inscricao",
        owner: "contribuinte",
      },
      config: {
        csvSample: "inscricao,contribuinte\nINS-QA,Contribuinte QA",
      },
    },
  });
  expectStatus(create, [200, 201], "create connector");
  state.taxConnectorId = pickId(create.data);
  if (!state.taxConnectorId) throw new Error("Conector sem id");

  const list = await apiCall({
    endpoint: withQuery("/tax-integration/connectors", { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "list connectors");

  const patch = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/tax-integration/connectors/${state.taxConnectorId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { name: `Conector QA Atualizado ${runId}` },
  });
  expectStatus(patch, [200, 201], "patch connector");

  const testConnection = await apiCall({
    method: "POST",
    endpoint: withQuery(`/tax-integration/connectors/${state.taxConnectorId}/test-connection`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(testConnection, [200, 201], "test connector");

  const runSync = await apiCall({
    method: "POST",
    endpoint: withQuery(`/tax-integration/connectors/${state.taxConnectorId}/run-sync`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { csvContent: "inscricao,contribuinte\nINS-QA-2,Contribuinte QA 2" },
  });
  expectStatus(runSync, [200, 201], "run connector sync");

  const logs = await apiCall({
    endpoint: withQuery(`/tax-integration/connectors/${state.taxConnectorId}/logs`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(logs, 200, "connector logs");

  const logList = asArray(logs.payload).slice(0, 5).map((item) => ({
    id: pickId(item),
    trigger: item?.trigger ?? null,
    status: item?.status ?? null,
    message: item?.summary?.message ?? item?.errorMessage ?? null,
    processed: item?.summary?.processed ?? null,
    errors: item?.summary?.errors ?? null,
    createdAt: item?.createdAt ?? null,
  }));
  if (logList.length === 0) {
    throw new Error("Conector sem logs apos teste/sincronizacao");
  }

  console.log("TAX_INTEGRATION_LOGS", JSON.stringify(logList));
  return {
    connectorId: state.taxConnectorId,
    testStatus: testConnection.data?.status ?? null,
    syncStatus: runSync.data?.status ?? null,
    logsPreview: logList,
  };
});

await runStep("admin_notifications_letters_full_pipeline", async () => {
  const admin = authByProfile.admin;

  const listTemplates = await apiCall({
    endpoint: withQuery("/notifications-letters/templates", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(listTemplates, 200, "list templates");

  const createTemplate = await apiCall({
    method: "POST",
    endpoint: "/notifications-letters/templates",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.defaultProjectId,
      name: `Template QA ${runId}`,
      html: "<h1>Notificacao {{inscricao}}</h1><p>Endereco {{endereco}}</p><p>Status {{status}}</p>",
    },
  });
  expectStatus(createTemplate, [200, 201], "create template");
  state.letterTemplateId = pickId(createTemplate.data);
  if (!state.letterTemplateId) throw new Error("Template sem id");

  const patchTemplate = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/notifications-letters/templates/${state.letterTemplateId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { isActive: true },
  });
  expectStatus(patchTemplate, [200, 201], "patch template");

  const preview = await apiCall({
    method: "POST",
    endpoint: "/notifications-letters/templates/preview",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      html: "<p>{{inscricao}} - {{endereco}}</p>",
      variables: { inscricao: "123", endereco: "Rua Teste" },
    },
  });
  expectStatus(preview, [200, 201], "preview template");

  const generateBatch = await apiCall({
    method: "POST",
    endpoint: "/notifications-letters/batches/generate",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.defaultProjectId,
      templateId: state.letterTemplateId,
      parcelStatus: "ATIVO",
    },
  });
  expectStatus(generateBatch, [200, 201], "generate letters batch");
  state.letterBatchId = pickId(generateBatch.data);
  if (!state.letterBatchId) throw new Error("Batch de cartas sem id");

  const listBatches = await apiCall({
    endpoint: withQuery("/notifications-letters/batches", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(listBatches, 200, "list batches");

  const getBatch = await apiCall({
    endpoint: withQuery(`/notifications-letters/batches/${state.letterBatchId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(getBatch, 200, "get batch");
  const batchData = getBatch.data;
  const firstLetter = Array.isArray(batchData?.letters) ? batchData.letters[0] : null;
  state.letterId = pickId(firstLetter);
  if (!state.letterId) throw new Error("Carta gerada sem id");

  const updateStatus = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/notifications-letters/batches/${state.letterBatchId}/letters/${state.letterId}/status`, {
      projectId: state.defaultProjectId,
    }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: { status: "ENTREGUE" },
  });
  expectStatus(updateStatus, [200, 201], "update letter status");

  const download = await apiCall({
    endpoint: withQuery(`/notifications-letters/batches/${state.letterBatchId}/letters/${state.letterId}/download`, {
      projectId: state.defaultProjectId,
    }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(download, 200, "download letter url");
});

await runStep("admin_compliance_full_pipeline", async () => {
  const admin = authByProfile.admin;

  const get = await apiCall({
    endpoint: withQuery("/compliance", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(get, 200, "get compliance profile");

  const company = await apiCall({
    method: "PUT",
    endpoint: withQuery("/compliance/company", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      legalName: "FlyDea QA Ltda",
      cnpj: "12.345.678/0001-90",
      mdRegistry: "MD-12345",
      creaCauNumber: "CREA-98765",
    },
  });
  expectStatus(company, [200, 201], "upsert compliance company");

  const responsible = await apiCall({
    method: "POST",
    endpoint: withQuery("/compliance/responsibles", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      name: "Responsavel QA",
      registryType: "CREA",
      creaCauNumber: "CREA-0001",
    },
  });
  expectStatus(responsible, [200, 201], "add responsible");
  state.responsibleId = responsible.data?.technicalResponsibles?.slice(-1)[0]?.id ?? null;
  if (!state.responsibleId) {
    const refreshed = await apiCall({
      endpoint: withQuery("/compliance", { projectId: state.defaultProjectId }),
      token: admin.token,
      tenantId: admin.tenantId,
    });
    expectStatus(refreshed, 200, "refresh compliance to resolve ids");
    state.responsibleId = refreshed.data?.technicalResponsibles?.slice(-1)[0]?.id ?? null;
  }
  if (!state.responsibleId) throw new Error("Responsavel sem id");

  const patchResponsible = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/compliance/responsibles/${state.responsibleId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      name: "Responsavel QA Atualizado",
      registryType: "CREA",
    },
  });
  expectStatus(patchResponsible, [200, 201], "patch responsible");

  const art = await apiCall({
    method: "POST",
    endpoint: withQuery("/compliance/art-rrt", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      type: "ART",
      number: `ART-${runId}`,
      responsibleId: state.responsibleId,
      projectRef: String(state.defaultProjectId),
    },
  });
  expectStatus(art, [200, 201], "add art");
  state.artId = art.data?.artsRrts?.slice(-1)[0]?.id ?? null;
  if (!state.artId) throw new Error("ART sem id");

  const patchArt = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/compliance/art-rrt/${state.artId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      type: "ART",
      number: `ART-${runId}-UPD`,
      responsibleId: state.responsibleId,
    },
  });
  expectStatus(patchArt, [200, 201], "patch art");

  const cat = await apiCall({
    method: "POST",
    endpoint: withQuery("/compliance/cats", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      number: `CAT-${runId}`,
      responsibleId: state.responsibleId,
      projectRef: String(state.defaultProjectId),
    },
  });
  expectStatus(cat, [200, 201], "add cat");
  state.catId = cat.data?.cats?.slice(-1)[0]?.id ?? null;
  if (!state.catId) throw new Error("CAT sem id");

  const patchCat = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/compliance/cats/${state.catId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      number: `CAT-${runId}-UPD`,
      responsibleId: state.responsibleId,
    },
  });
  expectStatus(patchCat, [200, 201], "patch cat");

  const team = await apiCall({
    method: "POST",
    endpoint: withQuery("/compliance/team", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      name: "Analista QA",
      role: "Engenheiro",
      skills: ["CTM", "PGV"],
      assignments: ["Revisao cadastral"],
    },
  });
  expectStatus(team, [200, 201], "add team member");
  state.teamId = team.data?.team?.slice(-1)[0]?.id ?? null;
  if (!state.teamId) throw new Error("Membro da equipe sem id");

  const patchTeam = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/compliance/team/${state.teamId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      name: "Analista QA Senior",
      role: "Coordenador",
      skills: ["CTM", "PGV", "GIS"],
    },
  });
  expectStatus(patchTeam, [200, 201], "patch team member");

  const checklist = await apiCall({
    method: "PUT",
    endpoint: withQuery("/compliance/checklist", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      requirementCode: "REQ-10",
      title: "Registro Ministerio da Defesa",
      status: "OK",
      notes: "Checklist atualizado automaticamente",
      evidenceKeys: ["docs/compliance/md.pdf"],
    },
  });
  expectStatus(checklist, [200, 201], "upsert compliance checklist");
});

await runStep("admin_mobile_sync", async () => {
  const admin = authByProfile.admin;

  const sync = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: admin.token,
    tenantId: admin.tenantId,
    body: {
      projectId: state.defaultProjectId,
      items: [
        {
          parcelId: state.defaultParcelId,
          checklist: {
            occupancyChecked: true,
            addressChecked: true,
            infrastructureChecked: true,
            notes: "vistoria QA",
          },
          location: {
            lat: GEO.baseLat,
            lng: GEO.baseLng,
          },
        },
      ],
    },
  });
  expectStatus(sync, [200, 201], "mobile sync post");

  const list = await apiCall({
    endpoint: withQuery("/mobile/ctm-sync", { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(list, 200, "mobile sync list");
});

await runStep("admin_admin_only_deletes", async () => {
  const admin = authByProfile.admin;

  const deleteMapFeature = await apiCall({
    method: "DELETE",
    endpoint: withQuery(`/map-features/${state.mapFeatureId}`, { projectId: state.qaProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteMapFeature, [200, 204], "delete map feature");

  const deleteAsset = await apiCall({
    method: "DELETE",
    endpoint: `/assets/${state.assetId}`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteAsset, [200, 204], "delete asset");

  const deleteAlert = await apiCall({
    method: "DELETE",
    endpoint: `/alerts/${state.alertId}`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteAlert, [200, 204], "delete alert");

  const deleteProcess = await apiCall({
    method: "DELETE",
    endpoint: `/processes/${state.processId}`,
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteProcess, [200, 204], "delete process");

  const deleteResponsible = await apiCall({
    method: "DELETE",
    endpoint: withQuery(`/compliance/responsibles/${state.responsibleId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteResponsible, [200, 204], "delete responsible");

  const deleteArt = await apiCall({
    method: "DELETE",
    endpoint: withQuery(`/compliance/art-rrt/${state.artId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteArt, [200, 204], "delete art");

  const deleteCat = await apiCall({
    method: "DELETE",
    endpoint: withQuery(`/compliance/cats/${state.catId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteCat, [200, 204], "delete cat");

  const deleteTeam = await apiCall({
    method: "DELETE",
    endpoint: withQuery(`/compliance/team/${state.teamId}`, { projectId: state.defaultProjectId }),
    token: admin.token,
    tenantId: admin.tenantId,
  });
  expectStatus(deleteTeam, [200, 204], "delete team member");
});

await runStep("admin_poc_score", async () => {
  const admin = authByProfile.admin;
  const pocHealth = await apiCall({ endpoint: "/poc/health", token: admin.token, tenantId: admin.tenantId });
  expectStatus(pocHealth, 200, "poc health");

  const pocScore = await apiCall({ endpoint: "/poc/score", token: admin.token, tenantId: admin.tenantId });
  expectStatus(pocScore, 200, "poc score");
  const score = Number(pocScore.data?.score ?? 0);
  const threshold = Number(pocScore.data?.threshold ?? 95);
  if (score < threshold) {
    throw new Error(`Score PoC abaixo do limiar: ${score} < ${threshold}`);
  }
  return { pocScore: score, pocThreshold: threshold };
});

await runStep("gestor_permissions_matrix", async () => {
  const gestor = authByProfile.gestor;

  const createProject = await apiCall({
    method: "POST",
    endpoint: "/projects",
    token: gestor.token,
    tenantId: gestor.tenantId,
    body: { name: `Projeto Gestor ${runId}`, slug: `gestor-${runId}` },
  });
  expectStatus(createProject, [200, 201], "gestor create project allowed");

  const deleteAssetForbidden = await apiCall({
    method: "DELETE",
    endpoint: `/assets/${state.assetId}`,
    token: gestor.token,
    tenantId: gestor.tenantId,
  });
  expectStatus(deleteAssetForbidden, 403, "gestor delete asset forbidden");

  const deleteProcessForbidden = await apiCall({
    method: "DELETE",
    endpoint: `/processes/${state.processId}`,
    token: gestor.token,
    tenantId: gestor.tenantId,
  });
  expectStatus(deleteProcessForbidden, 403, "gestor delete process forbidden");
});

await runStep("operador_permissions_matrix", async () => {
  const operador = authByProfile.operador;

  const createProjectForbidden = await apiCall({
    method: "POST",
    endpoint: "/projects",
    token: operador.token,
    tenantId: operador.tenantId,
    body: { name: `Projeto Operador ${runId}`, slug: `op-${runId}` },
  });
  expectStatus(createProjectForbidden, 403, "operador create project forbidden");

  const createVersionForbidden = await apiCall({
    method: "POST",
    endpoint: "/pgv/versions",
    token: operador.token,
    tenantId: operador.tenantId,
    body: { projectId: state.qaProjectId, name: `Versao op ${runId}`, year: 2030 },
  });
  expectStatus(createVersionForbidden, 403, "operador create version forbidden");

  const resolveAlertForbidden = await apiCall({
    method: "POST",
    endpoint: `/alerts/${state.alertId}/resolve`,
    token: operador.token,
    tenantId: operador.tenantId,
  });
  expectStatus(resolveAlertForbidden, 403, "operador resolve alert forbidden");

  const mobileSyncAllowed = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: operador.token,
    tenantId: operador.tenantId,
    body: {
      projectId: state.defaultProjectId,
      items: [{ parcelId: state.defaultParcelId, checklist: { occupancyChecked: true } }],
    },
  });
  expectStatus(mobileSyncAllowed, [200, 201], "operador mobile sync allowed");
});

await runStep("campo_permissions_matrix", async () => {
  const campo = authByProfile.campo;

  const mobileSync = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: campo.token,
    tenantId: campo.tenantId,
    body: {
      projectId: state.defaultProjectId,
      items: [{ parcelId: state.defaultParcelId, checklist: { occupancyChecked: true, notes: "coleta campo qa" } }],
    },
  });
  expectStatus(mobileSync, [200, 201], "campo mobile sync allowed");

  const createAssetAllowed = await apiCall({
    method: "POST",
    endpoint: "/assets",
    token: campo.token,
    tenantId: campo.tenantId,
    body: { name: `Ativo Campo ${runId}`, category: "Campo", lat: GEO.baseLat, lng: GEO.baseLng },
  });
  expectStatus(createAssetAllowed, [200, 201], "campo create asset allowed");
});

await runStep("leitor_permissions_matrix", async () => {
  const leitor = authByProfile.leitor;

  const listProjects = await apiCall({ endpoint: "/projects", token: leitor.token, tenantId: leitor.tenantId });
  expectStatus(listProjects, 200, "leitor list projects allowed");

  const listParcels = await apiCall({
    endpoint: withQuery("/ctm/parcels", { projectId: state.defaultProjectId }),
    token: leitor.token,
    tenantId: leitor.tenantId,
  });
  expectStatus(listParcels, 200, "leitor list parcels allowed");

  const createParcelForbidden = await apiCall({
    method: "POST",
    endpoint: "/ctm/parcels",
    token: leitor.token,
    tenantId: leitor.tenantId,
    body: {
      projectId: state.qaProjectId,
      sqlu: `LEITOR-${runId}`,
      geometry: polygonAt(9),
    },
  });
  expectStatus(createParcelForbidden, 403, "leitor create parcel forbidden");

  const createMapFeatureForbidden = await apiCall({
    method: "POST",
    endpoint: "/map-features",
    token: leitor.token,
    tenantId: leitor.tenantId,
    body: { projectId: state.qaProjectId, featureType: "parcel", geometry: polygonAt(10) },
  });
  expectStatus(createMapFeatureForbidden, 403, "leitor create map feature forbidden");

  const complianceWriteForbidden = await apiCall({
    method: "PUT",
    endpoint: withQuery("/compliance/company", { projectId: state.defaultProjectId }),
    token: leitor.token,
    tenantId: leitor.tenantId,
    body: { legalName: "Leitor sem permissao" },
  });
  expectStatus(complianceWriteForbidden, 403, "leitor compliance write forbidden");

  const mobileForbidden = await apiCall({
    method: "POST",
    endpoint: "/mobile/ctm-sync",
    token: leitor.token,
    tenantId: leitor.tenantId,
    body: { projectId: state.defaultProjectId, items: [{ parcelId: state.defaultParcelId }] },
  });
  expectStatus(mobileForbidden, 403, "leitor mobile write forbidden");
});

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO_MS });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(45_000);

const routeSmoke = [
  { route: "/app/dashboard", text: "Painel Executivo" },
  { route: "/app/maps", text: null, timeoutMs: 30_000 },
  { route: "/app/levantamentos", text: "Levantamentos & Entregaveis" },
  { route: "/app/ctm/parcelas", text: "CTM - Parcelas" },
  { route: "/app/pgv/zonas", text: "PGV - Zonas de Valor" },
  { route: "/app/integracoes", text: "Integracoes tributarias" },
  { route: "/app/cartas", text: "Cartas de notificacao" },
  { route: "/app/compliance", text: "Compliance" },
  { route: "/app/poc", text: "PoC 95% - Aderencia" },
  { route: "/app/assets", text: "Ativos territoriais" },
  { route: "/app/alerts", text: "Alertas ambientais" },
  { route: "/app/processes", text: "Processos" },
  { route: "/mobile", text: "FlyDea Mobile Campo" },
];

try {
  for (const profile of profiles) {
    await runStep(`ui_login_${profile.key}`, async () => {
      await loginUi(page, profile);
      await page.screenshot({
        path: path.join(SCREEN_DIR, `${profile.key}-login-dashboard.png`),
        fullPage: true,
      });
      return { profile: profile.key };
    }, { kind: "ui", profile: profile.key });

    for (const item of routeSmoke) {
      await runStep(`ui_${profile.key}_${sanitize(item.route)}`, async () => {
        const allowed = isUiRouteAllowed(profile.role, item.route);
        const expectedText = item.route === "/mobile"
          ? allowed ? item.text : "Acesso restrito"
          : allowed ? item.text : "Painel Executivo";
        await visitUiRoute(page, profile.key, item.route, expectedText, item.timeoutMs, item.route === "/app/maps" && allowed);
      }, { kind: "ui", profile: profile.key, route: item.route });
    }
  }

  await runStep("ui_admin_map_draw_save_delete", async () => {
    const adminProfile = profiles.find((p) => p.key === "admin");
    if (!adminProfile) throw new Error("Perfil admin nao encontrado");

    await loginUi(page, adminProfile);
    await page.goto(`${BASE_URL}/app/maps`, { waitUntil: "domcontentloaded" });
    const canvas = page.locator("canvas.maplibregl-canvas").first();
    const canvasVisible = await canvas
      .waitFor({ state: "visible", timeout: 20_000 })
      .then(() => true)
      .catch(() => false);
    if (!canvasVisible) {
      await page
        .getByText(/Camadas & Filtros|Mapa indisponivel neste ambiente/i)
        .first()
        .waitFor({ state: "visible", timeout: 8_000 });
      return { skipped: "map-canvas-unavailable-in-runtime" };
    }
    await assertNoRuntimeOverlay(page);

    const drawButton = page.getByRole("button", { name: "Desenhar Terreno" });
    const drawEnabled = await drawButton.isEnabled().catch(() => false);
    if (!drawEnabled) {
      return { skipped: "map-draw-controls-disabled-in-runtime" };
    }

    await drawButton.click();
    await canvas.waitFor({ state: "visible" });
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas do mapa nao encontrado");

    const p1 = { x: box.x + box.width * 0.60, y: box.y + box.height * 0.38 };
    const p2 = { x: box.x + box.width * 0.68, y: box.y + box.height * 0.44 };
    const p3 = { x: box.x + box.width * 0.65, y: box.y + box.height * 0.54 };
    const p4 = { x: box.x + box.width * 0.56, y: box.y + box.height * 0.51 };

    await page.mouse.click(p1.x, p1.y);
    await pause();
    await page.mouse.click(p2.x, p2.y);
    await pause();
    await page.mouse.click(p3.x, p3.y);
    await pause();

    await page.screenshot({
      path: path.join(SCREEN_DIR, "admin-map-drawing-live.png"),
      fullPage: true,
    });

    await page.mouse.dblclick(p4.x, p4.y);
    await page.getByText("Salvar geometria").waitFor({ state: "visible" });
    await page.locator('input[placeholder="Opcional"]').first().fill(`QA full ${runId}`);
    await pause();
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(Math.max(1000, DEMO_WAIT_MS));

    const selectedWarning = page.getByText("Nenhuma geometria selecionada.");
    if (await selectedWarning.count()) {
      throw new Error("Mapa exibiu erro de geometria selecionada apos salvar");
    }

    await page.getByRole("button", { name: "Excluir" }).click();
    await pause();
    await page.mouse.click(p1.x, p1.y);
    await page.waitForTimeout(Math.max(900, DEMO_WAIT_MS));

    await page.screenshot({
      path: path.join(SCREEN_DIR, "admin-map-draw-delete.png"),
      fullPage: true,
    });
    await assertNoRuntimeOverlay(page);
  }, { kind: "ui", profile: "admin", route: "/app/maps" });
} finally {
  await context.close();
  await browser.close();
}

const requirementCoverage = [
  {
    req: 1,
    title: "Aerolevantamento RGB 5cm",
    checks: ["admin_surveys_full_pipeline", "ui_admin_app-levantamentos"],
  },
  {
    req: 2,
    title: "Mapeamento movel 360 + LiDAR",
    checks: ["admin_surveys_full_pipeline"],
  },
  {
    req: 3,
    title: "Atualizacao cadastro imobiliario",
    checks: ["admin_ctm_parcels_crud_and_details", "admin_ctm_parcel_subrecords", "admin_ctm_import_geojson"],
  },
  {
    req: 4,
    title: "Atualizacao PGV",
    checks: ["admin_pgv_versions_and_valuations", "admin_pgv_reports_and_impact"],
  },
  {
    req: 5,
    title: "Plataforma web + mobile",
    checks: ["admin_mobile_sync", "ui_admin_mobile", "ui_campo_mobile"],
  },
  {
    req: 6,
    title: "Hospedagem em nuvem/observabilidade",
    checks: ["public_health_metrics_poc"],
  },
  {
    req: 7,
    title: "Integracao tributaria",
    checks: ["admin_tax_integration_full_pipeline", "ui_admin_app-integracoes"],
  },
  {
    req: 8,
    title: "Cartas de notificacao",
    checks: ["admin_notifications_letters_full_pipeline", "ui_admin_app-cartas"],
  },
  {
    req: 9,
    title: "PoC 95% aderencia",
    checks: ["admin_poc_score", "ui_admin_app-poc"],
  },
  {
    req: 10,
    title: "Registro Ministerio da Defesa",
    checks: ["admin_compliance_full_pipeline"],
  },
  {
    req: 11,
    title: "Registro CREA/CAU",
    checks: ["admin_compliance_full_pipeline"],
  },
  {
    req: 12,
    title: "CAT registrada",
    checks: ["admin_compliance_full_pipeline"],
  },
  {
    req: 13,
    title: "Equipe tecnica especializada",
    checks: ["admin_compliance_full_pipeline"],
  },
];

const findResult = (name) => results.find((item) => item.name === name);
const requirementStatus = requirementCoverage.map((item) => {
  const checks = item.checks.map((name) => {
    const result = findResult(name);
    return {
      name,
      ok: Boolean(result?.ok),
      error: result?.error,
    };
  });
  return {
    req: item.req,
    title: item.title,
    ok: checks.every((entry) => entry.ok),
    checks,
  };
});

const passed = results.filter((item) => item.ok).length;
const failed = results.length - passed;
const reqPassed = requirementStatus.filter((item) => item.ok).length;
const reqFailed = requirementStatus.length - reqPassed;

const summary = {
  generatedAt: new Date().toISOString(),
  runId,
  baseUrl: BASE_URL,
  apiUrl: API_URL,
  tenantSlug: TENANT_SLUG,
  profiles: profiles.map((profile) => ({
    key: profile.key,
    email: profile.email,
    expectedRole: profile.role,
    resolvedRole: authByProfile[profile.key]?.role ?? null,
  })),
  totals: {
    passed,
    failed,
    total: results.length,
    score: results.length === 0 ? 0 : Math.round((passed / results.length) * 100),
  },
  licitacao: {
    passed: reqPassed,
    failed: reqFailed,
    total: requirementStatus.length,
    adherenceScore: requirementStatus.length === 0 ? 0 : Math.round((reqPassed / requirementStatus.length) * 100),
    requirements: requirementStatus,
  },
  state,
  results,
};

const mdLines = [];
mdLines.push("# Relatorio QA Completo - Licitacao");
mdLines.push("");
mdLines.push(`- Data: ${summary.generatedAt}`);
mdLines.push(`- Run ID: ${runId}`);
mdLines.push(`- API: ${API_URL}`);
mdLines.push(`- WEB: ${BASE_URL}`);
mdLines.push(`- Score tecnico (checks): ${summary.totals.score}% (${passed}/${results.length})`);
mdLines.push(`- Aderencia licitacao: ${summary.licitacao.adherenceScore}% (${reqPassed}/${requirementStatus.length})`);
mdLines.push("");
mdLines.push("## Requisitos da licitacao");
mdLines.push("");
mdLines.push("| Req | Status | Requisito | Evidencias | ");
mdLines.push("|---|---|---|---|");
for (const item of requirementStatus) {
  const status = item.ok ? "OK" : "FALHA";
  const evidences = item.checks.map((entry) => `${entry.ok ? "OK" : "ERRO"} \\\`${entry.name}\\\``).join("<br>");
  mdLines.push(`| ${item.req} | ${status} | ${item.title} | ${evidences} |`);
}

const failures = results.filter((item) => !item.ok);
mdLines.push("");
mdLines.push("## Falhas encontradas");
mdLines.push("");
if (failures.length === 0) {
  mdLines.push("- Nenhuma falha nos checks executados.");
} else {
  for (const failure of failures) {
    mdLines.push(`- ${failure.name}: ${failure.error}`);
  }
}

mdLines.push("");
mdLines.push("## Evidencias");
mdLines.push("");
mdLines.push(`- JSON completo: \\\`${REPORT_JSON}\\\``);
mdLines.push(`- Screenshots: \\\`${SCREEN_DIR}\\\``);

await fs.writeFile(REPORT_JSON, `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(REPORT_MD, `${mdLines.join("\n")}\n`);

console.log(
  JSON.stringify(
    {
      runId,
      checks: summary.totals,
      licitacao: {
        score: summary.licitacao.adherenceScore,
        passed: summary.licitacao.passed,
        failed: summary.licitacao.failed,
      },
      reportJson: REPORT_JSON,
      reportMd: REPORT_MD,
      screens: SCREEN_DIR,
    },
    null,
    2,
  ),
);
if (failed > 0 || reqFailed > 0) {
  process.exitCode = 1;
}
