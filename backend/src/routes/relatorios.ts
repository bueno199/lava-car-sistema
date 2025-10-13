import { Router, Request, Response } from 'express';
import db from '../db/database';

const router = Router();

// ========================================
// GET /api/relatorios/diario/:data
// Relatório diário completo
// ========================================
router.get('/diario/:data?', async (req: Request, res: Response) => {
  try {
    const dataParam = req.params.data;
    const data = dataParam ? new Date(dataParam) : new Date();
    data.setHours(0, 0, 0, 0);

    const dataFim = new Date(data);
    dataFim.setHours(23, 59, 59, 999);

    // Lavagens do dia com informações do cliente
    const lavagens: any[] = db
      .prepare(
        `
      SELECT
        l.*,
        json_object(
          'id', c.id,
          'nome', c.nome,
          'placa', c.placa,
          'telefone', c.telefone
        ) as cliente_json
      FROM lavagens l
      INNER JOIN clientes c ON l.cliente_id = c.id
      WHERE l.data >= ? AND l.data <= ?
      ORDER BY l.data DESC
    `
      )
      .all(data.toISOString(), dataFim.toISOString());

    // Processar JSON do cliente
    const lavagensComCliente = lavagens.map((l) => ({
      ...l,
      cliente: JSON.parse(l.cliente_json),
    }));
    lavagensComCliente.forEach((l) => delete l.cliente_json);

    // Despesas do dia
    const despesas = db
      .prepare(
        `
      SELECT * FROM despesas
      WHERE data >= ? AND data <= ?
      ORDER BY data DESC
    `
      )
      .all(data.toISOString(), dataFim.toISOString());

    // Calcular receitas
    const totalLavagens = lavagensComCliente.length;
    const receitaTotal = lavagensComCliente.reduce(
      (sum, l: any) => sum + l.valor,
      0
    );
    const receitaDinheiro = lavagensComCliente
      .filter((l: any) => l.forma_pagamento === 'dinheiro')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaPix = lavagensComCliente
      .filter((l: any) => l.forma_pagamento === 'pix')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaCartao = lavagensComCliente
      .filter((l: any) => l.forma_pagamento === 'cartao')
      .reduce((sum, l: any) => sum + l.valor, 0);

    // Calcular despesas
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

    // Calcular lucro
    const lucroLiquido = receitaTotal - despesaTotal;

    res.json({
      data: data.toISOString(),
      receitas: {
        totalLavagens,
        receitaTotal,
        receitaDinheiro,
        receitaPix,
        receitaCartao,
        lavagens: lavagensComCliente,
      },
      despesas: {
        despesaTotal,
        despesaFuncionario,
        despesaProduto,
        despesaMarmita,
        despesaOutros,
        despesas,
      },
      resumo: {
        receitaTotal,
        despesaTotal,
        lucroLiquido,
        margemLucro:
          receitaTotal > 0
            ? ((lucroLiquido / receitaTotal) * 100).toFixed(2) + '%'
            : '0%',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório diário' });
  }
});

// ========================================
// GET /api/relatorios/semanal
// Relatório semanal (últimos 7 dias)
// ========================================
router.get('/semanal', async (req: Request, res: Response) => {
  try {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
    seteDiasAtras.setHours(0, 0, 0, 0);

    // Lavagens da semana
    const lavagens = db
      .prepare(
        `
      SELECT * FROM lavagens
      WHERE data >= ? AND data <= ?
    `
      )
      .all(seteDiasAtras.toISOString(), hoje.toISOString());

    // Despesas da semana
    const despesas = db
      .prepare(
        `
      SELECT * FROM despesas
      WHERE data >= ? AND data <= ?
    `
      )
      .all(seteDiasAtras.toISOString(), hoje.toISOString());

    // Agrupar por dia
    const diasSemana = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(hoje);
      dia.setDate(dia.getDate() - i);
      dia.setHours(0, 0, 0, 0);

      const diaFim = new Date(dia);
      diaFim.setHours(23, 59, 59, 999);

      const lavagensData = lavagens.filter((l: any) => {
        const lavagemData = new Date(l.data);
        return lavagemData >= dia && lavagemData <= diaFim;
      });

      const despesasData = despesas.filter((d: any) => {
        const despesaData = new Date(d.data);
        return despesaData >= dia && despesaData <= diaFim;
      });

      const receitaDia = lavagensData.reduce((sum, l: any) => sum + l.valor, 0);
      const despesaDia = despesasData.reduce((sum, d: any) => sum + d.valor, 0);
      const lucroDia = receitaDia - despesaDia;

      diasSemana.push({
        data: dia.toISOString().split('T')[0],
        diaSemana: dia.toLocaleDateString('pt-BR', { weekday: 'short' }),
        totalLavagens: lavagensData.length,
        receita: receitaDia,
        despesa: despesaDia,
        lucro: lucroDia,
      });
    }

    // Totais da semana
    const totalLavagens = lavagens.length;
    const receitaTotal = lavagens.reduce((sum, l: any) => sum + l.valor, 0);
    const despesaTotal = despesas.reduce((sum, d: any) => sum + d.valor, 0);
    const lucroTotal = receitaTotal - despesaTotal;

    res.json({
      periodo: {
        inicio: seteDiasAtras.toISOString().split('T')[0],
        fim: hoje.toISOString().split('T')[0],
      },
      diasSemana,
      totais: {
        totalLavagens,
        receitaTotal,
        despesaTotal,
        lucroTotal,
        mediaDiaria: {
          lavagens: (totalLavagens / 7).toFixed(1),
          receita: (receitaTotal / 7).toFixed(2),
          despesa: (despesaTotal / 7).toFixed(2),
          lucro: (lucroTotal / 7).toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório semanal' });
  }
});

// ========================================
// GET /api/relatorios/mensal/:mes?
// Relatório mensal completo
// ========================================
router.get('/mensal/:mes?', async (req: Request, res: Response) => {
  try {
    const mesParam = req.params.mes;
    const hoje = new Date();

    // Se não passar mês, usa o atual
    const [ano, mes] = mesParam
      ? mesParam.split('-').map(Number)
      : [hoje.getFullYear(), hoje.getMonth() + 1];

    const inicioMes = new Date(ano, mes - 1, 1, 0, 0, 0, 0);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

    // Lavagens do mês com informações do cliente
    const lavagens: any[] = db
      .prepare(
        `
      SELECT
        l.*,
        json_object(
          'id', c.id,
          'nome', c.nome,
          'placa', c.placa,
          'telefone', c.telefone
        ) as cliente_json
      FROM lavagens l
      INNER JOIN clientes c ON l.cliente_id = c.id
      WHERE l.data >= ? AND l.data <= ?
      ORDER BY l.data DESC
    `
      )
      .all(inicioMes.toISOString(), fimMes.toISOString());

    // Processar JSON do cliente
    const lavagensComCliente = lavagens.map((l) => ({
      ...l,
      cliente: JSON.parse(l.cliente_json),
    }));
    lavagensComCliente.forEach((l) => delete l.cliente_json);

    // Despesas do mês
    const despesas = db
      .prepare(
        `
      SELECT * FROM despesas
      WHERE data >= ? AND data <= ?
      ORDER BY data DESC
    `
      )
      .all(inicioMes.toISOString(), fimMes.toISOString());

    // Calcular receitas
    const totalLavagens = lavagensComCliente.length;
    const receitaTotal = lavagensComCliente.reduce(
      (sum, l: any) => sum + l.valor,
      0
    );
    const receitaDinheiro = lavagensComCliente
      .filter((l: any) => l.forma_pagamento === 'dinheiro')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaPix = lavagensComCliente
      .filter((l: any) => l.forma_pagamento === 'pix')
      .reduce((sum, l: any) => sum + l.valor, 0);
    const receitaCartao = lavagensComCliente
      .filter((l: any) => l.forma_pagamento === 'cartao')
      .reduce((sum, l: any) => sum + l.valor, 0);

    // Calcular despesas
    const despesaTotal = despesas.reduce((sum, d: any) => sum + d.valor, 0);
    const despesaPorTipo = {
      funcionario: despesas
        .filter((d: any) => d.tipo === 'funcionario')
        .reduce((sum, d: any) => sum + d.valor, 0),
      produto: despesas
        .filter((d: any) => d.tipo === 'produto')
        .reduce((sum, d: any) => sum + d.valor, 0),
      marmita: despesas
        .filter((d: any) => d.tipo === 'marmita')
        .reduce((sum, d: any) => sum + d.valor, 0),
      aluguel: despesas
        .filter((d: any) => d.tipo === 'aluguel')
        .reduce((sum, d: any) => sum + d.valor, 0),
      conta: despesas
        .filter((d: any) => d.tipo === 'conta')
        .reduce((sum, d: any) => sum + d.valor, 0),
      outro: despesas
        .filter((d: any) => d.tipo === 'outro')
        .reduce((sum, d: any) => sum + d.valor, 0),
    };

    // Calcular lucro
    const lucroLiquido = receitaTotal - despesaTotal;

    // Dias trabalhados
    const diasTrabalhados = new Set(
      lavagensComCliente.map(
        (l: any) => new Date(l.data).toISOString().split('T')[0]
      )
    ).size;

    res.json({
      periodo: {
        mes: inicioMes.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        }),
        inicio: inicioMes.toISOString().split('T')[0],
        fim: fimMes.toISOString().split('T')[0],
        diasTrabalhados,
      },
      receitas: {
        totalLavagens,
        receitaTotal,
        receitaDinheiro,
        receitaPix,
        receitaCartao,
        ticketMedio:
          totalLavagens > 0 ? (receitaTotal / totalLavagens).toFixed(2) : '0',
      },
      despesas: {
        despesaTotal,
        porTipo: despesaPorTipo,
      },
      resumo: {
        receitaTotal,
        despesaTotal,
        lucroLiquido,
        margemLucro:
          receitaTotal > 0
            ? ((lucroLiquido / receitaTotal) * 100).toFixed(2) + '%'
            : '0%',
        mediaDiaria: {
          lavagens:
            diasTrabalhados > 0
              ? (totalLavagens / diasTrabalhados).toFixed(1)
              : '0',
          receita:
            diasTrabalhados > 0
              ? (receitaTotal / diasTrabalhados).toFixed(2)
              : '0',
          despesa:
            diasTrabalhados > 0
              ? (despesaTotal / diasTrabalhados).toFixed(2)
              : '0',
          lucro:
            diasTrabalhados > 0
              ? (lucroLiquido / diasTrabalhados).toFixed(2)
              : '0',
        },
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório mensal' });
  }
});

export default router;
