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
const SLOW_MO_MS = Number(process.env.PW_SLOWMO_MS ?? "800");
const DEMO_WAIT_MS = Number(process.env.DEMO_WAIT_MS ?? "900");

const runId = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const SCREEN_DIR = path.resolve(process.cwd(), "poc/checks/daily-live-screens");
const REPORT_JSON = path.resolve(process.cwd(), "poc/checks/daily-user-workflow-report.json");
const MOBILE_TEST_IMAGE_PATH = path.resolve(process.cwd(), "poc/checks/mobile-test-image.png");

const GEO = { lng: -50.553, lat: -20.278 };
const results = [];

const profiles = [
  { key: "admin", role: "ADMIN", email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  { key: "gestor", role: "GESTOR", email: `gestor.daily.${runId}@demo.local`, password: "Gestor@12345" },
  { key: "operador", role: "OPERADOR", email: `operador.daily.${runId}@demo.local`, password: "Operador@12345" },
  { key: "campo", role: "OPERADOR", email: `campo.daily.${runId}@demo.local`, password: "Campo@12345" },
  { key: "leitor", role: "LEITOR", email: `leitor.daily.${runId}@demo.local`, password: "Leitor@12345" },
];

const state = {
  tenantId: null,
  defaultProjectId: null,
  qaProjectId: null,
  qaLogradouroId: null,
  qaParcelId: null,
  qaMobiliarioId: null,
  qaZoneId: null,
  qaFaceId: null,
  qaSurveyName: `Levantamento Diario ${runId}`,
};

const auth = {};

const pause = async (ms = DEMO_WAIT_MS) => {
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
};

const pushResult = (name, ok, details = {}) => {
  results.push({ name, ok, at: new Date().toISOString(), ...details });
};

const runStep = async (name, fn) => {
  const start = Date.now();
  console.log(`STEP_START ${name}`);
  try {
    const data = await fn();
    pushResult(name, true, { elapsedMs: Date.now() - start, ...(data ?? {}) });
    console.log(`STEP_OK ${name} ${Date.now() - start}ms`);
    return data;
  } catch (error) {
    pushResult(name, false, {
      elapsedMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`STEP_FAIL ${name} ${Date.now() - start}ms`);
    return null;
  }
};

const parseBody = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const unwrap = (payload) => (payload && typeof payload === "object" && "data" in payload ? payload.data : payload);
const asArray = (payload) => {
  const data = unwrap(payload);
  return Array.isArray(data) ? data : [];
};
const asFeatures = (payload) => {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.features)) return data.features;
  return [];
};
const pickId = (obj) => (obj && typeof obj === "object" ? obj.id ?? obj._id ?? null : null);
const withQuery = (endpoint, query = {}) => {
  const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  if (!params.toString()) return endpoint;
  return `${endpoint}${endpoint.includes("?") ? "&" : "?"}${params.toString()}`;
};

const expectStatus = (res, expected, context) => {
  const list = Array.isArray(expected) ? expected : [expected];
  if (!list.includes(res.status)) throw new Error(`${context}: status ${res.status} (esperado ${list.join(",")})`);
};

const apiCall = async ({ method = "GET", endpoint, token, tenantId, body }) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    signal: AbortSignal.timeout(20000),
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await parseBody(response);
  return { status: response.status, payload, data: unwrap(payload) };
};

const waitHydration = async (page) => {
  await page.waitForFunction(() => Boolean(window.next), null, { timeout: 20_000 });
};

const loginUi = async (page, profile) => {
  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitHydration(page);

  await page.locator('input[placeholder="nome@prefeitura.gov.br"]').fill(profile.email);
  await pause();
  await page.locator('input[type="password"]').fill(profile.password);
  await pause();
  await page.locator('input[placeholder="ex: prefeitura-jales"]').fill(TENANT_SLUG);
  await pause();

  const loginReq = page.waitForResponse((res) => res.url().includes("/auth/login") && res.request().method() === "POST");
  await page.getByRole("button", { name: "Entrar" }).click();
  const loginRes = await loginReq;
  if (loginRes.status() >= 400) throw new Error(`Login UI falhou ${profile.key}: ${loginRes.status()}`);
  await page.waitForURL(/\/app\/dashboard/);
  await pause();
};

