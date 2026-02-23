#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://host.docker.internal:3000";
const API_URL = process.env.API_URL || "http://host.docker.internal:4000";

const CREDENTIALS = {
  email: process.env.TEST_EMAIL || "admin@demo.local",
  password: process.env.TEST_PASSWORD || "Admin@12345",
  tenantSlug: process.env.TEST_TENANT || "demo",
};

const TIMEOUT_MS = 45_000;
const HYDRATION_TIMEOUT_MS = 20_000;
const HEADLESS = (process.env.PW_HEADLESS ?? "true") !== "false";
const SLOW_MO_MS = Number(process.env.PW_SLOWMO_MS ?? "0");
const SCREEN_DIR = path.resolve(process.cwd(), "poc/checks/browser-screens");
const REPORT_PATH = path.resolve(process.cwd(), "poc/checks/browser-functional-report.json");

const results = [];

const pushResult = (name, ok, details = {}) => {
  results.push({
    name,
    ok,
    at: new Date().toISOString(),
    ...details,
  });
};

const sanitize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const runStep = async (name, fn) => {
  const start = Date.now();
  try {
    await fn();
    pushResult(name, true, { elapsedMs: Date.now() - start });
  } catch (error) {
    pushResult(name, false, {
      elapsedMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const assertNoRuntimeOverlay = async (page) => {
  const runtimeError = page.getByText("Unhandled Runtime Error");
  if (await runtimeError.count()) {
    throw new Error("Runtime error overlay encontrado na pagina");
  }
};

const waitForClientHydration = async (page) => {
  await page.waitForFunction(() => Boolean(window.next), null, { timeout: HYDRATION_TIMEOUT_MS });
};

const ensureLoggedOutSession = async (page) => {
  await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "domcontentloaded" });
  const pathName = new URL(page.url()).pathname;

  if (pathName.startsWith("/app")) {
    try {
      const sidebarLogout = page.getByRole("button", { name: "Sair" }).first();
      if (await sidebarLogout.isVisible()) {
        await sidebarLogout.click();
      } else {
        await page.getByRole("button", { name: /usuario/i }).click();
        await page.getByRole("menuitem", { name: "Sair" }).click();
      }
      await page.waitForURL(/\/login/, { timeout: TIMEOUT_MS });
    } catch {
      // If the UI logout path is unavailable, fallback to storage cleanup below.
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
  { path: "/mobile", text: "Mobile" },
];

await fs.mkdir(SCREEN_DIR, { recursive: true });

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO_MS });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(TIMEOUT_MS);

try {
  await runStep("session_reset_logout_then_clean_login", async () => {
    await ensureLoggedOutSession(page);
    await page.screenshot({ path: path.join(SCREEN_DIR, "00-session-reset.png"), fullPage: true });
  });

  await runStep("login_page_open", async () => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.getByText("Entrar no painel").waitFor({ state: "visible" });
    await waitForClientHydration(page);
    await assertNoRuntimeOverlay(page);
    await page.screenshot({ path: path.join(SCREEN_DIR, "01-login.png"), fullPage: true });
  });

  await runStep("login_submit", async () => {
    await page.locator('input[placeholder="nome@prefeitura.gov.br"]').fill(CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.password);
    await page.locator('input[placeholder="ex: prefeitura-jales"]').fill(CREDENTIALS.tenantSlug);
    const loginResponse = page.waitForResponse(
      (res) => res.url().includes("/auth/login") && res.request().method() === "POST",
      { timeout: TIMEOUT_MS },
    );
    await page.getByRole("button", { name: "Entrar" }).click();
    const response = await loginResponse;
    if (response.status() >= 400) {
      throw new Error(`Falha no login: status ${response.status()}`);
    }
    if (page.url().includes("email=") || page.url().includes("tenantSlug=")) {
      throw new Error("Formulario enviou GET sem hidratacao de cliente");
    }
    await page.waitForURL(/\/app\/dashboard/, { timeout: TIMEOUT_MS });
    await page.getByText("Dashboard").first().waitFor({ state: "visible" });
    await assertNoRuntimeOverlay(page);
    await page.screenshot({ path: path.join(SCREEN_DIR, "02-dashboard.png"), fullPage: true });
  });

  await runStep("map_draw_save_delete", async () => {
    await page.goto(`${BASE_URL}/app/maps`, { waitUntil: "domcontentloaded" });
    await page.getByText("Mapas & Drones").first().waitFor({ state: "visible" });
    await assertNoRuntimeOverlay(page);

    await page.getByRole("button", { name: "Desenhar Terreno" }).click();
    const canvas = page.locator("canvas.maplibregl-canvas").first();
    await canvas.waitFor({ state: "visible" });
    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error("Canvas do mapa nao encontrado");
    }

    const p1 = { x: box.x + box.width * 0.62, y: box.y + box.height * 0.40 };
    const p2 = { x: box.x + box.width * 0.66, y: box.y + box.height * 0.46 };
    const p3 = { x: box.x + box.width * 0.60, y: box.y + box.height * 0.54 };

    await page.mouse.click(p1.x, p1.y);
    await page.mouse.click(p2.x, p2.y);
    await page.mouse.dblclick(p3.x, p3.y);

    await page.getByText("Salvar geometria").waitFor({ state: "visible" });
    await page.locator('input[placeholder="Opcional"]').first().fill(`Teste ${Date.now()}`);
    await page.getByRole("button", { name: "Salvar" }).click();

    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Excluir" }).click();
    await page.mouse.click(p1.x, p1.y);
    await page.waitForTimeout(1200);

    await assertNoRuntimeOverlay(page);
    await page.screenshot({ path: path.join(SCREEN_DIR, "03-map-draw-delete.png"), fullPage: true });
  });

  for (const route of routeSmoke) {
    await runStep(`route_${sanitize(route.path)}`, async () => {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
      await page.getByText(route.text).first().waitFor({ state: "visible" });
      await assertNoRuntimeOverlay(page);
      await page.screenshot({
        path: path.join(SCREEN_DIR, `${sanitize(route.path)}.png`),
        fullPage: true,
      });
    });
  }

  await runStep("api_checks_from_logged_session", async () => {
    const auth = await page.evaluate(() => ({
      accessToken: window.localStorage.getItem("accessToken"),
      tenantId: window.localStorage.getItem("tenantId"),
    }));
    if (!auth.accessToken || !auth.tenantId) {
      throw new Error("Token ou tenant nao encontrado na sessao logada");
    }

    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
      "X-Tenant-Id": auth.tenantId,
      "Content-Type": "application/json",
    };

    const endpoints = [
      "/health",
      "/metrics",
      "/poc/health",
      "/poc/score",
      "/layers",
      "/projects",
      "/ctm/parcels",
      "/pgv/zones",
      "/pgv/faces",
      "/pgv/factor-sets",
      "/pgv/valuations",
      "/surveys",
      "/tax-integration/connectors",
      "/notifications-letters/templates",
      "/compliance",
      "/mobile/ctm-sync",
    ];

    const statusMap = {};
    for (const endpoint of endpoints) {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: endpoint === "/health" || endpoint === "/metrics" || endpoint.startsWith("/poc/")
          ? {}
          : headers,
      });
      statusMap[endpoint] = response.status;
    }

    const failed = Object.entries(statusMap).filter(([, status]) => status >= 400);
    if (failed.length > 0) {
      throw new Error(`Endpoints com falha: ${failed.map(([ep, st]) => `${ep}:${st}`).join(", ")}`);
    }

    const pocScoreResponse = await fetch(`${API_URL}/poc/score`);
    if (!pocScoreResponse.ok) {
      throw new Error(`/poc/score retornou status ${pocScoreResponse.status}`);
    }
    const pocScorePayload = await pocScoreResponse.json();
    const pocScore = pocScorePayload?.data ?? pocScorePayload;
    const score = Number(pocScore?.score ?? 0);
    const threshold = Number(pocScore?.threshold ?? 95);
    if (score < threshold) {
      throw new Error(`Score da PoC abaixo do minimo da licitacao: ${score} < ${threshold}`);
    }
  });
} finally {
  await context.close();
  await browser.close();
}

const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  apiUrl: API_URL,
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
