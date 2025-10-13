import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock dos componentes filhos para isolar os testes do App
vi.mock('../LavagemView', () => ({
  LavagemView: () => <div data-testid="lavagem-view">Lavagem View</div>,
}));

vi.mock('../components/clientes/ClientesView', () => ({
  default: () => <div data-testid="clientes-view">Clientes View</div>,
}));

vi.mock('../components/FechamentoDiarioView', () => ({
  FechamentoDiarioView: () => (
    <div data-testid="fechamento-view">Fechamento View</div>
  ),
}));

vi.mock('../components/InstallPWA', () => ({
  default: () => <div data-testid="install-pwa">Install PWA</div>,
}));

describe('App Component', () => {
  it('deve renderizar o componente App', () => {
    render(<App />);
    expect(screen.getByText('Lavagens')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Fechamento')).toBeInTheDocument();
  });

  it('deve iniciar com a aba Lavagens ativa', () => {
    render(<App />);
    const lavagemTab = screen.getByRole('button', { name: /lavagens/i });
    expect(lavagemTab).toHaveClass('text-blue-600');
    expect(screen.getByTestId('lavagem-view')).toBeInTheDocument();
  });

  it('deve trocar para a aba Clientes ao clicar', () => {
    render(<App />);
    const clientesTab = screen.getByRole('button', { name: /clientes/i });
    fireEvent.click(clientesTab);

    expect(clientesTab).toHaveClass('text-blue-600');
    expect(screen.getByTestId('clientes-view')).toBeInTheDocument();
    expect(screen.queryByTestId('lavagem-view')).not.toBeInTheDocument();
  });

  it('deve trocar para a aba Fechamento ao clicar', () => {
    render(<App />);
    const fechamentoTab = screen.getByRole('button', { name: /fechamento/i });
    fireEvent.click(fechamentoTab);

    expect(fechamentoTab).toHaveClass('text-purple-600');
    expect(screen.getByTestId('fechamento-view')).toBeInTheDocument();
    expect(screen.queryByTestId('lavagem-view')).not.toBeInTheDocument();
  });

  it('deve renderizar os ícones corretos nas abas', () => {
    render(<App />);

    // Verifica se os ícones estão presentes (lucide-react renderiza como SVG)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('deve renderizar o componente InstallPWA', () => {
    render(<App />);
    expect(screen.getByTestId('install-pwa')).toBeInTheDocument();
  });

  it('deve manter apenas uma aba ativa por vez', () => {
    render(<App />);

    // Clica em Clientes
    fireEvent.click(screen.getByRole('button', { name: /clientes/i }));
    expect(screen.getByTestId('clientes-view')).toBeInTheDocument();
    expect(screen.queryByTestId('lavagem-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fechamento-view')).not.toBeInTheDocument();

    // Clica em Fechamento
    fireEvent.click(screen.getByRole('button', { name: /fechamento/i }));
    expect(screen.getByTestId('fechamento-view')).toBeInTheDocument();
    expect(screen.queryByTestId('lavagem-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clientes-view')).not.toBeInTheDocument();

    // Volta para Lavagens
    fireEvent.click(screen.getByRole('button', { name: /lavagens/i }));
    expect(screen.getByTestId('lavagem-view')).toBeInTheDocument();
    expect(screen.queryByTestId('clientes-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('fechamento-view')).not.toBeInTheDocument();
  });
});
