#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.env.TEST_EMAIL || "admin@demo.local";
const PASSWORD = process.env.TEST_PASSWORD || "Admin@12345";
const TENANT = process.env.TEST_TENANT || "demo";
const HEADLESS = (process.env.PW_HEADLESS ?? "true") !== "false";

const OUTPUT = path.resolve(process.cwd(), "docs/ui-inventory.json");

const routes = [
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

const browser = await chromium.launch({ headless: HEADLESS });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

try {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[placeholder="nome@prefeitura.gov.br"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.locator('input[placeholder="ex: prefeitura-jales"]').fill(TENANT);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/app\/dashboard/);

  const inventory = [];
  for (const route of routes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
    if (route === "/app/maps") {
      await page.locator("canvas.maplibregl-canvas").first().waitFor({ state: "visible", timeout: 30000 });
    }

    const pageTitle = await page.locator("h1").first().textContent().catch(() => null);

    const dataTestIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-testid]"))
        .map((el) => el.getAttribute("data-testid"))
        .filter(Boolean)
    );

    const buttons = await page.getByRole("button").allTextContents();

    inventory.push({
      route,
      url: page.url(),
      title: pageTitle?.trim() || null,
      dataTestIds: [...new Set(dataTestIds)].slice(0, 200),
      visibleButtons: buttons.map((b) => b.trim()).filter(Boolean).slice(0, 200),
      capturedAt: new Date().toISOString(),
    });
  }

  await fs.writeFile(OUTPUT, `${JSON.stringify(inventory, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, output: OUTPUT, pages: inventory.length }, null, 2));
} finally {
  await context.close();
  await browser.close();
}
