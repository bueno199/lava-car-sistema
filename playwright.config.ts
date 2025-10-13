import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Documentação: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Executar testes em paralelo */
  fullyParallel: true,

  /* Falhar build no CI se você deixar test.only */
  forbidOnly: !!process.env.CI,

  /* Retry nos testes com falha apenas no CI */
  retries: process.env.CI ? 2 : 0,

  /* Opt out de testes paralelos no CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter para usar */
  reporter: 'html',

  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em ações como `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Coletar trace em caso de falha */
    trace: 'on-first-retry',

    /* Screenshot em caso de falha */
    screenshot: 'only-on-failure',
  },

  /* Configurar projetos para diferentes browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Teste em mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Executar servidor local antes de iniciar os testes */
  webServer: {
    command: 'npm run dev:frontend',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
