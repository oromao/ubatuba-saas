const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));
  
  await page.goto('http://localhost:3000/login');
  
  await page.waitForTimeout(3000);

  await page.fill('input[type="email"]', 'admin@demo.local');
  await page.fill('input[type="password"]', 'Admin@12345');
  await page.fill('input[placeholder="ex: prefeitura-ubatuba"]', 'demo');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('Final URL:', page.url());
  const body = await page.content();
  await browser.close();
})();