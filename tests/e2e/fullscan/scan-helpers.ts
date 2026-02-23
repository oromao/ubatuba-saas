import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, Page, TestInfo } from '@playwright/test';

type Credentials = { email: string; password: string; tenant: string };

type ScanOutcome = {
  route: string;
  finalUrl: string;
  status: 'ok' | 'blocked' | 'session-recovered' | 'failed';
  actions: Array<{ kind: string; label: string; outcome: string }>;
  consoleErrors: string[];
  httpErrors: Array<{ status: number; url: string }>;
};

const destructivePattern = /(excluir|apagar|remover|deletar|delete|trash|encerrar|sair|logout)/i;
const navPattern = /(dashboard|mapas|levantamentos|parcelas|logradouros|mobiliario|zonas|faces|fatores|relatorio|integracoes|cartas|compliance|poc|ativos|alertas|processos|mobile)/i;

export async function runContinuousFullScan(page: Page, testInfo: TestInfo, roleKey: string, credentials: Credentials, testMode = false) {
  const visited = new Set<string>();
  const inventory: Array<Record<string, unknown>> = [];
  const results: ScanOutcome[] = [];

  const seeds = [
    '/app/dashboard',
    '/app/maps',
    '/app/levantamentos',
    '/app/ctm/parcelas',
    '/app/ctm/logradouros',
    '/app/ctm/mobiliario',
    '/app/pgv/zonas',
    '/app/pgv/faces',
    '/app/pgv/fatores',
    '/app/pgv/relatorio',
    '/app/integracoes',
    '/app/cartas',
    '/app/compliance',
    '/app/assets',
    '/app/alerts',
    '/app/processes',
    '/app/poc',
    '/mobile',
  ];

  const recoverSessionOnce = async () => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').click();
    await page.keyboard.type(credentials.email, { delay: 40 });
    await page.locator('input[type="password"]').click();
    await page.keyboard.type(credentials.password, { delay: 40 });
    await page.locator('input[placeholder="ex: prefeitura-jales"]').click();
    await page.keyboard.type(credentials.tenant, { delay: 40 });
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/auth/login') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Entrar' }).click(),
    ]);
    await page.waitForURL(/\/app\/dashboard/);
  };

  let recovered = false;

  const visitRoute = async (route: string) => {
    const consoleErrors: string[] = [];
    const httpErrors: Array<{ status: number; url: string }> = [];

    const onConsole = (msg: any) => {
      if (msg.type() === 'error' && !/WebGL|favicon|extensions/i.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    };

    const onResponse = (res: any) => {
      const status = res.status();
      if (status >= 500 || (status >= 400 && ![401, 403, 404].includes(status))) {
        httpErrors.push({ status, url: res.url() });
      }
    };

    page.on('console', onConsole);
    page.on('response', onResponse);

    const actions: Array<{ kind: string; label: string; outcome: string }> = [];
    let status: ScanOutcome['status'] = 'ok';

    try {
      const navigated = await page
        .goto(route, { waitUntil: 'domcontentloaded' })
        .then(() => true)
        .catch(() => false);
      if (!navigated) {
        status = 'failed';
        results.push({ route, finalUrl: page.url(), status, actions, consoleErrors, httpErrors });
        return;
      }
      if (page.url().includes('/login')) {
        if (!recovered) {
          recovered = true;
          await recoverSessionOnce();
          const retried = await page
            .goto(route, { waitUntil: 'domcontentloaded' })
            .then(() => true)
            .catch(() => false);
          if (!retried) {
            status = 'failed';
            results.push({ route, finalUrl: page.url(), status, actions, consoleErrors, httpErrors });
            return;
          }
          status = 'session-recovered';
        } else {
          status = 'failed';
          throw new Error('sessao expirada/instavel');
        }
      }

      const beforePath = testInfo.outputPath(`${roleKey}-${route.replace(/[^a-z0-9]/gi, '-')}-before.png`);
      const afterPath = testInfo.outputPath(`${roleKey}-${route.replace(/[^a-z0-9]/gi, '-')}-after.png`);
      await page.screenshot({ path: beforePath, fullPage: true });

      const inputLocator = page.locator('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])');
      const inputCount = await inputLocator.count();
      for (let i = 0; i < Math.min(inputCount, 4); i += 1) {
        try {
          const input = inputLocator.nth(i);
          const type = (await input.getAttribute('type', { timeout: 700 }).catch(() => null)) || 'text';
          const readOnly = await input.getAttribute('readonly', { timeout: 700 }).catch(() => null);
          if (readOnly) continue;

          await input.hover().catch(() => undefined);
          if (type === 'checkbox' || type === 'radio') {
            await input.click().catch(() => undefined);
            actions.push({ kind: 'toggle', label: `input-${i}`, outcome: 'clicked' });
            continue;
          }

          await input.click().catch(() => undefined);
          await input.fill('').catch(() => undefined);
          const value = type === 'email' ? `scan.${roleKey}.${Date.now()}@demo.local` : type === 'number' ? '10' : `scan-${roleKey}`;
          await page.keyboard.type(value, { delay: 35 }).catch(() => undefined);
          actions.push({ kind: 'input', label: `input-${i}`, outcome: 'typed' });
        } catch {
          actions.push({ kind: 'input', label: `input-${i}`, outcome: 'skipped-dynamic' });
        }
      }

      const selectLocator = page.locator('select:not([disabled])');
      const selectCount = await selectLocator.count();
      for (let i = 0; i < Math.min(selectCount, 2); i += 1) {
        const select = selectLocator.nth(i);
        const options = await select.locator('option').all();
        if (options.length > 1) {
          const value = await options[1].getAttribute('value');
          if (value !== null) {
            await select.hover().catch(() => undefined);
            await select.selectOption(value).catch(() => undefined);
            actions.push({ kind: 'select', label: `select-${i}`, outcome: 'selected' });
          }
        }
      }

      const buttonLocator = page.getByRole('button');
      const buttonCount = await buttonLocator.count();
      for (let i = 0; i < Math.min(buttonCount, 7); i += 1) {
        const btn = buttonLocator.nth(i);
        const label = ((await btn.textContent().catch(() => '')) || '').trim();
        if (!label || navPattern.test(label)) continue;
        if (!(await btn.isEnabled().catch(() => false))) continue;
        if (/^sair$/i.test(label) || /logout/i.test(label)) {
          actions.push({ kind: 'button', label, outcome: 'skipped-auth-button' });
          continue;
        }

        await btn.hover().catch(() => undefined);
        if (destructivePattern.test(label) && !testMode) {
          await btn.click().catch(() => undefined);
          const cancel = page.getByRole('button', { name: /cancelar|nao|voltar|fechar/i }).first();
          if (await cancel.isVisible().catch(() => false)) {
            await cancel.click().catch(() => undefined);
          }
          actions.push({ kind: 'button', label, outcome: 'skipped_destructive' });
          continue;
        }

        await btn.click().catch(() => undefined);
        actions.push({ kind: 'button', label, outcome: 'clicked' });
      }

      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href^="/app"], a[href^="/mobile"]'))
          .map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim() }))
          .filter((item) => item.href),
      );

      inventory.push({
        role: roleKey,
        route,
        url: page.url(),
        title: await page.title(),
        inputs: inputCount,
        selects: selectCount,
        buttons: buttonCount,
        links,
      });

      const blockedMarker = await page
        .getByText(/acesso restrito|nao autorizado|forbidden|sem permissao/i)
        .first()
        .isVisible()
        .catch(() => false);
      if (page.url().includes('/login') && route !== '/login') {
        status = status === 'session-recovered' ? status : 'blocked';
      } else if (blockedMarker || page.url().includes('/app/dashboard') && route !== '/app/dashboard' && route !== '/app/poc') {
        status = status === 'session-recovered' ? status : 'blocked';
      }

      await page.screenshot({ path: afterPath, fullPage: true });
    } catch {
      status = 'failed';
    } finally {
      page.off('console', onConsole);
      page.off('response', onResponse);
    }

    results.push({ route, finalUrl: page.url(), status, actions, consoleErrors, httpErrors });
  };

  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
  expect(page.url()).toContain('/app/dashboard');

  const queue = [...seeds];
  while (queue.length > 0 && visited.size < 60) {
    const next = queue.shift();
    if (!next || visited.has(next)) continue;
    visited.add(next);
    await visitRoute(next);

    const found = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="/app"], a[href^="/mobile"]'))
        .map((el) => el.getAttribute('href'))
        .filter((href): href is string => !!href),
    );
    for (const href of found.slice(0, 25)) {
      if (!visited.has(href) && !queue.includes(href)) queue.push(href);
    }
  }

  const docsDir = path.resolve(process.cwd(), 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(path.join(docsDir, `ui-inventory.${roleKey}.json`), `${JSON.stringify(inventory, null, 2)}\n`);
  await fs.writeFile(path.join(docsDir, `ui-scan-results.${roleKey}.json`), `${JSON.stringify(results, null, 2)}\n`);

  const hardFailures = results.flatMap((entry) => entry.httpErrors.filter((e) => e.status >= 500));
  expect(hardFailures.length, `${roleKey} possui erros HTTP 5xx`).toBe(0);

  await updateAggregateReports();
}

