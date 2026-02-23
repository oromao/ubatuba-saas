#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const TENANT = process.env.TEST_TENANT || "demo";
const ADMIN_EMAIL = process.env.TEST_EMAIL || "admin@demo.local";
const ADMIN_PASSWORD = process.env.TEST_PASSWORD || "Admin@12345";
const TEST_MODE = String(process.env.TEST_MODE || "false") === "true";
const HEADLESS = (process.env.PW_HEADLESS ?? "false") !== "false";
const SLOW_MO_MS = Number(process.env.PW_SLOWMO_MS ?? "0");
const DEMO_WAIT_MS = Number(process.env.DEMO_WAIT_MS ?? "0");

const runId = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
const OUTPUT_INVENTORY = path.resolve(process.cwd(), "docs/ui-inventory.json");
const OUTPUT_REPORT = path.resolve(process.cwd(), "docs/ui-crawler-report.json");

const appRoutes = [
  "/app/dashboard",
  "/app/maps",
  "/app/levantamentos",
  "/app/ctm/parcelas",
  "/app/ctm/logradouros",
  "/app/ctm/mobiliario",
  "/app/pgv/zonas",
  "/app/pgv/faces",
  "/app/pgv/fatores",
  "/app/pgv/relatorio",
  "/app/integracoes",
  "/app/cartas",
  "/app/compliance",
  "/app/poc",
  "/app/assets",
  "/app/alerts",
  "/app/processes",
  "/mobile",
];

const publicRoutes = ["/", "/login"];
const allRoutes = [...publicRoutes, ...appRoutes];

const profiles = [
  { key: "admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "ADMIN" },
  { key: "gestor", email: `gestor.crawler.${runId}@demo.local`, password: "Gestor@12345", role: "GESTOR" },
  { key: "operador", email: `operador.crawler.${runId}@demo.local`, password: "Operador@12345", role: "OPERADOR" },
  { key: "campo", email: `campo.crawler.${runId}@demo.local`, password: "Campo@12345", role: "OPERADOR" },
  { key: "leitor", email: `leitor.crawler.${runId}@demo.local`, password: "Leitor@12345", role: "LEITOR" },
];

const destructivePattern = /(excluir|apagar|remover|delete|trash|cancelar lote|encerrar|logout|sair)/i;
const navPattern = /(dashboard|mapas|levantamentos|parcelas|logradouros|mobiliario|zonas|faces|fatores|relatorio|integracoes|cartas|compliance|poc|ativos|alertas|processos|mobile|abrir busca global)/i;
const hydrationPattern = /(hydration|did not match|server-rendered html|hydrating)/i;

const sleep = async (ms = DEMO_WAIT_MS) => {
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
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

const unwrap = (payload) =>
  payload && typeof payload === "object" && "data" in payload ? payload.data : payload;

const pickId = (obj) => (obj && typeof obj === "object" ? obj.id ?? obj._id ?? null : null);

const apiCall = async ({ method = "GET", endpoint, token, tenantId, body }) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await parseBody(response);
  return { status: response.status, data: unwrap(payload), payload };
};

const ensureProfiles = async () => {
  const adminLogin = await apiCall({
    method: "POST",
    endpoint: "/auth/login",
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, tenantSlug: TENANT },
  });
  if (adminLogin.status !== 201) {
    throw new Error(`Falha login admin bootstrap: ${adminLogin.status}`);
  }

  const admin = {
    token: adminLogin.data?.accessToken,
    tenantId: adminLogin.data?.tenantId,
  };

  const auth = { admin: adminLogin.data };

  for (const profile of profiles.filter((p) => p.key !== "admin")) {
    const createUser = await apiCall({
      method: "POST",
      endpoint: "/admin/users",
      token: admin.token,
      tenantId: admin.tenantId,
      body: { email: profile.email, password: profile.password },
    });
    if (![200, 201].includes(createUser.status)) {
      throw new Error(`Falha criar user ${profile.key}: ${createUser.status}`);
    }

    const userId = pickId(createUser.data);
    const createMembership = await apiCall({
      method: "POST",
      endpoint: "/admin/memberships",
      token: admin.token,
      tenantId: admin.tenantId,
      body: { tenantId: admin.tenantId, userId, role: profile.role },
    });
    if (![200, 201].includes(createMembership.status)) {
      throw new Error(`Falha membership ${profile.key}: ${createMembership.status}`);
    }

    const login = await apiCall({
      method: "POST",
      endpoint: "/auth/login",
      body: { email: profile.email, password: profile.password, tenantSlug: TENANT },
    });
    if (login.status !== 201) {
      throw new Error(`Falha login ${profile.key}: ${login.status}`);
    }
    auth[profile.key] = login.data;
  }

  return auth;
};

