const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.url().includes('/auth/login')) {
      console.log('Login API status:', response.status());
    }
  });

  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);

  await page.fill('input[type="email"]', 'admin@demo.local');
  await page.fill('input[type="password"]', 'Admin@12345');
  await page.fill('input[placeholder="ex: prefeitura-ubatuba"]', 'demo');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000);
  console.log('Final URL:', page.url());
  const body = await page.content();
  if (body.includes('Credenciais')) {
     console.log('Login failed: Invalid credentials toast shown');
  } else if (page.url().includes('dashboard')) {
     console.log('Login successful');
  } else {
     console.log('Stuck on login page. Did not navigate.');
  }
  await browser.close();
})();