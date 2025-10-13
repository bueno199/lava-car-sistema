import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RelatorioData {
  receita_lavagens: number;
  receita_dinheiro: number;
  receita_pix: number;
  receita_cartao: number;
  receita_total: number;
  despesa_total: number;
  despesas_por_tipo: Array<{
    tipo: string;
    total: number;
  }>;
  lucro_liquido: number;
  margem_lucro: number;
  data?: string;
  semana_inicio?: string;
  semana_fim?: string;
  mes?: number;
  ano?: number;
  evolucao_diaria?: Array<{
    data: string;
    receita: number;
    despesa: number;
    lucro: number;
  }>;
}

type TipoRelatorio = 'diario' | 'semanal' | 'mensal';

const RelatoriosView: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('diario');
  const [relatorioData, setRelatorioData] = useState<RelatorioData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth() + 1
  );
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );

  // Cores para gráficos
  const COLORS = {
    receita: '#10b981', // verde
    despesa: '#ef4444', // vermelho
    lucro: '#3b82f6', // azul
    dinheiro: '#f59e0b', // amarelo
    pix: '#8b5cf6', // roxo
    cartao: '#ec4899', // rosa
  };

  const PIE_COLORS = ['#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    carregarRelatorio();
  }, [tipoRelatorio, dataSelecionada, mesSelecionado, anoSelecionado]);

  const carregarRelatorio = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = 'http://localhost:3000/api/relatorios/';

      switch (tipoRelatorio) {
        case 'diario':
          url += `diario?data=${dataSelecionada}`;
          break;
        case 'semanal':
          url += 'semanal';
          break;
        case 'mensal':
          url += `mensal?mes=${mesSelecionado}&ano=${anoSelecionado}`;
          break;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao carregar relatório');
      }

      const data = await response.json();
      setRelatorioData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar relatório:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarPorcentagem = (valor: number) => {
    return `${valor.toFixed(2)}%`;
  };

  const prepararDadosComparacao = () => {
    if (!relatorioData) return [];

    return [
      {
        name: 'Financeiro',
        Receita: relatorioData.receita_total,
        Despesa: relatorioData.despesa_total,
        Lucro: relatorioData.lucro_liquido,
      },
    ];
  };

  const prepararDadosFormasPagamento = () => {
    if (!relatorioData) return [];

    return [
      { name: 'Dinheiro', value: relatorioData.receita_dinheiro },
      { name: 'PIX', value: relatorioData.receita_pix },
      { name: 'Cartão', value: relatorioData.receita_cartao },
    ].filter((item) => item.value > 0);
  };

  const prepararDadosEvolucao = () => {
    if (!relatorioData?.evolucao_diaria) return [];

    return relatorioData.evolucao_diaria.map((item) => ({
      data: new Date(item.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      Receita: item.receita,
      Despesa: item.despesa,
      Lucro: item.lucro,
    }));
  };

  const renderKPICard = (
    titulo: string,
    valor: number,
    cor: string,
    icone: string,
    subtitulo?: string
  ) => {
    const corClasses = {
      verde: 'bg-green-50 border-green-500 text-green-700',
      vermelho: 'bg-red-50 border-red-500 text-red-700',
      azul: 'bg-blue-50 border-blue-500 text-blue-700',
    };

    return (
      <div
        className={`rounded-lg border-l-4 p-6 ${corClasses[cor as keyof typeof corClasses]}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-70">{titulo}</p>
            <p className="text-3xl font-bold mt-2">{formatarMoeda(valor)}</p>
            {subtitulo && (
              <p className="text-sm mt-2 opacity-80">{subtitulo}</p>
            )}
          </div>
          <div className="text-5xl opacity-20">{icone}</div>
        </div>
      </div>
    );
  };

  const renderPeriodoInfo = () => {
    if (!relatorioData) return null;

    switch (tipoRelatorio) {
      case 'diario':
        return (
          <div className="text-sm text-gray-600">
            Data:{' '}
            {new Date(dataSelecionada).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        );
      case 'semanal':
        if (relatorioData.semana_inicio && relatorioData.semana_fim) {
          return (
            <div className="text-sm text-gray-600">
              Período:{' '}
              {new Date(relatorioData.semana_inicio).toLocaleDateString(
                'pt-BR'
              )}{' '}
              até{' '}
              {new Date(relatorioData.semana_fim).toLocaleDateString('pt-BR')}
            </div>
          );
        }
        return null;
      case 'mensal':
        return (
          <div className="text-sm text-gray-600">
            Mês:{' '}
            {new Date(anoSelecionado, mesSelecionado - 1).toLocaleDateString(
              'pt-BR',
              {
                month: 'long',
                year: 'numeric',
              }
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Relatórios Financeiros
        </h1>
        <p className="text-gray-600">
          Análise completa de receitas, despesas e lucros
        </p>
      </div>

      {/* Seletor de Tipo de Relatório */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoRelatorio('diario')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  tipoRelatorio === 'diario'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Diário
              </button>
              <button
                onClick={() => setTipoRelatorio('semanal')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  tipoRelatorio === 'semanal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setTipoRelatorio('mensal')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  tipoRelatorio === 'mensal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Mensal
              </button>
            </div>
          </div>

          {/* Filtros específicos por tipo */}
          {tipoRelatorio === 'diario' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Data
              </label>
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {tipoRelatorio === 'mensal' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês
                </label>
                <select
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                    <option key={mes} value={mes}>
                      {new Date(2000, mes - 1).toLocaleDateString('pt-BR', {
                        month: 'long',
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano
                </label>
                <select
                  value={anoSelecionado}
                  onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            onClick={carregarRelatorio}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        {renderPeriodoInfo()}
      </div>

      {/* Loading e Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando relatório...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          <p className="font-medium">Erro ao carregar relatório</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Conteúdo do Relatório */}
      {!loading && !error && relatorioData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {renderKPICard(
              'Receita Total',
              relatorioData.receita_total,
              'verde',
              '💰',
              `${relatorioData.receita_lavagens} lavagens realizadas`
            )}
            {renderKPICard(
              'Despesas Totais',
              relatorioData.despesa_total,
              'vermelho',
              '📊'
            )}
            {renderKPICard(
              'Lucro Líquido',
              relatorioData.lucro_liquido,
              'azul',
              '📈',
              `Margem: ${formatarPorcentagem(relatorioData.margem_lucro)}`
            )}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Barras - Comparação */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Comparação Financeira
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepararDadosComparacao()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatarMoeda(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="Receita" fill={COLORS.receita} />
                  <Bar dataKey="Despesa" fill={COLORS.despesa} />
                  <Bar dataKey="Lucro" fill={COLORS.lucro} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Pizza - Formas de Pagamento */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Formas de Pagamento
              </h2>
              {prepararDadosFormasPagamento().length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepararDadosFormasPagamento()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepararDadosFormasPagamento().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatarMoeda(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Sem dados de pagamento no período
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Evolução Semanal */}
          {tipoRelatorio === 'semanal' &&
            prepararDadosEvolucao().length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Evolução nos Últimos 7 Dias
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={prepararDadosEvolucao()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatarMoeda(Number(value))}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Receita"
                      stroke={COLORS.receita}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Despesa"
                      stroke={COLORS.despesa}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Lucro"
                      stroke={COLORS.lucro}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

          {/* Detalhamento de Receitas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Receitas por Forma de Pagamento */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Detalhamento de Receitas
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-gray-700">💵 Dinheiro</span>
                  <span className="font-bold text-yellow-700">
                    {formatarMoeda(relatorioData.receita_dinheiro)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-gray-700">📱 PIX</span>
                  <span className="font-bold text-purple-700">
                    {formatarMoeda(relatorioData.receita_pix)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                  <span className="font-medium text-gray-700">💳 Cartão</span>
                  <span className="font-bold text-pink-700">
                    {formatarMoeda(relatorioData.receita_cartao)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border-2 border-green-500">
                  <span className="font-bold text-gray-800">TOTAL</span>
                  <span className="font-bold text-green-700 text-lg">
                    {formatarMoeda(relatorioData.receita_total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Despesas por Tipo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Despesas por Tipo
              </h2>
              {relatorioData.despesas_por_tipo &&
              relatorioData.despesas_por_tipo.length > 0 ? (
                <div className="space-y-3">
                  {relatorioData.despesas_por_tipo.map((despesa, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-700 capitalize">
                        {despesa.tipo}
                      </span>
                      <span className="font-bold text-red-700">
                        {formatarMoeda(despesa.total)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-2 border-red-500">
                    <span className="font-bold text-gray-800">TOTAL</span>
                    <span className="font-bold text-red-700 text-lg">
                      {formatarMoeda(relatorioData.despesa_total)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  Nenhuma despesa registrada no período
                </div>
              )}
            </div>
          </div>

          {/* Resumo Final */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Resultado do Período
                </h2>
                <p className="text-blue-100">
                  {relatorioData.lucro_liquido >= 0
                    ? 'Lucro positivo'
                    : 'Prejuízo no período'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">
                  {formatarMoeda(relatorioData.lucro_liquido)}
                </div>
                <div className="text-xl mt-2">
                  Margem: {formatarPorcentagem(relatorioData.margem_lucro)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RelatoriosView;
