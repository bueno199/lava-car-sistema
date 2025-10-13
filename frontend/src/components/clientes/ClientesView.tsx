import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Car,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  useClientes,
  Cliente,
  ClienteFormData,
  ClienteEstatisticas,
} from '../../hooks/useClientes';

/**
 * Componente principal de gestão de clientes
 * Exibe lista de clientes com busca, CRUD completo e estatísticas
 */
export default function ClientesView() {
  const {
    clientes,
    loading,
    searchTerm,
    setSearchTerm,
    createCliente,
    updateCliente,
    deleteCliente,
    calcularEstatisticas,
  } = useClientes();

  // Estado do modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Estado do modal de detalhes/histórico
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsCliente, setDetailsCliente] = useState<Cliente | null>(null);

  // Dados do formulário
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    placa: '',
    telefone: '',
  });

  // Abrir modal para criar cliente
  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ nome: '', placa: '', telefone: '' });
    setSelectedCliente(null);
    setShowModal(true);
  };

  // Abrir modal para editar cliente
  const handleOpenEdit = (cliente: Cliente) => {
    setModalMode('edit');
    setFormData({
      nome: cliente.nome,
      placa: cliente.placa,
      telefone: cliente.telefone || '',
    });
    setSelectedCliente(cliente);
    setShowModal(true);
  };

  // Abrir modal de detalhes
  const handleOpenDetails = (cliente: Cliente) => {
    setDetailsCliente(cliente);
    setShowDetailsModal(true);
  };

  // Fechar modais
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCliente(null);
    setFormData({ nome: '', placa: '', telefone: '' });
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setDetailsCliente(null);
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;
    if (modalMode === 'create') {
      success = await createCliente(formData);
    } else if (selectedCliente) {
      success = await updateCliente(selectedCliente.id, formData);
    }

    if (success) {
      handleCloseModal();
    }
  };

  // Deletar cliente com confirmação
  const handleDelete = async (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar o cliente "${nome}"?`)) {
      await deleteCliente(id);
    }
  };

  // Obter inicial do nome
  const getInitial = (nome: string) => {
    return nome.charAt(0).toUpperCase();
  };

  // Obter cor do badge de frequência
  const getFrequenciaBadge = (
    frequencia: ClienteEstatisticas['frequencia']
  ) => {
    const badges = {
      alta: {
        color: 'bg-green-100 text-green-700 border-green-300',
        label: 'Cliente Frequente',
      },
      media: {
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        label: 'Cliente Regular',
      },
      baixa: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        label: 'Cliente Ocasional',
      },
      nova: {
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        label: 'Cliente Novo',
      },
    };
    return badges[frequencia];
  };

  // Formatar data
  const formatarData = (dataISO: string) => {
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
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Título */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Gestão de Clientes
                </h1>
              </div>
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Novo Cliente</span>
              </button>
            </div>

            {/* Busca */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou placa..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ESTATÍSTICAS GERAIS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
              <p className="text-3xl font-bold text-blue-600">
                {clientes.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Clientes Frequentes</p>
              <p className="text-3xl font-bold text-green-600">
                {
                  clientes.filter(
                    (c) => calcularEstatisticas(c).frequencia === 'alta'
                  ).length
                }
              </p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">Clientes Regulares</p>
              <p className="text-3xl font-bold text-yellow-600">
                {
                  clientes.filter(
                    (c) => calcularEstatisticas(c).frequencia === 'media'
                  ).length
                }
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Clientes Novos</p>
              <p className="text-3xl font-bold text-gray-600">
                {
                  clientes.filter(
                    (c) => calcularEstatisticas(c).frequencia === 'nova'
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        {/* LISTA DE CLIENTES */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Clientes ({clientes.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Carregando clientes...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                {searchTerm
                  ? 'Nenhum cliente encontrado'
                  : 'Nenhum cliente cadastrado'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm
                  ? 'Tente buscar com outros termos'
                  : 'Clique em "Novo Cliente" para cadastrar'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientes.map((cliente) => {
                const stats = calcularEstatisticas(cliente);
                const badge = getFrequenciaBadge(stats.frequencia);

                return (
                  <div
                    key={cliente.id}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => handleOpenDetails(cliente)}
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar com inicial */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {getInitial(cliente.nome)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {cliente.nome}
                          </h3>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-700">
                          {cliente.placa}
                        </span>
                      </div>
                      {cliente.telefone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {cliente.telefone}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Lavagens</p>
                        <p className="text-lg font-bold text-blue-600">
                          {stats.totalLavagens}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Total Gasto</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {stats.totalGasto.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {stats.ultimaLavagem && (
                      <div className="text-xs text-gray-500 mb-4">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Última lavagem: {formatarData(stats.ultimaLavagem)}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(cliente);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cliente.id, cliente.nome);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Deletar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE FORMULÁRIO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Header do Modal */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="João Silva"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={3}
                />
              </div>

              {/* Placa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Placa do Veículo *
                </label>
                <input
                  type="text"
                  value={formData.placa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placa: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABC-1234 ou ABC1D23"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  required
                  pattern="[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}|[A-Za-z]{3}-?\d{4}"
                  title="Formato: ABC-1234, ABC1234 ou ABC1D23"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: ABC-1234, ABC1234 ou ABC1D23
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {modalMode === 'create' ? 'Cadastrar' : 'Atualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {showDetailsModal && detailsCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {getInitial(detailsCliente.nome)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {detailsCliente.nome}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Cliente desde {formatarData(detailsCliente.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailsModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-gray-900 mb-3">Informações</h3>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-gray-500" />
                  <span className="font-semibold text-gray-700">
                    {detailsCliente.placa}
                  </span>
                </div>
                {detailsCliente.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-600">
                      {detailsCliente.telefone}
                    </span>
                  </div>
                )}
              </div>

              {/* Estatísticas */}
              {(() => {
                const stats = calcularEstatisticas(detailsCliente);
                const badge = getFrequenciaBadge(stats.frequencia);
                return (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">
                      Estatísticas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Total de Lavagens
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.totalLavagens}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Total Gasto
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {stats.totalGasto.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Média por Lavagem
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          R$ {stats.mediaPorLavagem.toFixed(2)}
                        </p>
                      </div>
                      <div className={`rounded-xl p-4 border-2 ${badge.color}`}>
                        <p className="text-sm mb-1">Frequência</p>
                        <p className="text-lg font-bold">{badge.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Histórico de Lavagens */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">
                  Histórico de Lavagens (últimas 5)
                </h3>
                {detailsCliente.lavagens &&
                detailsCliente.lavagens.length > 0 ? (
                  <div className="space-y-2">
                    {detailsCliente.lavagens.map((lavagem) => (
                      <div
                        key={lavagem.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            {formatarData(lavagem.data)}
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            R$ {lavagem.valor.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-700">
                            {lavagem.forma_pagamento === 'dinheiro' &&
                              'Dinheiro'}
                            {lavagem.forma_pagamento === 'pix' && 'PIX'}
                            {lavagem.forma_pagamento === 'cartao' && 'Cartão'}
                          </span>
                          {lavagem.observacao && (
                            <span className="text-xs text-gray-500 italic">
                              {lavagem.observacao}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Nenhuma lavagem registrada ainda
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
