import { useState, useEffect } from 'react';
import {
  Wallet,
  Calendar,
  Trash2,
  Plus,
  Search,
  Edit,
  X,
  Check,
} from 'lucide-react';

interface Despesa {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  observacao: string | null;
}

interface ResumoDespesas {
  hoje: number;
  mes: number;
  porTipo: {
    tipo: string;
    total: number;
    count: number;
  }[];
}

function DespesasView() {
  // Estado de filtros
  const [filtroAtivo, setFiltroAtivo] = useState<'dia' | 'periodo' | 'mes'>(
    'dia'
  );
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  // Dados
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [resumo, setResumo] = useState<ResumoDespesas | null>(null);

  // Formulário de adição
  const [tipo, setTipo] = useState<string>('funcionario');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacao, setObservacao] = useState('');

  // Edição
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editTipo, setEditTipo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editData, setEditData] = useState('');
  const [editObservacao, setEditObservacao] = useState('');

  // Tipos de despesa
  const tiposDespesa = [
    { value: 'funcionario', label: '💼 Funcionário', emoji: '💼' },
    { value: 'produto', label: '📦 Produto', emoji: '📦' },
    { value: 'marmita', label: '🍱 Marmita', emoji: '🍱' },
    { value: 'aluguel', label: '🏢 Aluguel', emoji: '🏢' },
    { value: 'conta', label: '📄 Conta', emoji: '📄' },
    { value: 'outro', label: '💰 Outro', emoji: '💰' },
  ];

  // Buscar despesas
  const buscarDespesas = async () => {
    try {
      let url = '/api/despesas?';

      if (filtroAtivo === 'dia') {
        url += `data=${dataSelecionada}`;
      } else if (filtroAtivo === 'periodo' && dataInicio && dataFim) {
        url += `dataInicio=${dataInicio}&dataFim=${dataFim}`;
      } else if (filtroAtivo === 'mes') {
        // Buscar mês atual
        const hoje = new Date();
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        url += `dataInicio=${primeiroDia.toISOString().split('T')[0]}&dataFim=${ultimoDia.toISOString().split('T')[0]}`;
      }

      if (filtroTipo) {
        url += `&tipo=${filtroTipo}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    }
  };

  // Buscar resumo
  const buscarResumo = async () => {
    try {
      const response = await fetch('/api/despesas/resumo');
      const data = await response.json();
      setResumo(data);
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
    }
  };

  // Carregar dados quando muda filtro
  useEffect(() => {
    buscarDespesas();
    buscarResumo();
  }, [filtroAtivo, dataSelecionada, dataInicio, dataFim, filtroTipo]);

  // Adicionar despesa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipo || !descricao || !valor) {
      alert('Preencha tipo, descrição e valor!');
      return;
    }

    try {
      const response = await fetch('/api/despesas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo,
          descricao,
          valor: parseFloat(valor),
          data,
          observacao: observacao || null,
        }),
      });

      if (response.ok) {
        // Limpar formulário
        setTipo('funcionario');
        setDescricao('');
        setValor('');
        setData(new Date().toISOString().split('T')[0]);
        setObservacao('');

        // Recarregar dados
        buscarDespesas();
        buscarResumo();

        alert('Despesa registrada com sucesso!');
      } else {
        const error = await response.json();
        alert(`Erro: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      alert('Erro ao registrar despesa!');
    }
  };

  // Iniciar edição
  const iniciarEdicao = (despesa: Despesa) => {
    setEditandoId(despesa.id);
    setEditTipo(despesa.tipo);
    setEditDescricao(despesa.descricao);
    setEditValor(despesa.valor.toString());
    setEditData(despesa.data.split('T')[0]);
    setEditObservacao(despesa.observacao || '');
  };

  // Cancelar edição
  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditTipo('');
    setEditDescricao('');
    setEditValor('');
    setEditData('');
    setEditObservacao('');
  };

  // Salvar edição
  const salvarEdicao = async (id: number) => {
    try {
      const response = await fetch(`/api/despesas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: editTipo,
          descricao: editDescricao,
          valor: parseFloat(editValor),
          data: editData,
          observacao: editObservacao || null,
        }),
      });

      if (response.ok) {
        cancelarEdicao();
        buscarDespesas();
        buscarResumo();
        alert('Despesa atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      alert('Erro ao atualizar despesa!');
    }
  };

  // Deletar despesa
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta despesa?')) {
      return;
    }

    try {
      const response = await fetch(`/api/despesas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        buscarDespesas();
        buscarResumo();
        alert('Despesa deletada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      alert('Erro ao deletar despesa!');
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

  const getEmojiTipo = (tipo: string) => {
    const tipoObj = tiposDespesa.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.emoji : '💰';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Título */}
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gestão de Despesas
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
                  onClick={() => setFiltroAtivo('mes')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filtroAtivo === 'mes'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mês
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
              ) : filtroAtivo === 'periodo' ? (
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
              ) : null}

              {/* Filtro por Tipo */}
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-5 w-5 text-gray-500" />
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os tipos</option>
                  {tiposDespesa.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {filtroTipo && (
                  <button
                    onClick={() => setFiltroTipo('')}
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
              Resumo de Despesas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-1">Despesas Hoje</p>
                <p className="text-3xl font-bold text-red-600">
                  R$ {resumo.hoje.toFixed(2)}
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Despesas do Mês</p>
                <p className="text-3xl font-bold text-orange-600">
                  R$ {resumo.mes.toFixed(2)}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Total de Registros</p>
                <p className="text-3xl font-bold text-purple-600">
                  {resumo.porTipo.reduce((acc, t) => acc + t.count, 0)}
                </p>
              </div>
            </div>

            {resumo.porTipo.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Despesas por Tipo:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {resumo.porTipo.map((tp) => (
                    <div
                      key={tp.tipo}
                      className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium text-blue-900">
                        {getEmojiTipo(tp.tipo)}{' '}
                        {tp.tipo.charAt(0).toUpperCase() + tp.tipo.slice(1)}
                      </span>
                      <div className="text-sm text-blue-600">
                        {tp.count}x - R$ {tp.total.toFixed(2)}
                      </div>
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
            Registrar Nova Despesa
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Despesa *
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {tiposDespesa.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Salário funcionário João"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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

              {/* Data */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
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
              Registrar Despesa
            </button>
          </form>
        </div>

        {/* LISTA DE DESPESAS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Despesas ({despesas.length})
          </h2>

          {despesas.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                Nenhuma despesa encontrada
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Ajuste os filtros ou adicione uma nova despesa
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {despesas.map((despesa) => (
                <div
                  key={despesa.id}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border-2 border-gray-200 transition-colors"
                >
                  {editandoId === despesa.id ? (
                    // MODO EDIÇÃO
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={editTipo}
                          onChange={(e) => setEditTipo(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {tiposDespesa.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={editDescricao}
                          onChange={(e) => setEditDescricao(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                          type="number"
                          value={editValor}
                          onChange={(e) => setEditValor(e.target.value)}
                          step="0.01"
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                          type="date"
                          value={editData}
                          onChange={(e) => setEditData(e.target.value)}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <textarea
                        value={editObservacao}
                        onChange={(e) => setEditObservacao(e.target.value)}
                        placeholder="Observação..."
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => salvarEdicao(despesa.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Salvar
                        </button>
                        <button
                          onClick={cancelarEdicao}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // MODO VISUALIZAÇÃO
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {despesa.descricao}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {formatarDataHora(despesa.data)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                            {getEmojiTipo(despesa.tipo)}{' '}
                            {despesa.tipo.charAt(0).toUpperCase() +
                              despesa.tipo.slice(1)}
                          </span>

                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                            - R$ {despesa.valor.toFixed(2)}
                          </span>
                        </div>

                        {despesa.observacao && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {despesa.observacao}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => iniciarEdicao(despesa)}
                          className="p-3 hover:bg-blue-100 rounded-lg transition-colors group"
                          title="Editar despesa"
                        >
                          <Edit className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDelete(despesa.id)}
                          className="p-3 hover:bg-red-100 rounded-lg transition-colors group"
                          title="Deletar despesa"
                        >
                          <Trash2 className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
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

export default DespesasView;
