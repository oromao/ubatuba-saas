import { test, expect } from '@playwright/test';

test.describe('Portal Cidadão — LGPD Consent Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cidadao');
    await page.waitForLoadState('networkidle');
  });

  test('should show consent checkbox when name is filled', async ({ page }) => {
    const checkbox = page.locator('#lgpdConsent');
    await expect(checkbox).not.toBeVisible();

    await page.fill('#nome', 'João Silva');
    const checkboxAfter = page.locator('#lgpdConsent');
    await expect(checkboxAfter).toBeVisible();
  });

  test('should show consent checkbox when contact is filled', async ({ page }) => {
    await page.fill('#contato', 'joao@email.com');
    const checkbox = page.locator('#lgpdConsent');
    await expect(checkbox).toBeVisible();
  });

  test('should block submission without consent when personal data provided', async ({ page }) => {
    await page.fill('#nome', 'João Silva');
    await page.selectOption('#categoria', 'Buracos e Pavimentação');
    await page.fill('#assunto', 'Buraco na rua');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=concordar com a política de privacidade')).toBeVisible();
  });

  test('should succeed with consent checked and personal data', async ({ page }) => {
    await page.fill('#nome', 'João Silva');
    await page.fill('#contato', 'joao@email.com');
    await page.selectOption('#categoria', 'Buracos e Pavimentação');
    await page.fill('#assunto', 'Buraco na rua');
    await page.fill('#descricao', 'Tem um buraco enorme na esquina');

    const checkbox = page.locator('#lgpdConsent');
    await checkbox.check();

    await page.click('button[type="submit"]');

    await expect(page.locator('text=sucesso')).toBeVisible({ timeout: 10000 });
  });

  test('should succeed without personal data (no consent needed)', async ({ page }) => {
    await page.selectOption('#categoria', 'Iluminação Pública');
    await page.fill('#assunto', 'Lâmpada queimada');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=sucesso')).toBeVisible({ timeout: 10000 });
  });

  test('should link to privacy page', async ({ page }) => {
    const privacyLink = page.locator('a[href="/privacidade"]').first();
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('target', '_blank');
  });
});