const polygon = (offset = 0) => {
  const x = GEO.lng + offset * 0.0012;
  const y = GEO.lat + offset * 0.0012;
  return {
    type: "Polygon",
    coordinates: [[[x, y], [x + 0.0008, y], [x + 0.0008, y + 0.0008], [x, y + 0.0008], [x, y]]],
  };
};

const line = (offset = 0) => {
  const x = GEO.lng + offset * 0.001;
  const y = GEO.lat + offset * 0.001;
  return {
    type: "LineString",
    coordinates: [[x, y], [x + 0.0007, y + 0.0004], [x + 0.0011, y + 0.0007]],
  };
};

const searchAndOpenModule = async (page, query, expectedText) => {
  await page.getByRole("button", { name: "Abrir busca global" }).click();
  const input = page.locator('[cmdk-input]').first();
  await input.fill(query);
  await pause();
  await page.keyboard.press("Enter");
  await page.getByText(expectedText).first().waitFor({ state: "visible", timeout: 30_000 });
  await pause();
};

const searchHasResult = async (page, query, resultText) => {
  await page.getByRole("button", { name: "Abrir busca global" }).click();
  const input = page.locator('[cmdk-input]').first();
  await input.fill(query);
  await pause();
  const found = await page.getByText(resultText, { exact: true }).first().isVisible().catch(() => false);
  await page.keyboard.press("Escape");
  await pause(300);
  return found;
};

await fs.mkdir(SCREEN_DIR, { recursive: true });
await fs.writeFile(
  MOBILE_TEST_IMAGE_PATH,
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sI9lWQAAAAASUVORK5CYII=", "base64"),
);

await runStep("bootstrap_admin_login", async () => {
  const adminLogin = await apiCall({
    method: "POST",
    endpoint: "/auth/login",
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, tenantSlug: TENANT_SLUG },
  });
  expectStatus(adminLogin, 201, "admin login");
  auth.admin = { token: adminLogin.data?.accessToken, tenantId: adminLogin.data?.tenantId };
  state.tenantId = adminLogin.data?.tenantId ?? null;
  if (!auth.admin.token || !auth.admin.tenantId) throw new Error("Token/tenant admin ausente");
});

await runStep("setup_profiles_real_roles", async () => {
  for (const profile of profiles.filter((p) => p.key !== "admin")) {
    const createUser = await apiCall({
      method: "POST",
      endpoint: "/admin/users",
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
      body: { email: profile.email, password: profile.password },
    });
    expectStatus(createUser, [200, 201], `create user ${profile.key}`);
    const userId = pickId(createUser.data);

    const createMembership = await apiCall({
      method: "POST",
      endpoint: "/admin/memberships",
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
      body: { tenantId: auth.admin.tenantId, userId, role: profile.role },
    });
    expectStatus(createMembership, [200, 201], `membership ${profile.key}`);

    const login = await apiCall({
      method: "POST",
      endpoint: "/auth/login",
      body: { email: profile.email, password: profile.password, tenantSlug: TENANT_SLUG },
    });
    expectStatus(login, 201, `login ${profile.key}`);
    auth[profile.key] = { token: login.data?.accessToken, tenantId: login.data?.tenantId };
  }
});

