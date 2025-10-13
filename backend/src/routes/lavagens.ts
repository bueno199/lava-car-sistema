import { Router, Request, Response } from 'express';
import db from '../db/database';
import { z } from 'zod';

const router = Router();

const lavagemSchema = z.object({
  tipoLavagem: z
    .string()
    .min(3, 'Tipo de lavagem deve ter no mínimo 3 caracteres'),
  placa: z.string().optional().nullable(),
  clienteId: z.number().positive().optional().nullable(),
  nomeCliente: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  data: z.string().datetime().optional(),
  valor: z.number().positive(),
  formaPagamento: z.enum(['dinheiro', 'pix', 'cartao']),
  observacao: z.string().optional().nullable(),
});

// ========================================
// GET /api/lavagens
// Listar lavagens (com filtros por data, placa, período)
// ========================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, dataInicio, dataFim, placa } = req.query;

    let query = `
      SELECT
        l.*,
        CASE
          WHEN c.id IS NOT NULL THEN json_object(
            'id', c.id,
            'nome', c.nome,
            'placa', c.placa,
            'telefone', c.telefone
          )
          ELSE NULL
        END as cliente_json
      FROM lavagens l
      LEFT JOIN clientes c ON l.cliente_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filtro por data específica (um dia)
    if (data) {
      const dataFiltro = new Date(data as string);
      dataFiltro.setHours(0, 0, 0, 0);
      const dataFimDia = new Date(dataFiltro);
      dataFimDia.setHours(23, 59, 59, 999);

      query += ` AND l.data >= ? AND l.data <= ?`;
      params.push(dataFiltro.toISOString(), dataFimDia.toISOString());
    }
    // Filtro por período (data início e fim)
    else if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio as string);
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(dataFim as string);
      fim.setHours(23, 59, 59, 999);

      query += ` AND l.data >= ? AND l.data <= ?`;
      params.push(inicio.toISOString(), fim.toISOString());
    }
    // Se não especificar nada, usar hoje
    else {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const fimHoje = new Date(hoje);
      fimHoje.setHours(23, 59, 59, 999);

      query += ` AND l.data >= ? AND l.data <= ?`;
      params.push(hoje.toISOString(), fimHoje.toISOString());
    }

    // Filtro por placa
    if (placa) {
      query += ` AND (l.placa LIKE ? OR c.placa LIKE ?)`;
      const placaPattern = `%${placa}%`;
      params.push(placaPattern, placaPattern);
    }

    query += ` ORDER BY l.data DESC`;

    const lavagens = db.prepare(query).all(...params);

    // Processar JSON do cliente
    const lavagensProcessadas = lavagens.map((lavagem: any) => ({
      ...lavagem,
      cliente: lavagem.cliente_json ? JSON.parse(lavagem.cliente_json) : null,
    }));

    // Remover campo auxiliar
    lavagensProcessadas.forEach((l: any) => delete l.cliente_json);

    res.json(lavagensProcessadas);
  } catch (error) {
    console.error('Erro ao buscar lavagens:', error);
    res.status(500).json({ error: 'Erro ao buscar lavagens' });
  }
});

// ========================================
// GET /api/lavagens/resumo
// Resumo do dia (ou filtrado por data)
// ========================================
router.get('/resumo', async (req: Request, res: Response) => {
  try {
    const { data } = req.query;

    // Se não especificar data, usar hoje
    const dataFiltro = data ? new Date(data as string) : new Date();
    dataFiltro.setHours(0, 0, 0, 0);

    const dataFim = new Date(dataFiltro);
    dataFim.setHours(23, 59, 59, 999);

    // Total de lavagens do dia
    const lavagensCount = db
      .prepare(
        `
      SELECT COUNT(*) as count
      FROM lavagens
      WHERE data >= ? AND data <= ?
    `
      )
      .get(dataFiltro.toISOString(), dataFim.toISOString()) as {
      count: number;
    };

    // Receita total do dia
    const receitaData = db
      .prepare(
        `
      SELECT SUM(valor) as total
      FROM lavagens
      WHERE data >= ? AND data <= ?
    `
      )
      .get(dataFiltro.toISOString(), dataFim.toISOString()) as {
      total: number | null;
    };

    // Por forma de pagamento
    const porFormaPagamento = db
      .prepare(
        `
      SELECT
        forma_pagamento,
        SUM(valor) as total,
        COUNT(*) as count
      FROM lavagens
      WHERE data >= ? AND data <= ?
      GROUP BY forma_pagamento
    `
      )
      .all(dataFiltro.toISOString(), dataFim.toISOString());

    // Por tipo de lavagem
    const porTipoLavagem = db
      .prepare(
        `
      SELECT
        tipo_lavagem,
        COUNT(*) as count,
        SUM(valor) as total
      FROM lavagens
      WHERE data >= ? AND data <= ?
      GROUP BY tipo_lavagem
      ORDER BY count DESC
    `
      )
      .all(dataFiltro.toISOString(), dataFim.toISOString());

    res.json({
      data: dataFiltro.toISOString().split('T')[0],
      lavagens: lavagensCount.count,
      receita: receitaData.total || 0,
      formasPagamento: porFormaPagamento.map((fp: any) => ({
        formaPagamento: fp.forma_pagamento,
        total: fp.total,
        count: fp.count,
      })),
      tiposLavagem: porTipoLavagem.map((tl: any) => ({
        tipo: tl.tipo_lavagem,
        count: tl.count,
        total: tl.total,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

// ========================================
// POST /api/lavagens
// Registrar nova lavagem (COM ou SEM cliente)
// ========================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = lavagemSchema.parse(req.body);

    const data = validatedData.data ? new Date(validatedData.data) : new Date();

    const stmt = db.prepare(`
      INSERT INTO lavagens (
        cliente_id,
        tipo_lavagem,
        placa,
        nome_cliente,
        telefone,
        data,
        valor,
        forma_pagamento,
        observacao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      validatedData.clienteId || null,
      validatedData.tipoLavagem,
      validatedData.placa || null,
      validatedData.nomeCliente || null,
      validatedData.telefone || null,
      data.toISOString(),
      validatedData.valor,
      validatedData.formaPagamento,
      validatedData.observacao || null
    );

    // Buscar lavagem criada
    const lavagem: any = db
      .prepare(
        `
      SELECT
        l.*,
        CASE
          WHEN c.id IS NOT NULL THEN json_object(
            'id', c.id,
            'nome', c.nome,
            'placa', c.placa,
            'telefone', c.telefone
          )
          ELSE NULL
        END as cliente_json
      FROM lavagens l
      LEFT JOIN clientes c ON l.cliente_id = c.id
      WHERE l.id = ?
    `
      )
      .get(result.lastInsertRowid);

    const lavagemProcessada = {
      ...lavagem,
      cliente: lavagem.cliente_json ? JSON.parse(lavagem.cliente_json) : null,
    };

    delete lavagemProcessada.cliente_json;

    res.status(201).json(lavagemProcessada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar lavagem:', error);
    res.status(500).json({ error: 'Erro ao criar lavagem' });
  }
});

