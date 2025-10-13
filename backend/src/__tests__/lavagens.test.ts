import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app';
import { initDatabaseSync } from '../db/database';

const app = createTestApp();

beforeAll(async () => {
  // Inicializar banco de dados para testes
  await initDatabaseSync();
});

describe('API /api/lavagens', () => {
  describe('GET /api/health', () => {
    it('deve retornar status ok', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/lavagens', () => {
    it('deve retornar lista de lavagens', async () => {
      const response = await request(app).get('/api/lavagens');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve filtrar lavagens por data', async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const response = await request(app).get(`/api/lavagens?data=${hoje}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve filtrar lavagens por período', async () => {
      const dataInicio = '2025-01-01';
      const dataFim = '2025-01-31';
      const response = await request(app).get(
        `/api/lavagens?dataInicio=${dataInicio}&dataFim=${dataFim}`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/lavagens/resumo', () => {
    it('deve retornar resumo das lavagens', async () => {
      const response = await request(app).get('/api/lavagens/resumo');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('lavagens');
      expect(response.body).toHaveProperty('receita');
      expect(response.body).toHaveProperty('formasPagamento');
      expect(response.body).toHaveProperty('tiposLavagem');
      expect(Array.isArray(response.body.formasPagamento)).toBe(true);
      expect(Array.isArray(response.body.tiposLavagem)).toBe(true);
    });

    it('deve retornar resumo para data específica', async () => {
      const data = '2025-01-15T12:00:00Z';
      const response = await request(app).get(
        `/api/lavagens/resumo?data=${data}`
      );

      expect(response.status).toBe(200);
      // Verificar apenas que a data está presente
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toContain('2025-01-15');
    });
  });

  describe('POST /api/lavagens', () => {
    it('deve criar uma nova lavagem', async () => {
      const novaLavagem = {
        tipoLavagem: 'Lavagem Completa',
        placa: 'ABC1234',
        valor: 50.0,
        formaPagamento: 'dinheiro',
        observacao: 'Cliente preferencial',
      };

      const response = await request(app)
        .post('/api/lavagens')
        .send(novaLavagem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.tipo_lavagem).toBe(novaLavagem.tipoLavagem);
      expect(response.body.placa).toBe(novaLavagem.placa);
      expect(response.body.valor).toBe(novaLavagem.valor);
      expect(response.body.forma_pagamento).toBe(novaLavagem.formaPagamento);
    });

    it('deve rejeitar lavagem com dados inválidos', async () => {
      const lavagemInvalida = {
        tipoLavagem: 'Ab', // Muito curto (mínimo 3 caracteres)
        valor: -10, // Valor negativo
        formaPagamento: 'invalido', // Forma de pagamento inválida
      };

      const response = await request(app)
        .post('/api/lavagens')
        .send(lavagemInvalida);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve criar lavagem sem cliente (avulso)', async () => {
      const lavagemAvulsa = {
        tipoLavagem: 'Lavagem Simples',
        nomeCliente: 'João Silva',
        telefone: '11999999999',
        valor: 30.0,
        formaPagamento: 'pix',
      };

      const response = await request(app)
        .post('/api/lavagens')
        .send(lavagemAvulsa);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome_cliente).toBe(lavagemAvulsa.nomeCliente);
      expect(response.body.telefone).toBe(lavagemAvulsa.telefone);
    });

    it('deve aceitar formas de pagamento válidas', async () => {
      const formasPagamento = ['dinheiro', 'pix', 'cartao'];

      for (const forma of formasPagamento) {
        const lavagem = {
          tipoLavagem: 'Lavagem Teste',
          valor: 40.0,
          formaPagamento: forma,
        };

        const response = await request(app).post('/api/lavagens').send(lavagem);

        expect(response.status).toBe(201);
        expect(response.body.forma_pagamento).toBe(forma);
      }
    });
  });

  describe('PUT /api/lavagens/:id', () => {
    it('deve atualizar uma lavagem existente', async () => {
      // Primeiro criar uma lavagem
      const novaLavagem = {
        tipoLavagem: 'Lavagem para Atualizar',
        valor: 60.0,
        formaPagamento: 'dinheiro',
      };

      const createResponse = await request(app)
        .post('/api/lavagens')
        .send(novaLavagem);

      const lavagemId = createResponse.body.id;

      // Agora atualizar
      const atualizacao = {
        tipoLavagem: 'Lavagem Atualizada',
        valor: 70.0,
        formaPagamento: 'pix',
      };

      const updateResponse = await request(app)
        .put(`/api/lavagens/${lavagemId}`)
        .send(atualizacao);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.tipo_lavagem).toBe(atualizacao.tipoLavagem);
      expect(updateResponse.body.valor).toBe(atualizacao.valor);
      expect(updateResponse.body.forma_pagamento).toBe(
        atualizacao.formaPagamento
      );
    });
  });

  describe('DELETE /api/lavagens/:id', () => {
    it('deve deletar uma lavagem', async () => {
      // Primeiro criar uma lavagem
      const novaLavagem = {
        tipoLavagem: 'Lavagem para Deletar',
        valor: 45.0,
        formaPagamento: 'cartao',
      };

      const createResponse = await request(app)
        .post('/api/lavagens')
        .send(novaLavagem);

      const lavagemId = createResponse.body.id;

      // Agora deletar
      const deleteResponse = await request(app).delete(
        `/api/lavagens/${lavagemId}`
      );

      expect(deleteResponse.status).toBe(204);
    });
  });
});

describe('Validações de Schema', () => {
  it('deve exigir tipoLavagem mínimo de 3 caracteres', async () => {
    const lavagem = {
      tipoLavagem: 'AB',
      valor: 50.0,
      formaPagamento: 'dinheiro',
    };

    const response = await request(app).post('/api/lavagens').send(lavagem);

    expect(response.status).toBe(400);
  });

  it('deve exigir valor positivo', async () => {
    const lavagem = {
      tipoLavagem: 'Lavagem Teste',
      valor: 0,
      formaPagamento: 'dinheiro',
    };

    const response = await request(app).post('/api/lavagens').send(lavagem);

    expect(response.status).toBe(400);
  });

  it('deve validar formas de pagamento permitidas', async () => {
    const lavagem = {
      tipoLavagem: 'Lavagem Teste',
      valor: 50.0,
      formaPagamento: 'boleto', // Não permitido
    };

    const response = await request(app).post('/api/lavagens').send(lavagem);

    expect(response.status).toBe(400);
  });
});
