# Sistema de Qualidade e Testes - Lava Car

## Resumo da Configuração

Sistema completo de qualidade de código e testes implementado com sucesso!

## Ferramentas Configuradas

### 1. Linters e Formatters

- **ESLint**: Análise estática de código TypeScript/JavaScript
- **Prettier**: Formatação automática de código
- **Husky**: Git hooks para executar verificações antes dos commits
- **lint-staged**: Executa linters apenas nos arquivos modificados

### 2. Testes

- **Vitest**: Framework de testes rápido para frontend e backend
- **Testing Library**: Testes de componentes React
- **Supertest**: Testes de API REST
- **Playwright**: Testes End-to-End

---

## Comandos Disponíveis

### Raiz do Projeto

```bash
# Linting
npm run lint              # Verificar código
npm run lint:fix          # Corrigir problemas automaticamente

# Formatação
npm run format            # Formatar todo o código
npm run format:check      # Verificar formatação

# Testes
npm test                  # Rodar todos os testes (frontend + backend)
npm run test:frontend     # Apenas testes do frontend
npm run test:backend      # Apenas testes do backend
npm run test:e2e          # Testes End-to-End

# Desenvolvimento
npm run dev:frontend      # Iniciar frontend
npm run dev:backend       # Iniciar backend

# Build
npm run build:frontend    # Build do frontend
npm run build:backend     # Build do backend
```

### Frontend

```bash
cd frontend

# Testes
npm test                  # Rodar testes
npm run test:ui           # Interface visual dos testes
npm run test:coverage     # Cobertura de testes

# Linting e Formatação
npm run lint              # Verificar código
npm run lint:fix          # Corrigir problemas
npm run format            # Formatar código
npm run format:check      # Verificar formatação
```

### Backend

```bash
cd backend

# Testes
npm test                  # Rodar testes
npm run test:ui           # Interface visual dos testes
npm run test:coverage     # Cobertura de testes

# Linting e Formatação
npm run lint              # Verificar código
npm run lint:fix          # Corrigir problemas
npm run format            # Formatar código
npm run format:check      # Verificar formatação
```

---

## Estrutura de Testes

### Frontend (`frontend/src/__tests__/`)

- **App.test.tsx**: Testes do componente principal
  - Navegação entre abas
  - Renderização de componentes
  - Estado da aplicação

- **utils.test.ts**: Testes de funções utilitárias
  - Formatação de valores
  - Validações

### Backend (`backend/src/__tests__/`)

- **lavagens.test.ts**: Testes da API de lavagens
  - GET /api/lavagens (listar, filtrar)
  - GET /api/lavagens/resumo
  - POST /api/lavagens (criar)
  - PUT /api/lavagens/:id (atualizar)
  - DELETE /api/lavagens/:id (deletar)
  - Validações de schema

- **despesas.test.ts**: Testes da API de despesas
  - GET /api/despesas
  - POST /api/despesas
  - DELETE /api/despesas/:id
  - Validações

### E2E (`e2e/`)

- **app.spec.ts**: Testes End-to-End
  - Carregamento da aplicação
  - Navegação entre páginas
  - Responsividade
  - Performance
  - Acessibilidade

---

## Resultados dos Testes

### Frontend

- **11 testes** passando
- Cobertura: App.tsx, utils

### Backend

- **21 testes** passando
- Cobertura: API de lavagens e despesas

### Total

- **32 testes** implementados e funcionando

---

## Git Hooks (Husky)

### Pre-commit

Antes de cada commit, o sistema automaticamente:

1. Executa ESLint nos arquivos modificados
2. Formata código com Prettier
3. Valida TypeScript

Se houver erros, o commit é bloqueado até correção.

---

## Configurações

### ESLint (`.eslintrc.json`)

- Regras para TypeScript
- Regras específicas para React (frontend)
- Avisos para console.log
- Permite variáveis não utilizadas com prefixo `_`

### Prettier (`.prettierrc`)

- Ponto-e-vírgula: sim
- Aspas simples: sim
- Largura de linha: 80
- Tab: 2 espaços
- Trailing comma: es5

### Vitest

- **Frontend**: Ambiente jsdom, setup para Testing Library
- **Backend**: Ambiente node, setup para testes de API

### Playwright

- Testes em múltiplos browsers (Chrome, Firefox, Safari)
- Testes mobile (iPhone, Android)
- Screenshots em falhas
- Trace em retry

---

## Como Adicionar Novos Testes

### Teste de Componente (Frontend)

```typescript
// frontend/src/__tests__/MeuComponente.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MeuComponente from '../MeuComponente';

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente />);
    expect(screen.getByText('Olá')).toBeInTheDocument();
  });
});
```

### Teste de API (Backend)

```typescript
// backend/src/__tests__/minhaRota.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app';

const app = createTestApp();

describe('GET /api/minha-rota', () => {
  it('deve retornar 200', async () => {
    const response = await request(app).get('/api/minha-rota');
    expect(response.status).toBe(200);
  });
});
```

### Teste E2E (Playwright)

```typescript
// e2e/meu-teste.spec.ts
import { test, expect } from '@playwright/test';

test('deve fazer algo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Olá')).toBeVisible();
});
```

---

## Troubleshooting

### Testes Falhando

```bash
# Limpar cache e reinstalar
cd frontend && rm -rf node_modules && npm install
cd ../backend && rm -rf node_modules && npm install
```

### Lint Errors

```bash
# Corrigir automaticamente
npm run lint:fix
```

### Pre-commit Hook não Funciona

```bash
# Reinstalar Husky
rm -rf .husky
npm install
npx husky init
```

---

## Próximos Passos

1. **Aumentar Cobertura de Testes**
   - Adicionar testes para todos os componentes
   - Cobrir todos os endpoints da API
   - Mais cenários E2E

2. **CI/CD**
   - Configurar GitHub Actions
   - Rodar testes automaticamente em PRs
   - Deploy automático após testes passarem

3. **Análise de Qualidade**
   - Configurar SonarQube
   - Métricas de complexidade
   - Code smells

4. **Performance Testing**
   - Testes de carga com k6
   - Lighthouse CI para performance web

---

## Melhores Práticas

1. **Sempre rodar testes antes de commit**
2. **Escrever testes para novos recursos**
3. **Manter testes simples e legíveis**
4. **Usar nomes descritivos para testes**
5. **Evitar duplicação em testes**
6. **Mockar dependências externas**
7. **Testar casos de erro, não só o happy path**

---

## Recursos

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)

---

**Status**: Configurado e funcionando
**Data**: 13 de Outubro de 2025
**Agente**: #6 - Especialista em Qualidade e Testes
