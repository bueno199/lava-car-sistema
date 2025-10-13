import { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Save,
  Clock,
  FileText,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface ResumoFechamento {
  data: string;
  totalLavagens: number;
  receitaTotal: number;
  receitaDinheiro: number;
  receitaPix: number;
  receitaCartao: number;
  despesaTotal: number;
  despesaPorTipo: {
    tipo: string;
    valor: number;
  }[];
  lucro: number;
}

interface FechamentoDia {
  id: number;
  data: string;
  total_lavagens: number;
  receita_total: number;
  receita_dinheiro: number;
  receita_pix: number;
  receita_cartao: number;
  despesa_total: number;
  despesa_funcionario: number;
  despesa_produto: number;
  despesa_marmita: number;
  despesa_outros: number;
  lucro_liquido: number;
  observacao: string | null;
  criado_em: string;
}

export function FechamentoDiarioView() {
  const toast = useToast();
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [resumo, setResumo] = useState<ResumoFechamento | null>(null);
  const [fechamentos, setFechamentos] = useState<FechamentoDia[]>([]);
  const [observacao, setObservacao] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Buscar resumo do dia
  const buscarResumo = async () => {
    try {
      const response = await fetch(
        `/api/fechamento/resumo?data=${dataSelecionada}`
      );
      const data = await response.json();
      setResumo(data);
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      toast.error('Erro ao buscar resumo do dia');
    }
  };

  // Buscar histórico de fechamentos
  const buscarFechamentos = async () => {
    try {
      const response = await fetch('/api/fechamento');
      const data = await response.json();
      setFechamentos(data);
    } catch (error) {
      console.error('Erro ao buscar fechamentos:', error);
      toast.error('Erro ao buscar histórico');
    }
  };

  useEffect(() => {
    buscarResumo();
    buscarFechamentos();
  }, [dataSelecionada]);

  // Encerrar dia
  const handleEncerrarDia = async () => {
    if (!resumo) {
      toast.warning('Nenhum resumo disponível para encerrar');
      return;
    }

    if (carregando) return;

    setCarregando(true);

    try {
      // Backend espera data no formato ISO datetime
      const dataISO = new Date(
        dataSelecionada + 'T12:00:00.000Z'
      ).toISOString();

      const response = await fetch('/api/fechamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataISO,
          observacao: observacao || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Dia encerrado com sucesso!');
        setObservacao('');
        setMostrarFormulario(false);
        buscarFechamentos();
      } else {
        const error = await response.json();
        toast.error(
          `Erro: ${error.error || 'Não foi possível encerrar o dia'}`
        );
      }
    } catch (error) {
      console.error('Erro ao encerrar dia:', error);
      toast.error('Erro ao encerrar o dia!');
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatarDataHora = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Fechamento Diário
                </h1>
              </div>

              {/* Seletor de Data */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={() =>
                    setDataSelecionada(new Date().toISOString().split('T')[0])
                  }
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Hoje
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* RESUMO DO DIA */}
        {resumo && (
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-2xl p-8 mb-8 text-white">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Resumo do Dia - {formatarData(dataSelecionada)}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total de Lavagens */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-purple-100 mb-2">
                  Total de Lavagens
                </p>
                <p className="text-4xl font-bold">{resumo.totalLavagens}</p>
              </div>

              {/* Receita Total */}
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-400/30">
                <p className="text-sm text-green-100 mb-2">Receita Total</p>
                <p className="text-4xl font-bold">
                  R$ {resumo.receitaTotal.toFixed(2)}
                </p>
              </div>

              {/* Despesa Total */}
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-orange-400/30">
                <p className="text-sm text-orange-100 mb-2">Despesa Total</p>
                <p className="text-4xl font-bold">
                  R$ {resumo.despesaTotal.toFixed(2)}
                </p>
              </div>

              {/* LUCRO */}
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-400/50">
                <p className="text-sm text-yellow-100 mb-2 font-semibold">
                  LUCRO DO DIA
                </p>
                <p
                  className={`text-4xl font-bold ${resumo.lucro >= 0 ? 'text-yellow-300' : 'text-red-300'}`}
                >
                  R$ {resumo.lucro.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Detalhes de Receita por Forma de Pagamento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-purple-200 mb-1">Dinheiro</p>
                <p className="text-2xl font-bold">
                  R$ {resumo.receitaDinheiro.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-purple-200 mb-1">PIX</p>
                <p className="text-2xl font-bold">
                  R$ {resumo.receitaPix.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-purple-200 mb-1">Cartão</p>
                <p className="text-2xl font-bold">
                  R$ {resumo.receitaCartao.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Despesas por Tipo */}
            {resumo.despesaPorTipo && resumo.despesaPorTipo.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-purple-100 mb-3">
                  Despesas por Tipo:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {resumo.despesaPorTipo.map((despesa) => (
                    <div
                      key={despesa.tipo}
                      className="bg-white/5 rounded-lg p-3"
                    >
                      <p className="text-xs text-purple-200 mb-1">
                        {despesa.tipo}
                      </p>
                      <p className="text-lg font-semibold">
                        R$ {despesa.valor.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Encerrar Dia */}
            {!mostrarFormulario ? (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="w-full bg-white text-purple-700 hover:bg-purple-50 font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Save className="h-6 w-6" />
                Encerrar Dia
              </button>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações do Fechamento (opcional)
                </h3>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex: Dia de movimento fraco devido à chuva..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-white/30 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-purple-300 focus:border-purple-300 mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleEncerrarDia}
                    disabled={carregando}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {carregando ? 'Salvando...' : 'Confirmar Fechamento'}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarFormulario(false);
                      setObservacao('');
                    }}
                    disabled={carregando}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTÓRICO DE FECHAMENTOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-purple-600" />
            Histórico de Fechamentos ({fechamentos.length})
          </h2>

          {fechamentos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                Nenhum fechamento registrado
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Encerre o dia atual para criar o primeiro fechamento
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fechamentos.map((fechamento) => (
                <div
                  key={fechamento.id}
                  className="bg-gradient-to-r from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatarData(fechamento.data)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Fechado em: {formatarDataHora(fechamento.criado_em)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-gray-600 mb-1">Lavagens</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {fechamento.total_lavagens}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-600 mb-1">Receita</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {fechamento.receita_total.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-orange-100">
                      <p className="text-xs text-gray-600 mb-1">Despesa</p>
                      <p className="text-2xl font-bold text-orange-600">
                        R$ {fechamento.despesa_total.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border-2 border-yellow-200">
                      <p className="text-xs text-gray-600 mb-1 font-semibold">
                        LUCRO
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          fechamento.lucro_liquido >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        R$ {fechamento.lucro_liquido.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {fechamento.observacao && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-purple-700">
                          Observação:
                        </span>{' '}
                        {fechamento.observacao}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