const extractPageInventory = async (page, profileKey, route) => {
  const title = await page.locator("h1").first().textContent().catch(() => null);

  const data = await page.evaluate(() => {
    const visible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
    };

    const mapEl = (el) => ({
      text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120),
      type: el.getAttribute("type") || null,
      name: el.getAttribute("name") || null,
      id: el.id || null,
      dataTestId: el.getAttribute("data-testid") || null,
      required: el.hasAttribute("required"),
      disabled: el.hasAttribute("disabled"),
      readOnly: el.hasAttribute("readonly"),
      tag: el.tagName.toLowerCase(),
    });

    const buttons = Array.from(document.querySelectorAll('button')).filter(visible).map(mapEl);
    const inputs = Array.from(document.querySelectorAll('input, textarea')).filter(visible).map(mapEl);
    const selects = Array.from(document.querySelectorAll('select')).filter(visible).map((el) => ({
      ...mapEl(el),
      options: Array.from(el.querySelectorAll('option')).map((o) => ({
        value: o.getAttribute('value') || '',
        text: (o.textContent || '').trim().slice(0, 80),
      })),
    }));
    const links = Array.from(document.querySelectorAll('a[href]')).filter(visible).map((el) => ({
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
      href: el.getAttribute('href') || '',
      dataTestId: el.getAttribute('data-testid') || null,
    }));

    return { buttons, inputs, selects, links };
  });

  return {
    profile: profileKey,
    route,
    url: page.url(),
    title: title?.trim() || null,
    ...data,
    capturedAt: new Date().toISOString(),
  };
};

