# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: poc/checks/roles-smoke.spec.js >> @smoke @roles admin navega modulos principais
- Location: poc/checks/roles-smoke.spec.js:93:1

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByText('Painel Executivo').first() to be visible
    - waiting for" http://172.233.188.166:3000/login" navigation to finish...
    - navigated to "http://172.233.188.166:3000/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - link "FlyDea Atlas SaaS geoespacial" [ref=e6] [cursor=pointer]:
          - /url: /
          - text: FlyDea Atlas
          - generic [ref=e7]: SaaS geoespacial
        - generic [ref=e8]: Acesso seguro ao painel operacional
        - heading "Controle territorial em um painel moderno, auditavel e pronto para escala." [level=1] [ref=e9]
        - paragraph [ref=e10]: Mapeamento, cadastro técnico, processos digitais e monitoramento integrados com governanca por perfil.
      - generic [ref=e11]:
        - paragraph [ref=e13]: Ambiente seguro com isolamento de dados
        - paragraph [ref=e15]: Sessao persistida no navegador
        - paragraph [ref=e17]: RBAC e trilha de auditoria ativos
        - paragraph [ref=e19]: Interface operacional homologada
      - generic [ref=e20]:
        - generic [ref=e21]:
          - img [ref=e22]
          - generic [ref=e25]:
            - paragraph [ref=e26]: Seguranca institucional
            - paragraph [ref=e27]: Logs por usuario, trilha de auditoria e segregacao multi-tenant.
        - generic [ref=e28]:
          - generic [ref=e29]:
            - img [ref=e30]
            - text: Fluxo simplificado
          - generic [ref=e32]:
            - img [ref=e33]
            - text: LGPD + RBAC
    - generic [ref=e37]:
      - generic [ref=e38]:
        - heading "Entrar no painel" [level=3] [ref=e39]
        - paragraph [ref=e40]: Informe credenciais de acesso para sua operação geoespacial.
      - generic [ref=e41]:
        - generic [ref=e42]:
          - generic [ref=e43]:
            - text: Email institucional
            - textbox "nome@prefeitura.gov.br" [ref=e44]
          - generic [ref=e45]:
            - text: Senha
            - textbox "********" [ref=e46]
          - generic [ref=e47]:
            - text: Municipio / Tenant
            - textbox "ubatuba" [ref=e48]
          - button "Entrar" [ref=e49] [cursor=pointer]
        - generic [ref=e50]:
          - link "Esqueci minha senha" [ref=e51] [cursor=pointer]:
            - /url: /forgot-password
          - link "Voltar ao site" [ref=e52] [cursor=pointer]:
            - /url: /
  - alert [ref=e53]
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  4   | const API_URL = process.env.API_URL || 'http://localhost:4000';
  5   | const TENANT = process.env.TEST_TENANT || 'demo';
  6   | const ADMIN_EMAIL = process.env.TEST_EMAIL || 'admin@demo.local';
  7   | const ADMIN_PASSWORD = process.env.TEST_PASSWORD || 'Admin@12345';
  8   | 
  9   | const runId = Date.now();
  10  | 
  11  | const profiles = {
  12  |   admin: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'ADMIN' },
  13  |   gestor: { email: `gestor.smoke.${runId}@demo.local`, password: 'Gestor@12345', role: 'GESTOR' },
  14  |   operador: { email: `operador.smoke.${runId}@demo.local`, password: 'Operador@12345', role: 'OPERADOR' },
  15  |   campo: { email: `campo.smoke.${runId}@demo.local`, password: 'Campo@12345', role: 'OPERADOR' },
  16  |   leitor: { email: `leitor.smoke.${runId}@demo.local`, password: 'Leitor@12345', role: 'LEITOR' },
  17  | };
  18  | 
  19  | const auth = {};
  20  | 
  21  | async function apiJson(request, method, path, body, headers = {}) {
  22  |   const res = await request.fetch(`${API_URL}${path}`, {
  23  |     method,
  24  |     headers: {
  25  |       ...(body ? { 'content-type': 'application/json' } : {}),
  26  |       ...headers,
  27  |     },
  28  |     ...(body ? { data: body } : {}),
  29  |   });
  30  |   const payload = await res.json().catch(() => ({}));
  31  |   return { res, payload: payload?.data ?? payload };
  32  | }
  33  | 
  34  | async function loginApi(request, profile) {
  35  |   const { res, payload } = await apiJson(request, 'POST', '/auth/login', {
  36  |     email: profile.email,
  37  |     password: profile.password,
  38  |     tenantSlug: TENANT,
  39  |   });
  40  |   expect(res.status(), `login ${profile.email}`).toBe(201);
  41  |   return payload;
  42  | }
  43  | 
  44  | async function loginUiFromToken(page, tokens) {
  45  |   await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  46  |   await page.evaluate((value) => {
  47  |     window.localStorage.setItem('accessToken', value.accessToken);
  48  |     window.localStorage.setItem('refreshToken', value.refreshToken);
  49  |     window.localStorage.setItem('tenantId', value.tenantId);
  50  |   }, tokens);
  51  |   await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'domcontentloaded' });
  52  |   await page.waitForURL('**/app/dashboard');
  53  |   await page.waitForLoadState('networkidle');
