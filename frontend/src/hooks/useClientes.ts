import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';

// Interface Cliente
export interface Cliente {
  id: number;
  nome: string;
  placa: string;
  telefone?: string | null;
  created_at: string;
  updated_at: string;
  lavagens?: Lavagem[];
}

// Interface Lavagem (resumida para histórico)
interface Lavagem {
  id: number;
  data: string;
  valor: number;
  forma_pagamento: string;
  observacao?: string | null;
}

// Estatísticas do cliente
export interface ClienteEstatisticas {
  totalGasto: number;
  totalLavagens: number;
  ultimaLavagem: string | null;
  mediaPorLavagem: number;
  frequencia: 'alta' | 'media' | 'baixa' | 'nova';
}

// Dados do formulário
export interface ClienteFormData {
  nome: string;
  placa: string;
  telefone?: string;
}

/**
 * Hook customizado para gerenciar clientes
 * Integra com a API /api/clientes
 */
export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  /**
   * Buscar todos os clientes
   */
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const url = searchTerm
        ? `/api/clientes?search=${encodeURIComponent(searchTerm)}`
        : '/api/clientes';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar clientes');

      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  /**
   * Buscar cliente por ID
   */
  const fetchClienteById = useCallback(
    async (id: number): Promise<Cliente | null> => {
      try {
        const response = await fetch(`/api/clientes/${id}`);
        if (!response.ok) throw new Error('Cliente não encontrado');

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        toast.error('Erro ao carregar dados do cliente');
        return null;
      }
    },
    [toast]
  );

  /**
   * Criar novo cliente
   */
  const createCliente = useCallback(
    async (clienteData: ClienteFormData): Promise<boolean> => {
      try {
        const response = await fetch('/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clienteData),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Erro ao criar cliente');
          return false;
        }

        toast.success('Cliente criado com sucesso!');
        await fetchClientes();
        return true;
      } catch (error) {
        console.error('Erro ao criar cliente:', error);
        toast.error('Erro ao criar cliente');
        return false;
      }
    },
    [fetchClientes, toast]
  );

  /**
   * Atualizar cliente existente
   */
  const updateCliente = useCallback(
    async (
      id: number,
      clienteData: Partial<ClienteFormData>
    ): Promise<boolean> => {
      try {
        const response = await fetch(`/api/clientes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clienteData),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Erro ao atualizar cliente');
          return false;
        }

        toast.success('Cliente atualizado com sucesso!');
        await fetchClientes();
        return true;
      } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast.error('Erro ao atualizar cliente');
        return false;
      }
    },
    [fetchClientes, toast]
  );

  /**
   * Deletar cliente
   */
  const deleteCliente = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const response = await fetch(`/api/clientes/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          toast.error('Erro ao deletar cliente');
          return false;
        }

        toast.success('Cliente deletado com sucesso!');
        await fetchClientes();
        return true;
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        toast.error('Erro ao deletar cliente');
        return false;
      }
    },
    [fetchClientes, toast]
  );

  /**
   * Calcular estatísticas do cliente
   */
  const calcularEstatisticas = useCallback(
    (cliente: Cliente): ClienteEstatisticas => {
      const lavagens = cliente.lavagens || [];
      const totalLavagens = lavagens.length;
      const totalGasto = lavagens.reduce((sum, lav) => sum + lav.valor, 0);
      const mediaPorLavagem =
        totalLavagens > 0 ? totalGasto / totalLavagens : 0;

      // Última lavagem
      const ultimaLavagem = lavagens.length > 0 ? lavagens[0].data : null;

      // Calcular frequência baseado no número de lavagens
      let frequencia: 'alta' | 'media' | 'baixa' | 'nova' = 'nova';
      if (totalLavagens >= 10) {
        frequencia = 'alta';
      } else if (totalLavagens >= 5) {
        frequencia = 'media';
      } else if (totalLavagens > 0) {
        frequencia = 'baixa';
      }

      return {
        totalGasto,
        totalLavagens,
        ultimaLavagem,
        mediaPorLavagem,
        frequencia,
      };
    },
    []
  );

  /**
   * Buscar cliente por placa (para integração com lavagens)
   */
  const buscarClientePorPlaca = useCallback(
    async (placa: string): Promise<Cliente | null> => {
      try {
        const response = await fetch(
          `/api/clientes?search=${encodeURIComponent(placa)}`
        );
        if (!response.ok) throw new Error('Erro ao buscar cliente');

        const data = await response.json();
        // Retornar primeiro cliente que corresponde exatamente à placa
        const clienteEncontrado = data.find(
          (c: Cliente) =>
            c.placa.toLowerCase() === placa.toLowerCase().replace('-', '')
        );
        return clienteEncontrado || null;
      } catch (error) {
        console.error('Erro ao buscar cliente por placa:', error);
        return null;
      }
    },
    []
  );

  // Carregar clientes ao montar componente ou quando searchTerm muda
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    clientes,
    loading,
    searchTerm,
    setSearchTerm,
    fetchClientes,
    fetchClienteById,
    createCliente,
    updateCliente,
    deleteCliente,
    calcularEstatisticas,
    buscarClientePorPlaca,
  };
}
