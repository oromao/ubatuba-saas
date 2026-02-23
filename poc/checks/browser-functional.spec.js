const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://host.docker.internal:3000";
const API_URL = process.env.API_URL || "http://host.docker.internal:4000";
const EMAIL = process.env.TEST_EMAIL || "admin@demo.local";
const PASSWORD = process.env.TEST_PASSWORD || "Admin@12345";
const TENANT = process.env.TEST_TENANT || "demo";

const SCREEN_DIR = path.resolve(process.cwd(), "poc/checks/browser-screens");
fs.mkdirSync(SCREEN_DIR, { recursive: true });

const routeSmoke = [
  { path: "/app/dashboard", text: "Dashboard" },
  { path: "/app/maps", text: "Mapas & Drones" },
  { path: "/app/levantamentos", text: "Levantamentos" },
  { path: "/app/ctm/parcelas", text: "Parcelas" },
  { path: "/app/ctm/logradouros", text: "Logradouros" },
  { path: "/app/ctm/mobiliario", text: "Mobiliario" },
  { path: "/app/pgv/zonas", text: "Zonas" },
  { path: "/app/pgv/faces", text: "Faces" },
  { path: "/app/pgv/fatores", text: "Fatores" },
  { path: "/app/pgv/relatorio", text: "Relatorio" },
  { path: "/app/integracoes", text: "Integracoes" },
  { path: "/app/cartas", text: "Cartas" },
  { path: "/app/compliance", text: "Compliance" },
  { path: "/app/poc", text: "PoC" },
  { path: "/mobile", text: "FlyDea Mobile Campo" },
];

const noRuntimeOverlay = async (page) => {
  await expect(page.getByText("Unhandled Runtime Error")).toHaveCount(0);
};

const waitForClientHydration = async (page) => {
  await page.waitForFunction(() => Boolean(window.next), null, { timeout: 20_000 });
};

const ensureLoggedOutSession = async (page) => {
  await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "domcontentloaded" });
  const pathName = new URL(page.url()).pathname;
  if (pathName.startsWith("/app")) {
    const sidebarLogout = page.getByRole("button", { name: "Sair" }).first();
    if (await sidebarLogout.isVisible()) {
      await sidebarLogout.click();
      await page.waitForURL(/\/login/);
    }
  }

  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("tenantId");
    window.sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForClientHydration(page);
};

test.setTimeout(15 * 60 * 1000);

test("guia completo - fluxo funcional em navegador", async ({ page, request }) => {
  await test.step("Reset de sessao (logout + limpeza)", async () => {
    await ensureLoggedOutSession(page);
    await page.screenshot({ path: path.join(SCREEN_DIR, "00-session-reset.png"), fullPage: true });
  });

  await test.step("Login", async () => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Entrar no painel")).toBeVisible();
    await waitForClientHydration(page);
    await noRuntimeOverlay(page);

    await page.locator('input[placeholder="nome@prefeitura.gov.br"]').fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('input[placeholder="ex: prefeitura-jales"]').fill(TENANT);
    const loginResp = page.waitForResponse(
      (res) => res.url().includes("/auth/login") && res.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect((await loginResp).ok()).toBeTruthy();

    await page.waitForURL(/\/app\/dashboard/);
    await expect(page.getByText("Dashboard").first()).toBeVisible();
    await noRuntimeOverlay(page);
    await page.screenshot({ path: path.join(SCREEN_DIR, "01-dashboard.png"), fullPage: true });
  });

  await test.step("Mapa: desenhar e excluir", async () => {
    await page.goto(`${BASE_URL}/app/maps`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Mapas & Drones").first()).toBeVisible();
    await noRuntimeOverlay(page);

    await page.getByRole("button", { name: "Desenhar Terreno" }).click();
    const canvas = page.locator("canvas.maplibregl-canvas").first();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error("Canvas do mapa nao encontrado para desenhar");
    }

    const p1 = { x: box.x + box.width * 0.62, y: box.y + box.height * 0.40 };
    const p2 = { x: box.x + box.width * 0.66, y: box.y + box.height * 0.46 };
    const p3 = { x: box.x + box.width * 0.60, y: box.y + box.height * 0.54 };

    await page.mouse.click(p1.x, p1.y);
    await page.mouse.click(p2.x, p2.y);
    await page.mouse.dblclick(p3.x, p3.y);

    await expect(page.getByText("Salvar geometria")).toBeVisible();
    await page.locator('input[placeholder="Opcional"]').first().fill(`Teste ${Date.now()}`);

    const createResp = page.waitForResponse(
      (res) => res.url().includes("/map-features") && res.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect((await createResp).ok()).toBeTruthy();

    await page.waitForTimeout(1200);
    const deleteResp = page.waitForResponse(
      (res) => res.url().includes("/map-features/") && res.request().method() === "DELETE",
    );
    await page.getByRole("button", { name: "Excluir" }).click();
    await page.mouse.click(p1.x, p1.y);
    await expect((await deleteResp).ok()).toBeTruthy();

    await noRuntimeOverlay(page);
    await page.screenshot({ path: path.join(SCREEN_DIR, "02-map-draw-delete.png"), fullPage: true });
  });

  await test.step("Navegacao dos modulos do guia", async () => {
    for (const route of routeSmoke) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByText(route.text).first()).toBeVisible();
      await noRuntimeOverlay(page);
      await page.screenshot({
        path: path.join(
          SCREEN_DIR,
          `${route.path.replace(/\//g, "_").replace(/^_+/, "") || "root"}.png`,
        ),
        fullPage: true,
      });
    }
  });

  await test.step("Checks de API aderentes ao guia", async () => {
    const auth = await page.evaluate(() => ({
      accessToken: window.localStorage.getItem("accessToken"),
      tenantId: window.localStorage.getItem("tenantId"),
    }));
    expect(auth.accessToken).toBeTruthy();
    expect(auth.tenantId).toBeTruthy();

    const privateHeaders = {
      Authorization: `Bearer ${auth.accessToken}`,
      "X-Tenant-Id": auth.tenantId,
      "Content-Type": "application/json",
    };

    const apiChecks = [
      { path: "/health", isPublic: true },
      { path: "/metrics", isPublic: true },
      { path: "/poc/health", isPublic: true },
      { path: "/poc/score", isPublic: true },
      { path: "/layers" },
      { path: "/projects" },
      { path: "/ctm/parcels" },
      { path: "/pgv/zones" },
      { path: "/pgv/faces" },
      { path: "/pgv/factor-sets" },
      { path: "/pgv/valuations" },
      { path: "/surveys" },
      { path: "/tax-integration/connectors" },
      { path: "/notifications-letters/templates" },
      { path: "/compliance" },
      { path: "/mobile/ctm-sync" },
    ];

    for (const check of apiChecks) {
      const response = await request.get(`${API_URL}${check.path}`, {
        headers: check.isPublic ? {} : privateHeaders,
      });
      expect(response.status(), `Falha em ${check.path}`).toBeLessThan(400);
    }

    const scoreResponse = await request.get(`${API_URL}/poc/score`);
    expect(scoreResponse.status()).toBeLessThan(400);
    const scorePayload = await scoreResponse.json();
    const scoreData = scorePayload.data ?? scorePayload;
    expect(Number(scoreData.score)).toBeGreaterThanOrEqual(Number(scoreData.threshold ?? 95));
  });
});