await runStep("seed_daily_ctm_data", async () => {
  const projects = await apiCall({ endpoint: "/projects", token: auth.admin.token, tenantId: auth.admin.tenantId });
  expectStatus(projects, 200, "list projects");
  const demoProject = asArray(projects.payload).find((p) => p.slug === "demo") ?? asArray(projects.payload)[0];
  state.defaultProjectId = pickId(demoProject);

  const qaProject = await apiCall({
    method: "POST",
    endpoint: "/projects",
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: { name: `Projeto Diario ${runId}`, slug: `daily-${runId}` },
  });
  expectStatus(qaProject, [200, 201], "create daily project");
  state.qaProjectId = pickId(qaProject.data);
  const targetProjectId = state.defaultProjectId;

  const logradouro = await apiCall({
    method: "POST",
    endpoint: "/ctm/logradouros",
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: {
      projectId: targetProjectId,
      code: `LG-${runId}`,
      name: `Logradouro Diario ${runId}`,
      type: "RUA",
      geometry: line(1),
    },
  });
  expectStatus(logradouro, [200, 201], "create logradouro");
  state.qaLogradouroId = pickId(logradouro.data);

  const parcel = await apiCall({
    method: "POST",
    endpoint: "/ctm/parcels",
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: {
      projectId: targetProjectId,
      sqlu: `SQLU-${runId}`,
      inscription: `INS-${runId}`,
      mainAddress: `Rua Diario ${runId}, 123`,
      status: "ATIVO",
      workflowStatus: "PENDENTE",
      logradouroId: state.qaLogradouroId,
      geometry: polygon(2),
    },
  });
  expectStatus(parcel, [200, 201], "create parcel");
  state.qaParcelId = pickId(parcel.data);

  const updateParcel = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/ctm/parcels/${state.qaParcelId}`, { projectId: targetProjectId }),
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: { workflowStatus: "EM_VALIDACAO", status: "ATIVO" },
  });
  expectStatus(updateParcel, [200, 201], "patch parcel");

  const mobiliario = await apiCall({
    method: "POST",
    endpoint: "/ctm/urban-furniture",
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: {
      projectId: targetProjectId,
      type: `POSTE-${runId}`,
      lat: GEO.lat,
      lng: GEO.lng,
      condition: "BOM",
      notes: `Mobiliario Diario ${runId}`,
    },
  });
  expectStatus(mobiliario, [200, 201], "create mobiliario");
  state.qaMobiliarioId = pickId(mobiliario.data);

  const updateMobiliario = await apiCall({
    method: "PATCH",
    endpoint: withQuery(`/ctm/urban-furniture/${state.qaMobiliarioId}`, { projectId: targetProjectId }),
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: { condition: "REGULAR", notes: `Mobiliario atualizado ${runId}` },
  });
  expectStatus(updateMobiliario, [200, 201], "patch mobiliario");

  const zone = await apiCall({
    method: "POST",
    endpoint: "/pgv/zones",
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: {
      projectId: targetProjectId,
      code: `ZV-${runId}`,
      name: `Zona Valor ${runId}`,
      baseLandValue: 420,
      baseConstructionValue: 760,
      geometry: polygon(4),
    },
  });
  expectStatus(zone, [200, 201], "create pgv zone");
  state.qaZoneId = pickId(zone.data);

  const face = await apiCall({
    method: "POST",
    endpoint: "/pgv/faces",
    token: auth.admin.token,
    tenantId: auth.admin.tenantId,
    body: {
      projectId: targetProjectId,
      code: `F-${runId}`,
      zoneId: state.qaZoneId,
      logradouroId: state.qaLogradouroId,
      landValuePerSqm: 430,
      lado: "NORTE",
      trecho: "LIMITE TERRITORIAL QA",
      geometry: line(5),
    },
  });
  expectStatus(face, [200, 201], "create pgv face");
  state.qaFaceId = pickId(face.data);
});

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO_MS });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  geolocation: { latitude: GEO.lat, longitude: GEO.lng },
  permissions: ["geolocation"],
});
const page = await context.newPage();
page.setDefaultTimeout(50_000);

try {
  await runStep("ui_admin_global_search_modules", async () => {
    await loginUi(page, profiles[0]);
    await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "domcontentloaded" });
    await page.getByText("Painel Executivo").first().waitFor({ state: "visible", timeout: 30_000 });
    await searchAndOpenModule(page, "Parcelas", "CTM - Parcelas");
    await searchAndOpenModule(page, "Mapas", "Camadas & Filtros");
    await searchAndOpenModule(page, "Levantamentos", "Levantamentos & Entregaveis");
  });

  await runStep("ui_admin_map_layers_filters_full", async () => {
    await loginUi(page, profiles[0]);
    await page.goto(`${BASE_URL}/app/maps`, { waitUntil: "domcontentloaded" });
    await page.locator("canvas.maplibregl-canvas").first().waitFor({ state: "visible", timeout: 30_000 });

    const layerToggles = page.locator('button[aria-label^="Alternar camada "]');
    const count = await layerToggles.count();
    if (count > 0) {
      const togglesToTest = Math.min(count, 10);
      for (let i = 0; i < togglesToTest; i += 1) {
        await layerToggles.nth(i).click();
        await pause();
      }
      for (let i = 0; i < togglesToTest; i += 1) {
        await layerToggles.nth(i).click();
        await pause();
      }
    }

    const ranges = page.locator('input[type="range"]');
    const rangeCount = await ranges.count();
    if (rangeCount > 0) {
      const first = ranges.nth(0);
      await first.fill("35");
      await pause();
      await first.fill("82");
      await pause();
    }

    const upButtons = page.getByRole("button", { name: "Up" });
    if (await upButtons.count()) {
      await upButtons.first().click();
      await pause();
    }
    const downButtons = page.getByRole("button", { name: "Down" });
    if (await downButtons.count()) {
      await downButtons.first().click();
      await pause();
    }

    const statusSelect = page.locator('label:has-text("Status cadastral") + select').first();
    await statusSelect.selectOption("ATIVO");
    await pause();
    await statusSelect.selectOption("all");
    await pause();

    const zoneSelect = page.locator('label:has-text("Zona de valor") + select').first();
    const optionsCount = await zoneSelect.locator("option").count();
    if (optionsCount > 1) {
      const secondValue = await zoneSelect.locator("option").nth(1).getAttribute("value");
      if (secondValue) {
        await zoneSelect.selectOption(secondValue);
        await pause();
        await zoneSelect.selectOption("all");
        await pause();
      }
    }

    await page.getByPlaceholder("Min").fill("100000");
    await pause();
    await page.getByPlaceholder("Max").fill("500000");
    await pause();
    await page.getByPlaceholder("Min").fill("");
    await page.getByPlaceholder("Max").fill("");
    await pause();

    await page.getByRole("button", { name: "Desenhar Terreno" }).click();
    const canvas = page.locator("canvas.maplibregl-canvas").first();
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas nao encontrado");

    const p1 = { x: box.x + box.width * 0.60, y: box.y + box.height * 0.40 };
    const p2 = { x: box.x + box.width * 0.67, y: box.y + box.height * 0.45 };
    const p3 = { x: box.x + box.width * 0.65, y: box.y + box.height * 0.53 };
    const p4 = { x: box.x + box.width * 0.57, y: box.y + box.height * 0.50 };

    await page.mouse.click(p1.x, p1.y);
    await pause();
    await page.mouse.click(p2.x, p2.y);
    await pause();
    await page.mouse.click(p3.x, p3.y);
    await pause();
    await page.mouse.dblclick(p4.x, p4.y);
    const saveTitle = page.getByText("Salvar geometria");
    const modalVisible = await saveTitle.isVisible().catch(() => false);
    const mapFeatureName = `QA-DESENHO-${runId}`;
    if (modalVisible) {
      await page.getByPlaceholder("Opcional").first().fill(mapFeatureName);
      await pause();
      await page.getByRole("button", { name: "Salvar" }).click();
      await pause(1500);

      const createdFeatures = await apiCall({
        endpoint: withQuery("/map-features/geojson", {
          projectId: state.defaultProjectId,
          type: "parcel",
        }),
        token: auth.admin.token,
        tenantId: auth.admin.tenantId,
      });
      expectStatus(createdFeatures, 200, "list created map features");
      const created = asFeatures(createdFeatures.payload).find((feature) => feature?.properties?.name === mapFeatureName);
      if (!created) throw new Error("Geometria desenhada nao foi salva no mapa");
      const createdId = String(created.id ?? created.properties?.mapFeatureId ?? "");
      if (!createdId) throw new Error("Geometria salva sem id para validacao");

      const centerX = (p1.x + p2.x + p3.x + p4.x) / 4;
      const centerY = (p1.y + p2.y + p3.y + p4.y) / 4;

      await page.getByRole("button", { name: "Selecionar/Editar" }).click();
      await pause();
      await page.mouse.click(centerX, centerY);
      await pause();

      await page.getByRole("button", { name: "Excluir" }).click();
      await pause();
      await page.mouse.click(centerX, centerY);
      await pause(2000);

      const afterDelete = await apiCall({
        endpoint: withQuery("/map-features/geojson", {
          projectId: state.defaultProjectId,
          type: "parcel",
        }),
        token: auth.admin.token,
        tenantId: auth.admin.tenantId,
      });
      expectStatus(afterDelete, 200, "list map features after delete");
      const stillExists = asFeatures(afterDelete.payload).some((feature) => {
        const id = String(feature?.id ?? feature?.properties?.mapFeatureId ?? "");
        return id === createdId;
      });
      if (stillExists) throw new Error("Excluir desenho no mapa nao removeu a geometria");
    } else {
      const createFeature = await apiCall({
        method: "POST",
        endpoint: "/map-features",
        token: auth.admin.token,
        tenantId: auth.admin.tenantId,
        body: {
          projectId: state.defaultProjectId,
          featureType: "parcel",
          properties: { source: "daily-fallback" },
          geometry: polygon(9),
        },
      });
      expectStatus(createFeature, [200, 201], "fallback create map feature");
      const featureId = pickId(createFeature.data);
      if (featureId) {
        const updateFeature = await apiCall({
          method: "PATCH",
          endpoint: withQuery(`/map-features/${featureId}`, { projectId: state.defaultProjectId }),
          token: auth.admin.token,
          tenantId: auth.admin.tenantId,
          body: {
            properties: { source: "daily-fallback-edited", name: `fallback-${runId}` },
          },
        });
        expectStatus(updateFeature, [200, 201], "fallback update map feature");

        const deleteFeature = await apiCall({
          method: "DELETE",
          endpoint: withQuery(`/map-features/${featureId}`, { projectId: state.defaultProjectId }),
          token: auth.admin.token,
          tenantId: auth.admin.tenantId,
        });
        expectStatus(deleteFeature, [200, 204], "fallback delete map feature");
      }
    }

    await page.screenshot({ path: path.join(SCREEN_DIR, `admin-mapas-camadas-filtros-${runId}.png`), fullPage: true });
  });

  await runStep("ui_admin_levantamentos_full", async () => {
    await page.goto(`${BASE_URL}/app/levantamentos`, { waitUntil: "domcontentloaded" });
    await page.getByText("Levantamentos & Entregaveis").first().waitFor({ state: "visible" });

    await page.getByPlaceholder("Nome").fill(state.qaSurveyName);
    await pause();
    await page.locator("select").first().selectOption("AEROFOTO_RGB_5CM");
    await pause();
    await page.getByPlaceholder("Municipio").fill("Jales");
    await pause();
    await page.getByPlaceholder("GSD cm").fill("5");
    await pause();
    await page.getByPlaceholder("SRC/Datum").fill("SIRGAS2000 / EPSG:4326");
    await pause();
    await page.getByPlaceholder("Precisao").fill("5cm");
    await pause();
    await page.getByPlaceholder("Fornecedor").fill("FlyDea QA Daily");
    await pause();

    await page.getByRole("button", { name: "Criar levantamento" }).click();
    await page.getByText(state.qaSurveyName).first().waitFor({ state: "visible", timeout: 30_000 });
    await pause();

    const surveys = await apiCall({
      endpoint: "/surveys",
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
    });
    expectStatus(surveys, 200, "list surveys for selected id");
    const selectedSurvey = asArray(surveys.payload).find((item) => item.name === state.qaSurveyName);
    const selectedSurveyId = pickId(selectedSurvey);
    if (!selectedSurveyId) throw new Error("Nao foi possivel localizar levantamento criado");

    const completeMockFile = await apiCall({
      method: "POST",
      endpoint: `/surveys/${selectedSurveyId}/files/complete`,
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
      body: {
        key: `tenants/${state.tenantId}/rasters/ortomosaico-mock.tif`,
        name: "ortomosaico-mock.tif",
        category: "GEOTIFF",
        mimeType: "image/tiff",
        size: 2048,
      },
    });
    expectStatus(completeMockFile, [200, 201], "attach mock file to survey");

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: state.qaSurveyName }).click();
    await pause();

    await apiCall({
      method: "PATCH",
      endpoint: `/surveys/${selectedSurveyId}/qa`,
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
      body: {
        coverageOk: true,
        georeferencingOk: true,
        qualityOk: true,
        comments: "QA diario aprovado",
      },
    });
    await apiCall({
      method: "POST",
      endpoint: `/surveys/${selectedSurveyId}/publish`,
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
      body: {},
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: state.qaSurveyName }).click();
    await page.getByText("Publicado:").first().waitFor({ state: "visible", timeout: 50_000 });

    await page.screenshot({ path: path.join(SCREEN_DIR, `admin-levantamentos-${runId}.png`), fullPage: true });
  });

  await runStep("ui_admin_ctm_views_with_seeded_data", async () => {
    const verifyParcel = await apiCall({
      endpoint: withQuery("/ctm/parcels", { sqlu: `SQLU-${runId}` }),
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
    });
    expectStatus(verifyParcel, 200, "verify parcel by api");
    if (asArray(verifyParcel.payload).length === 0) throw new Error("Parcela diaria nao encontrada via API");

    const verifyLogradouro = await apiCall({
      endpoint: "/ctm/logradouros",
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
    });
    expectStatus(verifyLogradouro, 200, "verify logradouro by api");
    if (!asArray(verifyLogradouro.payload).some((item) => (item.code ?? item.codigo) === `LG-${runId}`)) {
      throw new Error("Logradouro diario nao encontrado via API");
    }

    const verifyFurniture = await apiCall({
      endpoint: "/ctm/urban-furniture",
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
    });
    expectStatus(verifyFurniture, 200, "verify mobiliario by api");
    if (!asArray(verifyFurniture.payload).some((item) => (item.type ?? item.tipo) === `POSTE-${runId}`)) {
      throw new Error("Mobiliario diario nao encontrado via API");
    }

    await page.goto(`${BASE_URL}/app/ctm/parcelas`, { waitUntil: "domcontentloaded" });
    await page.getByText("CTM - Parcelas").waitFor({ state: "visible" });
    await pause();

    await page.goto(`${BASE_URL}/app/ctm/logradouros`, { waitUntil: "domcontentloaded" });
    await page.getByText("CTM - Logradouros").waitFor({ state: "visible" });
    await pause();

    await page.goto(`${BASE_URL}/app/ctm/mobiliario`, { waitUntil: "domcontentloaded" });
    await page.getByText("CTM - Mobiliario Urbano").waitFor({ state: "visible" });

    await page.screenshot({ path: path.join(SCREEN_DIR, `admin-ctm-completo-${runId}.png`), fullPage: true });
  });

  await runStep("ui_admin_pgv_zones_faces_limits", async () => {
    const zones = await apiCall({
      endpoint: "/pgv/zones",
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
    });
    expectStatus(zones, 200, "list pgv zones");
    if (!asArray(zones.payload).some((item) => pickId(item) === state.qaZoneId)) {
      throw new Error("Zona de valor diaria nao encontrada");
    }

    const faces = await apiCall({
      endpoint: "/pgv/faces",
      token: auth.admin.token,
      tenantId: auth.admin.tenantId,
    });
    expectStatus(faces, 200, "list pgv faces");
    if (!asArray(faces.payload).some((item) => pickId(item) === state.qaFaceId)) {
      throw new Error("Linha de limite (face) diaria nao encontrada");
    }

    await page.goto(`${BASE_URL}/app/pgv/zonas`, { waitUntil: "domcontentloaded" });
    await page.getByText("PGV - Zonas de Valor").first().waitFor({ state: "visible", timeout: 30_000 });
    await pause();

    await page.goto(`${BASE_URL}/app/pgv/faces`, { waitUntil: "domcontentloaded" });
    await page.getByText("PGV - Faces").first().waitFor({ state: "visible", timeout: 30_000 });
    await pause();
  });

  await runStep("ui_admin_mobile_full_fields", async () => {
    await page.goto(`${BASE_URL}/mobile`, { waitUntil: "domcontentloaded" });
    await page.getByText("FlyDea Mobile Campo").first().waitFor({ state: "visible", timeout: 30_000 });

    await page.getByPlaceholder("Buscar parcela por SQLU, inscricao ou endereco").fill(`SQLU-${runId}`);
    await pause();
    await page.getByRole("button", { name: "Buscar" }).click();
    await pause(1500);

    await page.locator("div.max-h-40").locator("button").first().click();
    await pause();

    const checks = page.locator('input[type="checkbox"]');
    const checkCount = await checks.count();
    for (let i = 0; i < checkCount; i += 1) {
      await checks.nth(i).check();
      await pause(200);
    }

    await page.getByPlaceholder("Observacoes de campo").fill(`Checklist completo mobile ${runId}`);
    await pause();
    await page.getByRole("button", { name: "Capturar GPS" }).click();
    await pause(1200);

    await page.locator('input[type="file"]').setInputFiles(MOBILE_TEST_IMAGE_PATH);
    await pause(800);

    await page.getByRole("button", { name: "Salvar offline" }).click();
    await pause(1200);
    await page.getByText("registro(s) aguardando sincronizacao", { exact: false }).first().waitFor({ state: "visible", timeout: 15_000 });

    await page.getByRole("button", { name: "Sincronizar agora" }).click();
    await pause(2500);

    await page.screenshot({ path: path.join(SCREEN_DIR, `admin-mobile-completo-${runId}.png`), fullPage: true });
  });

  const smokeRoutesByRole = {
    GESTOR: [
      { route: "/app/dashboard", text: "Painel Executivo" },
      { route: "/app/maps", text: "Camadas & Filtros" },
      { route: "/app/levantamentos", text: "Levantamentos & Entregaveis" },
      { route: "/app/ctm/parcelas", text: "CTM - Parcelas" },
      { route: "/app/ctm/logradouros", text: "CTM - Logradouros" },
      { route: "/app/ctm/mobiliario", text: "CTM - Mobiliario Urbano" },
      { route: "/app/pgv/zonas", text: "PGV - Zonas de Valor" },
      { route: "/app/pgv/faces", text: "PGV - Faces" },
      { route: "/mobile", text: "FlyDea Mobile Campo" },
    ],
    OPERADOR: [
      { route: "/app/dashboard", text: "Painel Executivo" },
      { route: "/app/maps", text: "Camadas & Filtros" },
      { route: "/app/levantamentos", text: "Levantamentos & Entregaveis" },
      { route: "/app/ctm/parcelas", text: "CTM - Parcelas" },
      { route: "/app/ctm/logradouros", text: "CTM - Logradouros" },
      { route: "/app/ctm/mobiliario", text: "CTM - Mobiliario Urbano" },
      { route: "/app/pgv/zonas", text: "PGV - Zonas de Valor" },
      { route: "/app/pgv/faces", text: "PGV - Faces" },
      { route: "/mobile", text: "FlyDea Mobile Campo" },
    ],
    LEITOR: [
      { route: "/app/dashboard", text: "Painel Executivo" },
      { route: "/app/poc", text: "PoC 95% - Aderencia" },
      { route: "/mobile", text: "Acesso restrito" },
    ],
  };

  for (const profile of profiles.slice(1)) {
    await runStep(`ui_profile_${profile.key}_daily_navigation`, async () => {
      await loginUi(page, profile);
      const roleRoutes = smokeRoutesByRole[profile.role] ?? smokeRoutesByRole.OPERADOR;
      for (const item of roleRoutes) {
        await page.goto(`${BASE_URL}${item.route}`, { waitUntil: "domcontentloaded" });
        await page.getByText(item.text).first().waitFor({ state: "visible", timeout: 30_000 });
        await pause();
      }

      await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "domcontentloaded" });
      const canSeeParcelasInSearch = await searchHasResult(page, "Parcelas", "Parcelas");
      const canSeePocInSearch = await searchHasResult(page, "PoC", "PoC");

      if (profile.role === "LEITOR" && canSeeParcelasInSearch) {
        throw new Error("Perfil LEITOR nao deveria ver modulo Parcelas na busca");
      }
      if (!canSeePocInSearch) {
        throw new Error(`Perfil ${profile.role} sem acesso ao modulo PoC na busca`);
      }

      await page.screenshot({ path: path.join(SCREEN_DIR, `${profile.key}-daily-${runId}.png`), fullPage: true });
    });
  }
} finally {
  await context.close();
  await browser.close();
}

const passed = results.filter((item) => item.ok).length;
const failed = results.length - passed;
const report = {
  generatedAt: new Date().toISOString(),
  runId,
  baseUrl: BASE_URL,
  apiUrl: API_URL,
  tenantSlug: TENANT_SLUG,
  profiles: profiles.map((p) => ({ key: p.key, email: p.email, role: p.role })),
  state,
  totals: {
    passed,
    failed,
    total: results.length,
    score: results.length ? Math.round((passed / results.length) * 100) : 0,
  },
  results,
};

await fs.writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ runId, totals: report.totals, report: REPORT_JSON, screens: SCREEN_DIR }, null, 2));

if (failed > 0) process.exitCode = 1;
