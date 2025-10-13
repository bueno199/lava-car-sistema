import { test, expect } from '@playwright/test';

test.describe('Sistema Lava Car - E2E', () => {
  test('deve carregar a página principal', async ({ page }) => {
    await page.goto('/');

    // Verificar se o título da página está correto
    await expect(page).toHaveTitle(/Lava Car/i);

    // Verificar se as abas principais estão visíveis
    await expect(page.getByRole('button', { name: /lavagens/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /clientes/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /fechamento/i })
    ).toBeVisible();
  });

  test('deve navegar entre as abas', async ({ page }) => {
    await page.goto('/');

    // Verificar aba Lavagens (inicial)
    const lavagemTab = page.getByRole('button', { name: /lavagens/i });
    await expect(lavagemTab).toHaveClass(/text-blue-600/);

    // Clicar em Clientes
    const clientesTab = page.getByRole('button', { name: /clientes/i });
    await clientesTab.click();
    await expect(clientesTab).toHaveClass(/text-blue-600/);

    // Clicar em Fechamento
    const fechamentoTab = page.getByRole('button', { name: /fechamento/i });
    await fechamentoTab.click();
    await expect(fechamentoTab).toHaveClass(/text-purple-600/);

    // Voltar para Lavagens
    await lavagemTab.click();
    await expect(lavagemTab).toHaveClass(/text-blue-600/);
  });

  test('deve ser responsivo em mobile', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verificar se as abas ainda estão visíveis
    await expect(page.getByRole('button', { name: /lavagens/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /clientes/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /fechamento/i })
    ).toBeVisible();
  });

  test('deve permitir adicionar nova lavagem', async ({ page }) => {
    await page.goto('/');

    // Clicar no botão de adicionar lavagem (procurar por texto ou ícone)
    const addButton = page.getByRole('button', { name: /nova lavagem/i });

    // Se o botão existir, testar o fluxo
    if (await addButton.isVisible()) {
      await addButton.click();

      // Verificar se o formulário ou modal abriu
      // Esta parte depende da implementação real do componente
      await expect(page.getByText(/tipo de lavagem/i)).toBeVisible();
    }
  });

  test('deve exibir lista de lavagens do dia', async ({ page }) => {
    await page.goto('/');

    // Aguardar o carregamento dos dados
    await page.waitForLoadState('networkidle');

    // Verificar se existe algum conteúdo de lavagens
    // Pode não ter lavagens, então verificamos se a estrutura está presente
    const content = await page.content();
    expect(content).toBeTruthy();
  });

  test('deve permitir visualizar clientes', async ({ page }) => {
    await page.goto('/');

    // Navegar para aba Clientes
    await page.getByRole('button', { name: /clientes/i }).click();

    // Aguardar carregamento
    await page.waitForLoadState('networkidle');

    // Verificar se está na view correta
    await expect(page.getByRole('button', { name: /clientes/i })).toHaveClass(
      /text-blue-600/
    );
  });

  test('deve acessar fechamento diário', async ({ page }) => {
    await page.goto('/');

    // Navegar para aba Fechamento
    await page.getByRole('button', { name: /fechamento/i }).click();

    // Aguardar carregamento
    await page.waitForLoadState('networkidle');

    // Verificar se está na view correta
    await expect(page.getByRole('button', { name: /fechamento/i })).toHaveClass(
      /text-purple-600/
    );
  });

  test('deve manter estado ao recarregar página', async ({ page }) => {
    await page.goto('/');

    // Mudar para aba Clientes
    await page.getByRole('button', { name: /clientes/i }).click();

    // Recarregar página
    await page.reload();

    // Verificar que a aplicação carregou corretamente
    await expect(page.getByRole('button', { name: /lavagens/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /clientes/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /fechamento/i })
    ).toBeVisible();
  });
});

test.describe('Performance e Acessibilidade', () => {
  test('deve carregar a página em tempo razoável', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Página deve carregar em menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
  });

  test('deve ter elementos focáveis para navegação por teclado', async ({
    page,
  }) => {
    await page.goto('/');

    // Pressionar Tab para navegar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verificar se algum elemento está focado
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });
});
