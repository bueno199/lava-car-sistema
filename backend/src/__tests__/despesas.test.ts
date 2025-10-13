import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test-app';
import { initDatabaseSync } from '../db/database';

const app = createTestApp();

beforeAll(async () => {
  await initDatabaseSync();
});

describe('API /api/despesas', () => {
  describe('GET /api/despesas', () => {
    it('deve retornar lista de despesas', async () => {
      const response = await request(app).get('/api/despesas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve filtrar despesas por data', async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const response = await request(app).get(`/api/despesas?data=${hoje}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/despesas', () => {
    it('deve criar uma nova despesa', async () => {
      const novaDespesa = {
        descricao: 'Compra de produtos de limpeza',
        valor: 150.0,
        tipo: 'produto',
        data: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/despesas')
        .send(novaDespesa);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.descricao).toBe(novaDespesa.descricao);
      expect(response.body.valor).toBe(novaDespesa.valor);
      expect(response.body.tipo).toBe(novaDespesa.tipo);
    });

    it('deve rejeitar despesa sem descrição', async () => {
      const despesaInvalida = {
        valor: 100.0,
        tipo: 'produto',
      };

      const response = await request(app)
        .post('/api/despesas')
        .send(despesaInvalida);

      expect(response.status).toBe(400);
    });

    it('deve rejeitar despesa com valor negativo', async () => {
      const despesaInvalida = {
        descricao: 'Despesa teste',
        valor: -50.0,
        tipo: 'produto',
      };

      const response = await request(app)
        .post('/api/despesas')
        .send(despesaInvalida);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/despesas/:id', () => {
    it('deve deletar uma despesa', async () => {
      // Primeiro criar uma despesa
      const novaDespesa = {
        descricao: 'Despesa para deletar',
        valor: 75.0,
        tipo: 'outro',
      };

      const createResponse = await request(app)
        .post('/api/despesas')
        .send(novaDespesa);

      const despesaId = createResponse.body.id;

      // Agora deletar
      const deleteResponse = await request(app).delete(
        `/api/despesas/${despesaId}`
      );

      expect(deleteResponse.status).toBe(204);
    });
  });
});
