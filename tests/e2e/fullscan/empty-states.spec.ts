import fs from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const storageDir = `${process.cwd()}/storage`;
const rolesPath = `${storageDir}/roles.json`;

async function ensureSession(page: any) {
  const roles = JSON.parse(await fs.readFile(rolesPath, 'utf8'));
  const profile = roles.profiles.find((item: any) => item.key === 'admin') ?? roles.profiles[0];
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: profile.email,
      password: profile.password,
      tenantSlug: roles.tenant,
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Falha login: ${response.status}`);
  const { accessToken, refreshToken, tenantId } = payload.data;
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (tokens: any) => {
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('tenantId', tokens.tenantId);
    },
    { accessToken, refreshToken, tenantId },
  );
  await page.goto('/app/dashboard', { waitUntil: 'domcontentloaded' });
}

test.describe('T3-EMPTY-STATES: empty and error states', () => {
  test('renders an explicit error state when a table-backed module cannot fetch data', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/assets**', (route) => route.abort());
    await page.goto('/app/assets', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Ativos territoriais' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nao foi possivel carregar os dados.')).toBeVisible();
    await expect(page.getByText(/Falha ao carregar ativos|Failed to fetch|TypeError|aborted/i)).toBeVisible();
  });

  test('renders an explicit error state on logradouros too', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/logradouros**', (route) => route.abort());
    await page.goto('/app/ctm/logradouros', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'CTM - Logradouros' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nao foi possivel carregar os dados.')).toBeVisible();
    await expect(page.getByText(/Falha ao carregar logradouros|Failed to fetch|TypeError|aborted/i)).toBeVisible();
  });

  test('renders an explicit error state on PGV zones as well', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/pgv/zones**', (route) => route.abort());
    await page.goto('/app/pgv/zonas', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PGV - Zonas de Valor' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nao foi possivel carregar os dados.')).toBeVisible();
    await expect(page.getByText(/Falha ao carregar zonas|Failed to fetch|TypeError|aborted/i)).toBeVisible();
  });

  test('renders the empty state for PGV faces when the API returns no rows', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/pgv/faces**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/pgv/faces', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PGV - Faces de Quadra' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhuma face de quadra configurada.')).toBeVisible();
    await expect(page.getByText('Verifique se existem dados cadastrados ou ajuste os filtros.')).toBeVisible();
  });

  test('renders the shared empty state for CTM mobiliario urbano too', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/urban-furniture**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/ctm/mobiliario', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'CTM - Mobiliario Urbano' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum registro encontrado.')).toBeVisible();
    await expect(page.getByText('Verifique se existem dados cadastrados ou ajuste os filtros.')).toBeVisible();
  });

  test('renders the empty state for CTM parcelas when the API returns no rows', async ({ page }) => {
    await ensureSession(page);

    await page.goto('/app/ctm/parcelas', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Cadastro Técnico - Parcelas' })).toBeVisible({ timeout: 10_000 });
    await page.getByPlaceholder('Buscar...').last().fill('ZZZ-NO-MATCH');
    await expect(page.getByText('Nenhum resultado para "ZZZ-NO-MATCH"')).toBeVisible();
    await expect(page.getByRole('button').filter({ hasText: 'Limpar busca' }).last()).toBeVisible();
  });

  test('renders the empty state for citizen 156 when there are no calls', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/citizen-156/calls**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/citizen-156/summary**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { total: 0, abertos: 0, triagem: 0, encaminhados: 0, resolvidos: 0, anexos: 0 } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/156', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Atendimento 156' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum chamado encontrado.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Abrir primeiro chamado' })).toBeVisible();
  });

  test('renders the empty state for CTM vistorias when the API returns no rows', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/vistorias**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/ctm/vistorias', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Vistorias' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhuma vistoria encontrada.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar primeira vistoria' })).toBeVisible();
  });

  test('renders the empty state for ambiental cases when the API returns no rows', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/environment/cases**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/ambiental', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Gestão Ambiental' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum caso ambiental encontrado.')).toBeVisible();
  });

  test('renders the empty state for levantamentos when the API returns no rows', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/levantamentos**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/levantamentos', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Levantamentos & Entregaveis' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum levantamento cadastrado.')).toBeVisible();
  });

  test('renders the empty state for compliance when the profile has no records', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/compliance**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              company: null,
              technicalResponsibles: [],
              artsRrts: [],
              cats: [],
              team: [],
              checklist: [],
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/modulos/compliance', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Compliance' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Sem responsaveis cadastrados.')).toBeVisible();
    await expect(page.getByText('Sem equipe cadastrada.')).toBeVisible();
    await expect(page.getByText('Sem ART/RRT cadastrada.')).toBeVisible();
    await expect(page.getByText('Sem CAT cadastrada.')).toBeVisible();
    await expect(page.getByText('Nenhum item de checklist cadastrado.')).toBeVisible();
  });

  test('renders the empty state for cartas when the notification lists are empty', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/notifications-letters/templates**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/notifications-letters/batches**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/cartas', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Cartas de notificacao' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Sem templates cadastrados.')).toBeVisible();
    await expect(page.getByText('Sem lotes gerados.')).toBeVisible();
  });

  test('renders the empty state for pgv relatorio when no impacted properties exist', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/pgv/zones**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/pgv/faces**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/pgv/versions**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/pgv/simulations**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            summary: {
              parcelsEvaluated: 0,
              totalCurrentValue: 0,
              totalProposedValue: 0,
              totalDelta: 0,
              totalDeltaPct: 0,
              estimatedAnnualArrecadationImpact: 0,
            },
            filters: {},
            chartSeries: [],
            territorialBreakdown: [],
            impactedParcels: [],
            highlights: { withPositiveImpact: 0, withHigherUrbanPressure: 0 },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/pgv/relatorio', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PGV Fazendária' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum imóvel impactado ainda.')).toBeVisible();
    await expect(page.getByText('A quebra territorial aparece aqui após a simulação.')).toBeVisible();
  });

  test('renders the empty state for CTM logradouros when the API returns no rows', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/logradouros**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/ctm/logradouros', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'CTM - Logradouros' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum logradouro encontrado.')).toBeVisible();
  });

  test('renders the empty state for integracoes logs when no sync records are available', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/tax-integration/connectors**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [{ _id: 'connector-1', name: 'Receita', mode: 'REST', isActive: true, lastSyncAt: null }] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/tax-integration/connectors/connector-1/logs**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/integracoes', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Ver Logs/ }).click();

    await expect(page.getByRole('heading', { name: 'Integração Tributária (IPTU)' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum log de sincronização encontrado.')).toBeVisible();
  });

  test('renders the empty state for integracoes connectors when no connector exists', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/tax-integration/connectors**', async (route) => {
      if (route.request().resourceType() === 'fetch' && route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/integracoes', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Integração Tributária (IPTU)' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum conector configurado. Configure um conector para sincronizar dados do IPTU municipal.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Configurar primeiro conector' })).toBeVisible();
  });

  test('renders the empty state for reurb projects when no projects are available', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/reurb/tenant-config**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { reurbEnabled: true } }),
        });
        return;
      }
      await route.continue();
    });
    const emptyList = JSON.stringify({ data: [] });
    for (const path of [
      '**/api/reurb/projects**',
      '**/api/reurb/families**',
      '**/api/reurb/units**',
      '**/api/reurb/notification-templates**',
      '**/api/reurb/notifications**',
      '**/api/reurb/pendencies**',
      '**/api/reurb/deliverables**',
    ]) {
      await page.route(path, async (route) => {
        if (route.request().resourceType() === 'fetch') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: emptyList,
          });
          return;
        }
        await route.continue();
      });
    }

    await page.goto('/app/reurb', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'REURB — Regularizacao Fundiaria' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum projeto cadastrado.')).toBeVisible();
  });

  test('renders the empty state for reurb families and units when a project exists but no records do', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/reurb/tenant-config**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { reurbEnabled: true } }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/projects**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [{ _id: 'reurb-project-1', name: 'Projeto Demo' }] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/families**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/units**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/reurb', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'REURB — Regularizacao Fundiaria' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Projeto Demo')).toBeVisible();
    await expect(page.getByText('Nenhuma familia cadastrada.')).toBeVisible();
    await expect(page.getByText('Nenhuma unidade cadastrada.')).toBeVisible();
  });

  test('renders the empty state for reurb pendencies and deliverables when a project exists but none are generated', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/reurb/tenant-config**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { reurbEnabled: true } }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/projects**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [{ _id: 'reurb-project-1', name: 'Projeto Demo' }] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/pendencies**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/deliverables**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/reurb', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'REURB — Regularizacao Fundiaria' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Projeto Demo')).toBeVisible();
    await expect(page.getByText('Nenhuma pendencia cadastrada.')).toBeVisible();
    await expect(page.getByText('Nenhum entregavel gerado ainda.')).toBeVisible();
  });

  test('renders the empty state for reurb notifications when a project exists but none were sent', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/reurb/tenant-config**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { reurbEnabled: true } }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/projects**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [{ _id: 'reurb-project-1', name: 'Projeto Demo' }] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/reurb/notifications**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/reurb', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'REURB — Regularizacao Fundiaria' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Projeto Demo')).toBeVisible();
    await expect(page.getByText('Nenhuma notificacao enviada.')).toBeVisible();
  });

  test('renders the empty state for monitoring events when no records are available', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/monitoring/events**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/monitoring/dashboard**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              total: 0,
              triagem: 0,
              fiscalizacao: 0,
              notificacao: 0,
              desfecho: 0,
              criticidadeAlta: 0,
              comEvidencia: 0,
              semAtribuicao: 0,
              notificados: 0,
              sourceBreakdown: [],
              typeBreakdown: [],
              sourceModeBreakdown: [],
              feedAdapters: [],
              recentTimeline: [],
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/monitoramento', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Monitoramento Ambiental' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum evento monitorado.')).toBeVisible();
  });

  test('renders the empty state for obras requests when no records are available', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/permits-works**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/modulos/obras', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Alvará de Obras' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum registro encontrado.')).toBeVisible();
    await expect(page.getByText('Verifique se existem dados cadastrados ou ajuste os filtros.')).toBeVisible();
  });

  test('renders the empty state for parcel vistorias when the tab has no records', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/parcels/parcel-empty**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              _id: 'parcel-empty',
              sqlu: '000.000.000.0000',
              workflowStatus: 'PENDENTE',
              sourceType: 'MUNICIPAL',
              isOfficial: true,
            },
          }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/ctm/parcels/parcel-empty/history**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/ctm/vistorias?parcelId=parcel-empty**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/ctm/parcelas/parcel-empty', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Lote 000.000.000.0000' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Vistorias' }).click();
    await expect(page.getByText('Nenhuma vistoria registrada para este lote.')).toBeVisible();
  });

  test('renders the empty state for business permits when no requests exist', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/permits-business**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/modulos/empresas', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Alvará de Empresas' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Nenhum registro encontrado.')).toBeVisible();
    await expect(page.getByText('Verifique se existem dados cadastrados ou ajuste os filtros.')).toBeVisible();
  });

  test('renders the empty state for poc score when the backend returns no data', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/poc/score**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: null }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/poc', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Conformidade interna' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Sem dados de score.')).toBeVisible();
  });

  test('renders the empty state for parcel infrastructure when the tab has no data', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/ctm/parcels/parcel-empty**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              _id: 'parcel-empty',
              sqlu: '000.000.000.0000',
              workflowStatus: 'PENDENTE',
              sourceType: 'MUNICIPAL',
              isOfficial: true,
            },
          }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/ctm/parcels/parcel-empty/history**', async (route) => {
      if (route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
    await page.route('**/api/ctm/parcels/parcel-empty/infrastructure**', (route) => route.abort());

    await page.goto('/app/ctm/parcelas/parcel-empty', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Lote 000.000.000.0000' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Infraestrutura' }).click();
    await expect(page.getByText('Dados de infraestrutura não cadastrados.')).toBeVisible();
  });

  test('renders the empty state for levantamento files when the survey has no attachments', async ({ page }) => {
    await ensureSession(page);
    await page.route('**/api/surveys**', async (route) => {
      if (route.request().method() === 'GET' && route.request().resourceType() === 'fetch') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                _id: 'survey-empty',
                name: 'Levantamento vazio',
                type: 'AEROFOTO_RGB_5CM',
                pipelineStatus: 'RECEBIDO',
                metadata: {
                  municipality: 'Ubatuba',
                  surveyDate: '2026-04-21',
                  srcDatum: 'SIRGAS2000 / EPSG:4326',
                  supplier: 'Fornecedor Demo',
                },
                files: [],
              },
            ],
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/app/levantamentos', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Levantamentos & Entregaveis' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Levantamento vazio' }).click();
    await expect(page.getByText('Nenhum arquivo registrado.')).toBeVisible();
  });
});
