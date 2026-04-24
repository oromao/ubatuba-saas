import { expect, test } from "@playwright/test";

test.describe("public login noise", () => {
  test("does not call authenticated tenant or notification endpoints while unauthenticated", async ({ page }) => {
    const requestedUrls: string[] = [];
    const errorTexts: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/tenants/me") || url.includes("/notifications-letters/unread-count")) {
        requestedUrls.push(url);
      }
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        errorTexts.push(message.text());
      }
    });

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
    await expect(page.getByRole("heading", { name: /Entrar no painel/i })).toBeVisible();

    await page.goto("/app/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await page.waitForTimeout(500);

    expect(requestedUrls).toEqual([]);
    expect(errorTexts.filter((text) => text.includes("/tenants/me") || text.includes("/notifications-letters/unread-count"))).toEqual([]);
  });
});