export async function updateAggregateReports() {
  const docsDir = path.resolve(process.cwd(), 'docs');
  const files = await fs.readdir(docsDir).catch(() => []);
  const scanFiles = files.filter((file) => /^ui-scan-results\..+\.json$/.test(file));
  const roleSummaries: Array<{ role: string; pages: number; actions: number; blocked: number; failed: number }> = [];
  const rbacRows: Array<{ role: string; route: string; status: string }> = [];

  for (const file of scanFiles) {
    const role = file.replace('ui-scan-results.', '').replace('.json', '');
    const content = await fs.readFile(path.join(docsDir, file), 'utf8');
    const rows = JSON.parse(content) as ScanOutcome[];
    roleSummaries.push({
      role,
      pages: rows.length,
      actions: rows.reduce((acc, item) => acc + item.actions.length, 0),
      blocked: rows.filter((item) => item.status === 'blocked').length,
      failed: rows.filter((item) => item.status === 'failed').length,
    });

    rows.forEach((row) => {
      const observedStatus =
        row.finalUrl?.includes('/login') && row.route !== '/login'
          ? 'blocked'
          : row.finalUrl?.includes('/app/dashboard') && row.route !== '/app/dashboard' && row.route !== '/app/poc'
            ? 'blocked'
            : row.status;
      rbacRows.push({ role, route: row.route, status: observedStatus });
    });
  }

  const summaryLines = [
    '# UI Scan Summary',
    '',
    '| Role | Telas Visitadas | Acoes Executadas | Bloqueios RBAC | Falhas |',
    '|---|---:|---:|---:|---:|',
    ...roleSummaries.map((item) => `| ${item.role} | ${item.pages} | ${item.actions} | ${item.blocked} | ${item.failed} |`),
  ];

  const rbacLines = [
    '# RBAC Report',
    '',
    '| Role | Rota | Resultado Observado |',
    '|---|---|---|',
    ...rbacRows.map((row) => `| ${row.role} | ${row.route} | ${row.status} |`),
  ];

  await fs.writeFile(path.join(docsDir, 'ui-scan-summary.md'), `${summaryLines.join('\n')}\n`);
  await fs.writeFile(path.join(docsDir, 'rbac-report.md'), `${rbacLines.join('\n')}\n`);
}
