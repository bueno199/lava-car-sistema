import { useState, useEffect } from 'react';
import { Car, Calendar, Trash2, Plus, Search } from 'lucide-react';
import { useToast } from './hooks/useToast';

interface Lavagem {
  id: number;
  tipo_lavagem: string;
  placa: string | null;
  nome_cliente: string | null;
  telefone: string | null;
  valor: number;
  forma_pagamento: string;
  data: string;
  observacao: string | null;
  cliente: {
    id: number;
    nome: string;
  } | null;
}

interface Resumo {
  data: string;
  lavagens: number;
  receita: number;
  formasPagamento: {
    formaPagamento: string;
    total: number;
    count: number;
  }[];
  tiposLavagem: {
    tipo: string;
    count: number;
    total: number;
  }[];
}

export function LavagemView() {
  const toast = useToast();

  // Estado de filtros
  const [filtroAtivo, setFiltroAtivo] = useState<'dia' | 'periodo'>('dia');
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [filtroPlaca, setFiltroPlaca] = useState<string>('');

  // Dados
  const [lavagens, setLavagens] = useState<Lavagem[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);

  // Formulário de adição rápida
  const [tipoLavagem, setTipoLavagem] = useState('');
  const [placa, setPlaca] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<
    'dinheiro' | 'pix' | 'cartao'
  >('dinheiro');
  const [observacao, setObservacao] = useState('');

  // Buscar lavagens
  const buscarLavagens = async () => {
    try {
      let url = '/api/lavagens?';

      if (filtroAtivo === 'dia') {
        url += `data=${dataSelecionada}`;
      } else if (filtroAtivo === 'periodo' && dataInicio && dataFim) {
        url += `dataInicio=${dataInicio}&dataFim=${dataFim}`;
      }

      if (filtroPlaca) {
        url += `&placa=${filtroPlaca}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setLavagens(data);
    } catch (error) {
      console.error('Erro ao buscar lavagens:', error);
    }
  };

  // Buscar resumo
  const buscarResumo = async () => {
    try {
      const url =
        filtroAtivo === 'dia'
          ? `/api/lavagens/resumo?data=${dataSelecionada}`
          : `/api/lavagens/resumo`;

      const response = await fetch(url);
      const data = await response.json();
      setResumo(data);
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  // Carregar dados quando muda filtro
  useEffect(() => {
    buscarLavagens();
    buscarResumo();
  }, [filtroAtivo, dataSelecionada, dataInicio, dataFim, filtroPlaca]);

  // Adicionar lavagem
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoLavagem || !valor) {
      toast.warning('Preencha o tipo de lavagem e o valor!');
      return;
    }

    try {
      const response = await fetch('/api/lavagens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipoLavagem,
          placa: placa || null,
          nomeCliente: nomeCliente || null,
          telefone: telefone || null,
          valor: parseFloat(valor),
          formaPagamento,
          observacao: observacao || null,
        }),
      });

      if (response.ok) {
        // Limpar formulário
        setTipoLavagem('');
        setPlaca('');
        setNomeCliente('');
        setTelefone('');
        setValor('');
        setObservacao('');

        // Recarregar dados
        buscarLavagens();
        buscarResumo();

        toast.success('Lavagem registrada com sucesso!');
      } else {
        const error = await response.json();
        toast.error(`Erro: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Erro ao registrar lavagem:', error);
      toast.error('Erro ao registrar lavagem!');
    }
  };

  // Deletar lavagem
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta lavagem?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lavagens/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        buscarLavagens();
        buscarResumo();
        toast.success('Lavagem deletada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao deletar lavagem:', error);
      toast.error('Erro ao deletar lavagem!');
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatarDataCompleta = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Título */}
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Lava Car - Controle Diário
              </h1>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Tipo de Filtro */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltroAtivo('dia')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filtroAtivo === 'dia'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Dia
                </button>
                <button
                  onClick={() => setFiltroAtivo('periodo')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filtroAtivo === 'periodo'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Período
                </button>
              </div>

              {/* Filtro de Data */}
              {filtroAtivo === 'dia' ? (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <input
                    type="date"
                    value={dataSelecionada}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() =>
                      setDataSelecionada(new Date().toISOString().split('T')[0])
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Hoje
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      De:
                    </label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Até:
                    </label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Filtro por Placa */}
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={filtroPlaca}
                  onChange={(e) => setFiltroPlaca(e.target.value.toUpperCase())}
                  placeholder="Buscar por placa..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {filtroPlaca && (
                  <button
                    onClick={() => setFiltroPlaca('')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* RESUMO */}
        {resumo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Resumo{' '}
              {filtroAtivo === 'dia'
                ? `- ${formatarDataCompleta(dataSelecionada)}`
                : 'do Período'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Lavagens</p>
                <p className="text-3xl font-bold text-blue-600">
                  {resumo.lavagens}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {resumo.receita.toFixed(2)}
                </p>
              </div>

              {resumo.formasPagamento.map((fp) => (
                <div
                  key={fp.formaPagamento}
                  className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                >
                  <p className="text-sm text-gray-600 mb-1">
                    {fp.formaPagamento.toUpperCase()}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {fp.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{fp.count} lavagens</p>
                </div>
              ))}
            </div>

            {resumo.tiposLavagem.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Tipos de Lavagem:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resumo.tiposLavagem.map((tl) => (
                    <div
                      key={tl.tipo}
                      className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium text-purple-900">
                        {tl.tipo}
                      </span>
                      <span className="text-sm text-purple-600 ml-2">
                        {tl.count}x - R$ {tl.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FORMULÁRIO */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Adicionar Lavagem Rápida
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Lavagem */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Lavagem *
                </label>
                <input
                  type="text"
                  value={tipoLavagem}
                  onChange={(e) => setTipoLavagem(e.target.value)}
                  placeholder="Ex: Lavagem Completa, Polimento"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Placa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Placa (opcional)
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Nome do Cliente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Cliente (opcional)
                </label>
                <input
                  type="text"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="João Silva"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="dinheiro">💵 Dinheiro</option>
                  <option value="pix">📱 PIX</option>
                  <option value="cartao">💳 Cartão</option>
                </select>
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observação (opcional)
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Observações adicionais..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              ✓ Registrar Lavagem
            </button>
          </form>
        </div>

        {/* LISTA DE LAVAGENS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Lavagens ({lavagens.length})
          </h2>

          {lavagens.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                Nenhuma lavagem encontrada
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Ajuste os filtros ou adicione uma nova lavagem
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lavagens.map((lavagem) => (
                <div
                  key={lavagem.id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border-2 border-gray-200 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {lavagem.tipo_lavagem}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatarDataCompleta(lavagem.data)}{' '}
                        {formatarData(lavagem.data)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {lavagem.placa && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                          🚗 {lavagem.placa}
                        </span>
                      )}

                      {lavagem.nome_cliente && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                          👤 {lavagem.nome_cliente}
                        </span>
                      )}

                      {lavagem.telefone && (
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                          📞 {lavagem.telefone}
                        </span>
                      )}

                      {lavagem.cliente && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                          👤 {lavagem.cliente.nome}
                        </span>
                      )}

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                        💰 R$ {lavagem.valor.toFixed(2)}
                      </span>

                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">
                        {lavagem.forma_pagamento === 'dinheiro' &&
                          '💵 Dinheiro'}
                        {lavagem.forma_pagamento === 'pix' && '📱 PIX'}
                        {lavagem.forma_pagamento === 'cartao' && '💳 Cartão'}
                      </span>
                    </div>

                    {lavagem.observacao && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        📝 {lavagem.observacao}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(lavagem.id)}
                    className="ml-4 p-3 hover:bg-red-100 rounded-lg transition-colors group"
                    title="Deletar lavagem"
                  >
                    <Trash2 className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
