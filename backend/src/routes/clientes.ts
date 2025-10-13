import { Router, Request, Response } from 'express';
import db from '../db/database';
import { z } from 'zod';

const router = Router();

// Validação com Zod
const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  placa: z
    .string()
    .regex(
      /^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$|^[A-Za-z]{3}-?\d{4}$/,
      'Placa inválida (formatos aceitos: ABC-1234, ABC1234 ou ABC1D23)'
    ),
  telefone: z.string().optional(),
});

// ========================================
// GET /api/clientes
// Listar todos os clientes (com busca)
// ========================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT
        c.*,
        (
          SELECT json_group_array(
            json_object(
              'id', l.id,
              'data', l.data,
              'valor', l.valor,
              'forma_pagamento', l.forma_pagamento,
              'observacao', l.observacao
            )
          )
          FROM (
            SELECT * FROM lavagens
            WHERE cliente_id = c.id
            ORDER BY data DESC
            LIMIT 5
          ) l
        ) as lavagens_json
      FROM clientes c
    `;

    const params: any[] = [];

    if (search) {
      query += ` WHERE c.nome LIKE ? OR c.placa LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    query += ` ORDER BY c.created_at DESC`;

    const clientes = db.prepare(query).all(...params);

    // Processar JSON das lavagens
    const clientesComLavagens = clientes.map((cliente: any) => ({
      ...cliente,
      lavagens: cliente.lavagens_json ? JSON.parse(cliente.lavagens_json) : [],
    }));

    // Remover campo auxiliar
    clientesComLavagens.forEach((c: any) => delete c.lavagens_json);

    res.json(clientesComLavagens);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// ========================================
// GET /api/clientes/:id
// Buscar cliente por ID
// ========================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        c.*,
        (
          SELECT json_group_array(
            json_object(
              'id', l.id,
              'data', l.data,
              'valor', l.valor,
              'forma_pagamento', l.forma_pagamento,
              'observacao', l.observacao
            )
          )
          FROM lavagens l
          WHERE l.cliente_id = c.id
          ORDER BY l.data DESC
        ) as lavagens_json
      FROM clientes c
      WHERE c.id = ?
    `;

    const cliente: any = db.prepare(query).get(parseInt(id));

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Processar JSON das lavagens
    const clienteComLavagens = {
      ...cliente,
      lavagens: cliente.lavagens_json ? JSON.parse(cliente.lavagens_json) : [],
    };

    delete clienteComLavagens.lavagens_json;

    res.json(clienteComLavagens);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// ========================================
// POST /api/clientes
// Criar novo cliente
// ========================================
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validar dados
    const validatedData = clienteSchema.parse(req.body);

    // Normalizar placa (remover hífen e deixar maiúscula)
    const placaNormalizada = validatedData.placa.replace('-', '').toUpperCase();

    // Verificar se placa já existe
    const existing = db
      .prepare('SELECT * FROM clientes WHERE placa = ?')
      .get(placaNormalizada);

    if (existing) {
      return res.status(400).json({ error: 'Placa já cadastrada' });
    }

    // Criar cliente
    const stmt = db.prepare(`
      INSERT INTO clientes (nome, placa, telefone)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      validatedData.nome,
      placaNormalizada,
      validatedData.telefone || null
    );

    // Buscar cliente criado
    const cliente = db
      .prepare('SELECT * FROM clientes WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// ========================================
// PUT /api/clientes/:id
// Atualizar cliente
// ========================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = clienteSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (validatedData.nome !== undefined) {
      updates.push('nome = ?');
      values.push(validatedData.nome);
    }

    if (validatedData.placa !== undefined) {
      updates.push('placa = ?');
      values.push(validatedData.placa.replace('-', '').toUpperCase());
    }

    if (validatedData.telefone !== undefined) {
      updates.push('telefone = ?');
      values.push(validatedData.telefone);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) {
      // Apenas updated_at, nada para atualizar
      const cliente = db
        .prepare('SELECT * FROM clientes WHERE id = ?')
        .get(parseInt(id));
      return res.json(cliente);
    }

    values.push(parseInt(id));

    const stmt = db.prepare(`
      UPDATE clientes
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // Buscar cliente atualizado
    const cliente = db
      .prepare('SELECT * FROM clientes WHERE id = ?')
      .get(parseInt(id));

    res.json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// ========================================
// DELETE /api/clientes/:id
// Deletar cliente
// ========================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM clientes WHERE id = ?');
    stmt.run(parseInt(id));

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

export default router;