const runActionsOnPage = async (page, profileKey, route, issues) => {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
  if (route === "/app/maps") {
    await page.locator("canvas.maplibregl-canvas").first().waitFor({ state: "visible", timeout: 25_000 }).catch(() => {});
  }

  const actions = {
    requiredFieldsChecked: 0,
    requiredFieldFailures: 0,
    inputsFilled: 0,
    selectsChanged: 0,
    buttonsClicked: [],
    buttonsSkipped: [],
    saveCancelClicks: [],
  };

  // Required fields
  const requiredInputs = page.locator('input[required]:not([type="hidden"]):not([disabled]), textarea[required]:not([disabled]), select[required]:not([disabled])');
  const requiredCount = await requiredInputs.count();
  for (let i = 0; i < Math.min(requiredCount, 10); i += 1) {
    const input = requiredInputs.nth(i);
    try {
      await input.scrollIntoViewIfNeeded();
      const tag = (await input.evaluate((el) => el.tagName.toLowerCase()).catch(() => "input")) || "input";
      if (tag === "select") {
        const value = await input.inputValue().catch(() => "");
        if (!value) actions.requiredFieldsChecked += 1;
      } else {
        await input.fill("");
        await input.blur();
        actions.requiredFieldsChecked += 1;
      }
      const isInvalid = await input.evaluate((el) => !el.checkValidity()).catch(() => false);
      if (!isInvalid) actions.requiredFieldFailures += 1;
    } catch (error) {
      issues.push({ profile: profileKey, route, kind: "required-validation", message: String(error) });
    }
  }

  // Inputs and selects
  const inputs = page.locator('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])');
  const inputCount = await inputs.count();
  for (let i = 0; i < Math.min(inputCount, 40); i += 1) {
    const input = inputs.nth(i);
    const type = (await input.getAttribute("type")) || "text";
    const readOnly = await input.getAttribute("readonly");
    if (readOnly) continue;
    try {
      if (type === "checkbox" || type === "radio") {
        await input.check({ timeout: 1500 }).catch(() => {});
      } else if (type === "file") {
        // skip generic file attach in crawler
      } else if (type === "number") {
        await input.fill("123");
      } else if (type === "email") {
        await input.fill("qa.automation@demo.local");
      } else if (type === "password") {
        await input.fill("Senha@12345");
      } else {
        await input.fill(`QA ${runId}`);
      }
      actions.inputsFilled += 1;
      await sleep(60);
    } catch (error) {
      issues.push({ profile: profileKey, route, kind: "input-action", message: String(error) });
    }
  }

  const selects = page.locator('select:not([disabled])');
  const selectCount = await selects.count();
  for (let i = 0; i < Math.min(selectCount, 12); i += 1) {
    const select = selects.nth(i);
    try {
      const options = await select.locator('option').all();
      if (options.length > 1) {
        const value = (await options[1].getAttribute('value')) ?? null;
        if (value !== null) await select.selectOption(value);
        actions.selectsChanged += 1;
      }
      await sleep(60);
    } catch (error) {
      issues.push({ profile: profileKey, route, kind: "select-action", message: String(error) });
    }
  }

  // Buttons
  const buttons = page.getByRole("button");
  const buttonCount = await buttons.count();
  for (let i = 0; i < Math.min(buttonCount, 60); i += 1) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
    if (route === "/app/maps") {
      await page.locator("canvas.maplibregl-canvas").first().waitFor({ state: "visible", timeout: 25_000 }).catch(() => {});
    }

    const btn = page.getByRole("button").nth(i);
    const label = ((await btn.textContent().catch(() => "")) || "").trim();
    if (!label) {
      actions.buttonsSkipped.push({ label: "<empty>", reason: "empty-label" });
      continue;
    }
    if (navPattern.test(label)) {
      actions.buttonsSkipped.push({ label, reason: "nav-button" });
      continue;
    }

    const destructive = destructivePattern.test(label);
    if (destructive && !TEST_MODE) {
      actions.buttonsSkipped.push({ label, reason: "destructive-test-mode-disabled" });
      continue;
    }

    try {
      await btn.click({ timeout: 2000 });
      actions.buttonsClicked.push(label);
      await sleep(120);
    } catch {
      // ignore per-button click failures in crawler, just log issue
      issues.push({ profile: profileKey, route, kind: "button-action", label, message: "click_failed" });
    }
  }

  // Try save/cancel when available
  for (const action of ["Salvar", "Cancelar"]) {
    const actionBtn = page.getByRole("button", { name: new RegExp(`^${action}$`, "i") }).first();
    if (await actionBtn.isVisible().catch(() => false)) {
      try {
        await actionBtn.click({ timeout: 2000 });
        actions.saveCancelClicks.push(action);
        await sleep(120);
      } catch (error) {
        issues.push({ profile: profileKey, route, kind: "save-cancel", action, message: String(error) });
      }
    }
  }

  return actions;
};

const loginUiFromTokens = async (page, tokens) => {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate((value) => {
    window.localStorage.setItem("accessToken", value.accessToken);
    window.localStorage.setItem("refreshToken", value.refreshToken);
    window.localStorage.setItem("tenantId", value.tenantId);
  }, tokens);
  await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "domcontentloaded" });
};

const authByProfile = await ensureProfiles();

const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOW_MO_MS });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(25_000);

const inventory = [];
const issues = [];
const consoleErrors = [];
const httpErrors = [];
const pageErrors = [];
const hydrationErrors = [];

page.on("console", (msg) => {
  if (msg.type() === "error") {
    const payload = { text: msg.text(), url: page.url(), at: new Date().toISOString() };
    consoleErrors.push(payload);
    if (hydrationPattern.test(payload.text)) {
      hydrationErrors.push(payload);
    }
  }
});

page.on("pageerror", (error) => {
  pageErrors.push({ message: String(error), url: page.url(), at: new Date().toISOString() });
});

page.on("response", (res) => {
  const status = res.status();
  if (status >= 400) {
    const url = res.url();
    if (!url.includes("google") && !url.includes("fonts") && !url.includes("favicon") && !url.includes("hot-update")) {
      httpErrors.push({ url, status, at: new Date().toISOString() });
    }
  }
});

try {
  // public
  for (const route of publicRoutes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
    const inv = await extractPageInventory(page, "public", route);
    inv.actions = await runActionsOnPage(page, "public", route, issues);
    inventory.push(inv);
  }

  // profiles
  for (const profile of profiles) {
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await loginUiFromTokens(page, authByProfile[profile.key]);

    for (const route of appRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      const inv = await extractPageInventory(page, profile.key, route);
      inv.actions = await runActionsOnPage(page, profile.key, route, issues);
      inventory.push(inv);
    }
  }
} finally {
  await context.close();
  await browser.close();
}

