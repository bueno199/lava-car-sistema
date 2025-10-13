import { Router, Request, Response } from 'express';
import db from '../db/database';
import { z } from 'zod';

const router = Router();

const despesaSchema = z.object({
  data: z.string().datetime().optional(),
  tipo: z.enum([
    'funcionario',
    'produto',
    'marmita',
    'aluguel',
    'conta',
    'outro',
  ]),
  descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  valor: z.number().positive('Valor deve ser positivo'),
  observacao: z.string().optional(),
});

// ========================================
// GET /api/despesas
// Listar despesas (com filtros)
// ========================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { dataInicio, dataFim, tipo } = req.query;

    let query = `
      SELECT * FROM despesas
      WHERE 1=1
    `;

    const params: any[] = [];

    if (dataInicio) {
      query += ` AND data >= ?`;
      params.push(new Date(dataInicio as string).toISOString());
    }

    if (dataFim) {
      query += ` AND data <= ?`;
      params.push(new Date(dataFim as string).toISOString());
    }

    if (tipo) {
      query += ` AND tipo = ?`;
      params.push(tipo);
    }

    query += ` ORDER BY data DESC LIMIT 100`;

    const despesas = db.prepare(query).all(...params);

    res.json(despesas);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ error: 'Erro ao buscar despesas' });
  }
});

// ========================================
// GET /api/despesas/resumo
// Resumo de despesas (hoje + mês)
// ========================================
router.get('/resumo', async (req: Request, res: Response) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Despesas de hoje
    const despesasHojeData = db
      .prepare(
        `
      SELECT
        SUM(valor) as total,
        COUNT(*) as count
      FROM despesas
      WHERE data >= ? AND data < ?
    `
      )
      .get(hoje.toISOString(), amanha.toISOString()) as {
      total: number | null;
      count: number;
    };

    // Despesas do mês
    const despesasMesData = db
      .prepare(
        `
      SELECT
        SUM(valor) as total,
        COUNT(*) as count
      FROM despesas
      WHERE data >= ?
    `
      )
      .get(inicioMes.toISOString()) as { total: number | null; count: number };

    // Por tipo (mês)
    const porTipo = db
      .prepare(
        `
      SELECT
        tipo,
        SUM(valor) as total,
        COUNT(*) as count
      FROM despesas
      WHERE data >= ?
      GROUP BY tipo
    `
      )
      .all(inicioMes.toISOString());

    res.json({
      hoje: {
        total: despesasHojeData.total || 0,
        quantidade: despesasHojeData.count,
      },
      mes: {
        total: despesasMesData.total || 0,
        quantidade: despesasMesData.count,
      },
      porTipo: porTipo.map((pt: any) => ({
        tipo: pt.tipo,
        _sum: { valor: pt.total },
        _count: pt.count,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de despesas:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de despesas' });
  }
});

// ========================================
// POST /api/despesas
// Registrar nova despesa
// ========================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = despesaSchema.parse(req.body);

    const data = validatedData.data ? new Date(validatedData.data) : new Date();

    const stmt = db.prepare(`
      INSERT INTO despesas (data, tipo, descricao, valor, observacao)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.toISOString(),
      validatedData.tipo,
      validatedData.descricao,
      validatedData.valor,
      validatedData.observacao || null
    );

    // Buscar despesa criada
    const despesa = db
      .prepare('SELECT * FROM despesas WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(despesa);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ error: 'Erro ao criar despesa' });
  }
});

// ========================================
// PUT /api/despesas/:id
// Atualizar despesa
// ========================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = despesaSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.data !== undefined) {
      updates.push('data = ?');
      values.push(new Date(validatedData.data).toISOString());
    }

    if (validatedData.tipo !== undefined) {
      updates.push('tipo = ?');
      values.push(validatedData.tipo);
    }

    if (validatedData.descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(validatedData.descricao);
    }

    if (validatedData.valor !== undefined) {
      updates.push('valor = ?');
      values.push(validatedData.valor);
    }

    if (validatedData.observacao !== undefined) {
      updates.push('observacao = ?');
      values.push(validatedData.observacao);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) {
      // Apenas updated_at, nada para atualizar
      const despesa = db
        .prepare('SELECT * FROM despesas WHERE id = ?')
        .get(parseInt(id));
      return res.json(despesa);
    }

    values.push(parseInt(id));

    const stmt = db.prepare(`
      UPDATE despesas
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // Buscar despesa atualizada
    const despesa = db
      .prepare('SELECT * FROM despesas WHERE id = ?')
      .get(parseInt(id));

    res.json(despesa);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro ao atualizar despesa' });
  }
});

// ========================================
// DELETE /api/despesas/:id
// Deletar despesa
// ========================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM despesas WHERE id = ?');
    stmt.run(parseInt(id));

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    res.status(500).json({ error: 'Erro ao deletar despesa' });
  }
});

export default router;
