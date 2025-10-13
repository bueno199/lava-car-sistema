import { describe, it, expect } from 'vitest';

// Testes de exemplo para funções utilitárias
describe('Utils - Formatação de Valores', () => {
  it('deve formatar valor monetário corretamente', () => {
    const formatarMoeda = (valor: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    };

    // Usar toContain para evitar problemas com espaços non-breaking
    expect(formatarMoeda(100)).toContain('100,00');
    expect(formatarMoeda(1234.56)).toContain('1.234,56');
    expect(formatarMoeda(0)).toContain('0,00');
  });

  it('deve formatar data corretamente', () => {
    const formatarData = (data: Date): string => {
      return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(data);
    };

    const data = new Date('2025-01-15T12:00:00Z');
    expect(formatarData(data)).toMatch(/15\/01\/2025/);
  });
});

describe('Utils - Validações', () => {
  it('deve validar valor mínimo positivo', () => {
    const validarValorPositivo = (valor: number): boolean => {
      return valor > 0;
    };

    expect(validarValorPositivo(100)).toBe(true);
    expect(validarValorPositivo(0)).toBe(false);
    expect(validarValorPositivo(-10)).toBe(false);
  });

  it('deve validar string não vazia', () => {
    const validarStringNaoVazia = (texto: string): boolean => {
      return texto.trim().length > 0;
    };

    expect(validarStringNaoVazia('teste')).toBe(true);
    expect(validarStringNaoVazia('')).toBe(false);
    expect(validarStringNaoVazia('   ')).toBe(false);
  });
});
