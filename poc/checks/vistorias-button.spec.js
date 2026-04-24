/**
 * T1-AUDIT-VISTORIAS — Valida que o botão "Nova Vistoria" navega para o formulário.
 * Causa raiz corrigida: <Link><Button> gerava <a><button> (HTML inválido).
 * Fix: substituído por <Button onClick={() => router.push(...)}>
 */
const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const storageDir = path.resolve(process.cwd(), "storage");

async function injectSession(page, roleKey = "admin") {
  const rolesPath = path.resolve(storageDir, "roles.json");
  const statePath = path.resolve(storageDir, `${roleKey}.json`);

  let roles;
  try {
    roles = JSON.parse(fs.readFileSync(rolesPath, "utf8"));
  } catch {
    roles = { profiles: [{ key: "admin" }] };
  }

  const stateRaw = JSON.parse(fs.readFileSync(statePath, "utf8"));
  const origin = stateRaw.origins?.find((o) => o.origin === "http://localhost:3000");
  const get = (name) => origin?.localStorage?.find((l) => l.name === name)?.value ?? null;
  const accessToken = get("accessToken");
  const refreshToken = get("refreshToken");
  const tenantId = get("tenantId");

  if (!accessToken) throw new Error(`accessToken ausente em ${statePath}`);

  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ a, r, t }) => {
      sessionStorage.setItem("accessToken", a);
      sessionStorage.setItem("refreshToken", r);
      sessionStorage.setItem("tenantId", t);
    },
    { a: accessToken, r: refreshToken, t: tenantId }
  );
}

test.describe("T1-AUDIT-VISTORIAS — botão Nova Vistoria", () => {
  test("botão Nova Vistoria navega para /app/ctm/vistorias/novo", async ({ page }) => {
    await injectSession(page, "admin");

    await page.goto(`${BASE_URL}/app/ctm/vistorias`, { waitUntil: "domcontentloaded" });

    const novaVistoriaBtn = page.getByRole("button", { name: /Nova Vistoria/i });
    await expect(novaVistoriaBtn).toBeVisible({ timeout: 10_000 });
    await expect(novaVistoriaBtn).toBeEnabled();

    await novaVistoriaBtn.click();

    await page.waitForURL(/\/app\/ctm\/vistorias\/novo/, { timeout: 15_000 });
    expect(page.url()).toContain("/app/ctm/vistorias/novo");
  });

  test("formulário Nova Vistoria renderiza campos obrigatórios", async ({ page }) => {
    await injectSession(page, "admin");

    await page.goto(`${BASE_URL}/app/ctm/vistorias/novo`, { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Nova Vistoria")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/ID da Parcela/i)).toBeVisible();
    await expect(page.getByLabel(/Tipo de Vistoria/i)).toBeVisible();
    await expect(page.getByLabel(/Data da Vistoria/i)).toBeVisible();
    await expect(page.getByLabel(/Observações/i)).toBeVisible();

    const submitBtn = page.getByRole("button", { name: /Criar Vistoria/i });
    await expect(submitBtn).toBeVisible();
  });

  test("submit habilita após preencher parcelId", async ({ page }) => {
    await injectSession(page, "admin");

    await page.goto(`${BASE_URL}/app/ctm/vistorias/novo`, { waitUntil: "domcontentloaded" });

    const submitBtn = page.getByRole("button", { name: /Criar Vistoria/i });
    await expect(submitBtn).toBeDisabled({ timeout: 5_000 });

    await page.getByLabel(/ID da Parcela/i).fill("SQLU-TEST-001");
    await expect(submitBtn).toBeEnabled({ timeout: 3_000 });
  });
});