const uniqueRoutes = [...new Set(inventory.map((item) => `${item.profile}:${item.route}`))].length;
const expectedProfileRoutes = profiles.length * appRoutes.length + publicRoutes.length;
const coveredProfileRoutes = [...new Set(inventory.map((item) => `${item.profile}:${item.route}`))];
const missingProfileRoutes = [];
for (const route of publicRoutes) {
  if (!coveredProfileRoutes.includes(`public:${route}`)) {
    missingProfileRoutes.push({ profile: "public", route });
  }
}
for (const profile of profiles) {
  for (const route of appRoutes) {
    const key = `${profile.key}:${route}`;
    if (!coveredProfileRoutes.includes(key)) {
      missingProfileRoutes.push({ profile: profile.key, route });
    }
  }
}

const buttonEntries = inventory.flatMap((entry) =>
  (entry.buttons || []).map((btn) => ({
    profile: entry.profile,
    route: entry.route,
    label: btn.text || "<empty>",
    dataTestId: btn.dataTestId || null,
  })),
);
const clickedEntries = inventory.flatMap((entry) =>
  (entry.actions?.buttonsClicked || []).map((label) => ({
    profile: entry.profile,
    route: entry.route,
    label,
  })),
);
const skippedEntries = inventory.flatMap((entry) =>
  (entry.actions?.buttonsSkipped || []).map((item) => ({
    profile: entry.profile,
    route: entry.route,
    label: item.label,
    reason: item.reason,
  })),
);
const isButtonCovered = (button) =>
  clickedEntries.some((clicked) => clicked.profile === button.profile && clicked.route === button.route && clicked.label === button.label) ||
  skippedEntries.some((skipped) => skipped.profile === button.profile && skipped.route === button.route && skipped.label === button.label);

const untestedButtons = buttonEntries.filter((button) => !isButtonCovered(button));
const uniqueButtonCoverage = new Set(
  buttonEntries.map((item) => `${item.profile}|${item.route}|${item.label}|${item.dataTestId ?? ""}`),
);
const uniqueUntestedButtons = new Set(
  untestedButtons.map((item) => `${item.profile}|${item.route}|${item.label}|${item.dataTestId ?? ""}`),
);
const buttonCoveragePct = uniqueButtonCoverage.size
  ? Number((((uniqueButtonCoverage.size - uniqueUntestedButtons.size) / uniqueButtonCoverage.size) * 100).toFixed(2))
  : 0;
const routeCoveragePct = expectedProfileRoutes
  ? Number(((coveredProfileRoutes.length / expectedProfileRoutes) * 100).toFixed(2))
  : 0;

const report = {
  generatedAt: new Date().toISOString(),
  runId,
  baseUrl: BASE_URL,
  apiUrl: API_URL,
  tenant: TENANT,
  testMode: TEST_MODE,
  headless: HEADLESS,
  totals: {
    inventoryEntries: inventory.length,
    uniqueProfileRoutes: uniqueRoutes,
    expectedProfileRoutes,
    routeCoveragePct,
    uniqueButtons: uniqueButtonCoverage.size,
    untestedButtons: uniqueUntestedButtons.size,
    buttonCoveragePct,
    consoleErrors: consoleErrors.length,
    hydrationErrors: hydrationErrors.length,
    httpErrors: httpErrors.length,
    pageErrors: pageErrors.length,
    actionIssues: issues.length,
  },
  profiles: profiles.map((p) => ({ key: p.key, role: p.role, email: p.email })),
  consoleErrors,
  hydrationErrors,
  httpErrors,
  pageErrors,
  actionIssues: issues,
  missingProfileRoutes,
  untestedButtons: untestedButtons.slice(0, 500),
  skippedButtons: skippedEntries.slice(0, 500),
};

await fs.writeFile(OUTPUT_INVENTORY, `${JSON.stringify(inventory, null, 2)}\n`);
await fs.writeFile(OUTPUT_REPORT, `${JSON.stringify(report, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      runId,
      inventory: OUTPUT_INVENTORY,
      report: OUTPUT_REPORT,
      totals: report.totals,
    },
    null,
    2,
  ),
);
