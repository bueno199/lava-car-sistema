import toast from 'react-hot-toast';

/**
 * Hook customizado para exibir notificações toast
 * Wrapper sobre react-hot-toast com funções simplificadas
 */
export function useToast() {
  return {
    /**
     * Exibe toast de sucesso
     */
    success: (message: string) => {
      toast.success(message);
    },

    /**
     * Exibe toast de erro
     */
    error: (message: string) => {
      toast.error(message);
    },

    /**
     * Exibe toast informativo
     */
    info: (message: string) => {
      toast(message, {
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      });
    },

    /**
     * Exibe toast de aviso/warning
     */
    warning: (message: string) => {
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
    },

    /**
     * Exibe toast de loading com promise
     * Automaticamente muda para success ou error
     */
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      });
    },

    /**
     * Exibe toast de loading manualmente
     * Retorna ID para atualizar depois
     */
    loading: (message: string) => {
      return toast.loading(message);
    },

    /**
     * Atualiza um toast existente
     */
    update: (toastId: string, type: 'success' | 'error', message: string) => {
      if (type === 'success') {
        toast.success(message, { id: toastId });
      } else {
        toast.error(message, { id: toastId });
      }
    },

    /**
     * Remove um toast específico
     */
    dismiss: (toastId?: string) => {
      toast.dismiss(toastId);
    },

    /**
     * Remove todos os toasts
     */
    dismissAll: () => {
      toast.dismiss();
    },
  };
}