// ========================================
// PUT /api/lavagens/:id
// Atualizar lavagem
// ========================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = lavagemSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.clienteId !== undefined) {
      updates.push('cliente_id = ?');
      values.push(validatedData.clienteId || null);
    }

    if (validatedData.tipoLavagem !== undefined) {
      updates.push('tipo_lavagem = ?');
      values.push(validatedData.tipoLavagem);
    }

    if (validatedData.placa !== undefined) {
      updates.push('placa = ?');
      values.push(validatedData.placa || null);
    }

    if (validatedData.data !== undefined) {
      updates.push('data = ?');
      values.push(new Date(validatedData.data).toISOString());
    }

    if (validatedData.valor !== undefined) {
      updates.push('valor = ?');
      values.push(validatedData.valor);
    }

    if (validatedData.formaPagamento !== undefined) {
      updates.push('forma_pagamento = ?');
      values.push(validatedData.formaPagamento);
    }

    if (validatedData.observacao !== undefined) {
      updates.push('observacao = ?');
      values.push(validatedData.observacao);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) {
      // Apenas updated_at, nada para atualizar
      const lavagem: any = db
        .prepare(
          `
        SELECT
          l.*,
          CASE
            WHEN c.id IS NOT NULL THEN json_object(
              'id', c.id,
              'nome', c.nome,
              'placa', c.placa,
              'telefone', c.telefone
            )
            ELSE NULL
          END as cliente_json
        FROM lavagens l
        LEFT JOIN clientes c ON l.cliente_id = c.id
        WHERE l.id = ?
      `
        )
        .get(parseInt(id));

      const lavagemProcessada = {
        ...lavagem,
        cliente: lavagem.cliente_json ? JSON.parse(lavagem.cliente_json) : null,
      };

      delete lavagemProcessada.cliente_json;

      return res.json(lavagemProcessada);
    }

    values.push(parseInt(id));

    const stmt = db.prepare(`
      UPDATE lavagens
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // Buscar lavagem atualizada
    const lavagem: any = db
      .prepare(
        `
      SELECT
        l.*,
        CASE
          WHEN c.id IS NOT NULL THEN json_object(
            'id', c.id,
            'nome', c.nome,
            'placa', c.placa,
            'telefone', c.telefone
          )
          ELSE NULL
        END as cliente_json
      FROM lavagens l
      LEFT JOIN clientes c ON l.cliente_id = c.id
      WHERE l.id = ?
    `
      )
      .get(parseInt(id));

    const lavagemProcessada = {
      ...lavagem,
      cliente: lavagem.cliente_json ? JSON.parse(lavagem.cliente_json) : null,
    };

    delete lavagemProcessada.cliente_json;

    res.json(lavagemProcessada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao atualizar lavagem:', error);
    res.status(500).json({ error: 'Erro ao atualizar lavagem' });
  }
});

// ========================================
// DELETE /api/lavagens/:id
// Deletar lavagem
// ========================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM lavagens WHERE id = ?');
    stmt.run(parseInt(id));

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar lavagem:', error);
    res.status(500).json({ error: 'Erro ao deletar lavagem' });
  }
});

export default router;
