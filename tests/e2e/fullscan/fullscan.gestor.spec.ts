import fs from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';
import { runContinuousFullScan } from './scan-helpers';

test.use({ storageState: path.resolve(process.cwd(), 'storage/gestor.json') });

test('@fullscan @gestor fluxo continuo sem relogin', async ({ page }, testInfo) => {
  const roles = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'storage/roles.json'), 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === 'gestor');
  await runContinuousFullScan(page, testInfo, 'gestor', {
    email: profile.email,
    password: profile.password,
    tenant: roles.tenant,
  }, String(process.env.TEST_MODE || 'false') === 'true');
});