> 54  |   await page.getByText('Painel Executivo').first().waitFor({ state: 'visible' });
      |                                                    ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  55  | }
  56  | 
  57  | test.beforeAll(async ({ request }) => {
  58  |   auth.admin = await loginApi(request, profiles.admin);
  59  | 
  60  |   for (const key of ['gestor', 'operador', 'campo', 'leitor']) {
  61  |     const profile = profiles[key];
  62  | 
  63  |     const { res: createUserRes, payload: createUserPayload } = await apiJson(
  64  |       request,
  65  |       'POST',
  66  |       '/admin/users',
  67  |       { email: profile.email, password: profile.password },
  68  |       {
  69  |         Authorization: `Bearer ${auth.admin.accessToken}`,
  70  |         'X-Tenant-Id': auth.admin.tenantId,
  71  |       },
  72  |     );
  73  |     expect([200, 201]).toContain(createUserRes.status());
  74  |     const userId = createUserPayload?.id || createUserPayload?._id;
  75  |     expect(userId, `id do usuario para ${profile.email}`).toBeTruthy();
  76  | 
  77  |     const { res: membershipRes } = await apiJson(
  78  |       request,
  79  |       'POST',
  80  |       '/admin/memberships',
  81  |       { tenantId: auth.admin.tenantId, userId, role: profile.role },
  82  |       {
  83  |         Authorization: `Bearer ${auth.admin.accessToken}`,
  84  |         'X-Tenant-Id': auth.admin.tenantId,
  85  |       },
  86  |     );
  87  |     expect([200, 201]).toContain(membershipRes.status());
  88  | 
  89  |     auth[key] = await loginApi(request, profile);
  90  |   }
  91  | });
  92  | 
  93  | test('@smoke @roles admin navega modulos principais', async ({ page }) => {
  94  |   await loginUiFromToken(page, auth.admin);
  95  | 
  96  |   await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'domcontentloaded' });
  97  |   await page.getByText('Painel Executivo').first().waitFor({ state: 'visible' });
  98  | 
  99  |   await page.goto(`${BASE_URL}/app/levantamentos`, { waitUntil: 'domcontentloaded' });
  100 |   await page.waitForLoadState('networkidle');
  101 |   await page.getByText('Levantamentos & Entregaveis').first().waitFor({ state: 'visible' });
  102 | 
  103 |   await page.getByTestId('global-search-open').click();
  104 |   await page.getByTestId('global-search-input').fill('Parcelas');
  105 |   await page.getByText('Parcelas').first().waitFor({ state: 'visible' });
  106 | });
  107 | 
  108 | test('@smoke @roles operador acessa mapas e mobile', async ({ page }) => {
  109 |   await loginUiFromToken(page, auth.operador);
  110 | 
  111 |   await page.goto(`${BASE_URL}/app/ctm/parcelas`, { waitUntil: 'domcontentloaded' });
  112 |   await page.waitForLoadState('networkidle');
  113 |   await page.getByText('CTM - Parcelas').first().waitFor({ state: 'visible' });
  114 | 
  115 |   await page.goto(`${BASE_URL}/mobile`, { waitUntil: 'domcontentloaded' });
  116 |   await page.waitForLoadState('networkidle');
  117 |   await page.getByText('FlyDea Mobile Campo').first().waitFor({ state: 'visible' });
  118 |   await page.getByTestId('mobile-search-input').waitFor({ state: 'visible' });
  119 | });
  120 | 
  121 | test('@smoke @roles leitor menu limitado e sem escrita mobile', async ({ page, request }) => {
  122 |   await loginUiFromToken(page, auth.leitor);
  123 | 
  124 |   await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: 'domcontentloaded' });
  125 |   await page.waitForLoadState('networkidle');
  126 |   await page.getByTestId('global-search-open').click();
  127 |   await page.getByTestId('global-search-input').fill('Parcelas');
  128 |   await expect(page.getByText('Parcelas', { exact: true })).toHaveCount(0);
  129 |   await page.keyboard.press('Escape');
  130 | 
  131 |   await page.goto(`${BASE_URL}/mobile`, { waitUntil: 'domcontentloaded' });
  132 |   await page.waitForLoadState('networkidle');
  133 |   await page.getByText('Acesso restrito').first().waitFor({ state: 'visible' });
  134 | 
  135 |   const { res } = await apiJson(
  136 |     request,
  137 |     'POST',
  138 |     '/mobile/ctm-sync',
  139 |     { items: [] },
  140 |     {
  141 |       Authorization: `Bearer ${auth.leitor.accessToken}`,
  142 |       'X-Tenant-Id': auth.leitor.tenantId,
  143 |     },
  144 |   );
  145 |   expect(res.status()).toBe(403);
  146 | });
  147 | 
```