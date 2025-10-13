import { Router, Request, Response } from 'express';
import db from '../db/database';
import { z } from 'zod';

const router = Router();

const fechamentoSchema = z.object({
  data: z.string().datetime(),
  observacao: z.string().optional(),
});

// ========================================
// POST /api/fechamento
// Encerrar o dia
// ========================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const { data, observacao } = fechamentoSchema.parse(req.body);
    const dataFechamento = new Date(data);

    // Pegar início e fim do dia
    const inicioDia = new Date(dataFechamento);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(dataFechamento);
    fimDia.setHours(23, 59, 59, 999);

    // Verificar se já existe fechamento para esse dia
    const existente = db
      .prepare(
        `
      SELECT * FROM fechamentos_diarios
      WHERE data = ?
    `
      )
      .get(inicioDia.toISOString().split('T')[0]);

    if (existente) {
      return res
        .status(400)
        .json({ error: 'Dia já foi encerrado anteriormente' });
    }

    // Buscar lavagens do dia
    const lavagens = db
      .prepare(
        `
      SELECT * FROM lavagens
      WHERE data >= ? AND data <= ?
    `
      )
      .all(inicioDia.toISOString(), fimDia.toISOString());

    // Buscar despesas do dia
    const despesas = db
      .prepare(
        `
      SELECT * FROM despesas
      WHERE data >= ? AND data <= ?
    `
      )
      .all(inicioDia.toISOString(), fimDia.toISOString());

    // Calcular totais de receitas
    const totalLavagens = lavagens.length;
    const receitaTotal = lavagens.reduce((sum, l: any) => sum + l.valor, 0);
    const receitaDinheiro = lavagens
      .filter((l: any) => l.forma_pagamento === 'dinheiro')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaPix = lavagens
      .filter((l: any) => l.forma_pagamento === 'pix')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaCartao = lavagens
      .filter((l: any) => l.forma_pagamento === 'cartao')
      .reduce((sum, l: any) => sum + l.valor, 0);

    // Calcular totais de despesas
    const despesaTotal = despesas.reduce((sum, d: any) => sum + d.valor, 0);
    const despesaFuncionario = despesas
      .filter((d: any) => d.tipo === 'funcionario')
      .reduce((sum, d: any) => sum + d.valor, 0);
    const despesaProduto = despesas
      .filter((d: any) => d.tipo === 'produto')
      .reduce((sum, d: any) => sum + d.valor, 0);
    const despesaMarmita = despesas
      .filter((d: any) => d.tipo === 'marmita')
      .reduce((sum, d: any) => sum + d.valor, 0);
    const despesaOutros = despesas
      .filter((d: any) => ['aluguel', 'conta', 'outro'].includes(d.tipo))
      .reduce((sum, d: any) => sum + d.valor, 0);

    // Calcular lucro líquido
    const lucroLiquido = receitaTotal - despesaTotal;

    // Criar fechamento
    const stmt = db.prepare(`
      INSERT INTO fechamentos_diarios (
        data,
        total_lavagens,
        receita_total,
        receita_dinheiro,
        receita_pix,
        receita_cartao,
        despesa_total,
        despesa_funcionario,
        despesa_produto,
        despesa_marmita,
        despesa_outros,
        lucro_liquido,
        observacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      inicioDia.toISOString().split('T')[0],
      totalLavagens,
      receitaTotal,
      receitaDinheiro,
      receitaPix,
      receitaCartao,
      despesaTotal,
      despesaFuncionario,
      despesaProduto,
      despesaMarmita,
      despesaOutros,
      lucroLiquido,
      observacao || null
    );

    // Buscar fechamento criado
    const fechamento = db
      .prepare(
        `
      SELECT * FROM fechamentos_diarios WHERE id = ?
    `
      )
      .get(result.lastInsertRowid);

    res.status(201).json(fechamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erro ao encerrar dia:', error);
    res.status(500).json({ error: 'Erro ao encerrar dia' });
  }
});

// ========================================
// GET /api/fechamento
// Listar fechamentos
// ========================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const fechamentos = db
      .prepare(
        `
      SELECT * FROM fechamentos_diarios
      ORDER BY data DESC
      LIMIT 30
    `
      )
      .all();

    res.json(fechamentos);
  } catch (error) {
    console.error('Erro ao buscar fechamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar fechamentos' });
  }
});

// ========================================
// GET /api/fechamento/verificar/:data
// Verificar se dia já foi encerrado
// ========================================
router.get('/verificar/:data', async (req: Request, res: Response) => {
  try {
    const { data } = req.params;
    const dataConsulta = new Date(data);
    dataConsulta.setHours(0, 0, 0, 0);

    const fechamento = db
      .prepare(
        `
      SELECT * FROM fechamentos_diarios
      WHERE data = ?
    `
      )
      .get(dataConsulta.toISOString().split('T')[0]);

    res.json({
      encerrado: !!fechamento,
      fechamento: fechamento || null,
    });
  } catch (error) {
    console.error('Erro ao verificar fechamento:', error);
    res.status(500).json({ error: 'Erro ao verificar fechamento' });
  }
});

// ========================================
// GET /api/fechamento/resumo
// Buscar resumo do dia para fechamento
// ========================================
router.get('/resumo', async (req: Request, res: Response) => {
  try {
    const { data } = req.query;
    let dataConsulta: Date;

    if (data && typeof data === 'string') {
      dataConsulta = new Date(data);
    } else {
      dataConsulta = new Date();
    }

    const inicioDia = new Date(dataConsulta);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(dataConsulta);
    fimDia.setHours(23, 59, 59, 999);

    // Buscar lavagens do dia
    const lavagens = db
      .prepare(
        `
      SELECT * FROM lavagens
      WHERE data >= ? AND data <= ?
    `
      )
      .all(inicioDia.toISOString(), fimDia.toISOString());

    // Buscar despesas do dia
    const despesas = db
      .prepare(
        `
      SELECT * FROM despesas
      WHERE data >= ? AND data <= ?
    `
      )
      .all(inicioDia.toISOString(), fimDia.toISOString());

    // Calcular totais de receitas
    const totalLavagens = lavagens.length;
    const receitaTotal = lavagens.reduce((sum, l: any) => sum + l.valor, 0);
    const receitaDinheiro = lavagens
      .filter((l: any) => l.forma_pagamento === 'dinheiro')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaPix = lavagens
      .filter((l: any) => l.forma_pagamento === 'pix')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaCartao = lavagens
      .filter((l: any) => l.forma_pagamento === 'cartao')
      .reduce((sum, l: any) => sum + l.valor, 0);

    // Calcular totais de despesas
    const despesaTotal = despesas.reduce((sum, d: any) => sum + d.valor, 0);

    // Agrupar despesas por tipo
    const despesaPorTipo = [
      {
        tipo: 'Funcionário',
        valor: despesas
          .filter((d: any) => d.tipo === 'funcionario')
          .reduce((sum, d: any) => sum + d.valor, 0),
      },
      {
        tipo: 'Produto',
        valor: despesas
          .filter((d: any) => d.tipo === 'produto')
          .reduce((sum, d: any) => sum + d.valor, 0),
      },
      {
        tipo: 'Marmita',
        valor: despesas
          .filter((d: any) => d.tipo === 'marmita')
          .reduce((sum, d: any) => sum + d.valor, 0),
      },
      {
        tipo: 'Outros',
        valor: despesas
          .filter((d: any) => ['aluguel', 'conta', 'outro'].includes(d.tipo))
          .reduce((sum, d: any) => sum + d.valor, 0),
      },
    ].filter((d) => d.valor > 0);

    // Calcular lucro líquido
    const lucro = receitaTotal - despesaTotal;

    res.json({
      data: inicioDia.toISOString().split('T')[0],
      totalLavagens,
      receitaTotal,
      receitaDinheiro,
      receitaPix,
      receitaCartao,
      despesaTotal,
      despesaPorTipo,
      lucro,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

export default router;
