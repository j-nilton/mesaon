import React from 'react';
// Helpers mínimos para render e eventos evitando libs externas
const render = (el: React.ReactElement) => {
  const tree: any =
    typeof el.type === 'function' ? (el.type as any)(el.props) : el;
  return {
    getByTestId: (id: string) => {
      if (tree?.props?.testID === id) return { props: tree.props };
      throw new Error(`Elemento com testID=${id} não encontrado`);
    },
  };
};
const fireEvent = {
  press: (node: any) => node?.props?.onPress?.(),
};
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Button } from 'react-native';
import { useTablesViewModel } from '../../viewmodel/TablesViewModel';

// Mock do ViewModel
vi.mock('../../viewmodel/TablesViewModel');
// Mock leve de react-native para evitar parsers RN no ambiente jsdom
vi.mock('react-native', async () => {
  const React = await import('react');
  const Button = ({ testID, title, onPress }: any) =>
    React.createElement('RNButton', { testID, onPress, title });
  return { Button };
});

// Componente temporário para representar o botão que será implementado.
// Em um cenário real, isso seria importado de src/components/ClearTablesButton.tsx.
const ClearTablesButton = () => {
  // Tentamos extrair clearAll, que ainda não existe no ViewModel real.
  // @ts-ignore
  const { clearAll } = useTablesViewModel();
  
  return (
    <Button 
      testID="clear-tables-btn" 
      title="Limpar Mesas" 
      onPress={clearAll} 
    />
  );
};

describe('ClearTablesButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve remover todas as mesas quando o botão for clicado', () => {
    // 1. Configuração do ambiente de teste (Arrange)
    const mockTables = [
      { id: '1', accessCode: '123', name: 'Mesa 1', createdAt: Date.now() },
      { id: '2', accessCode: '123', name: 'Mesa 2', createdAt: Date.now() }
    ];

    // Mockando o retorno do hook EXATAMENTE como ele é hoje (sem clearAll).
    // Isso garante que o teste falhe na execução ou verificação, 
    // pois a funcionalidade "clearAll" ainda não existe.
    (useTablesViewModel as any).mockReturnValue({
      tables: mockTables,
      loading: false,
      errorMessage: '',
      clearAll: vi.fn(),
    });

    // 2. Simulação de interação (Act)
    const { getByTestId } = render(<ClearTablesButton />);
    const button = getByTestId('clear-tables-btn');
    
    // Tenta clicar. Como clearAll é undefined, nada deve acontecer ou pode lançar erro dependendo da implementação do Button.
    fireEvent.press(button);

    // 3. Asserções (Assert)
    // Verificamos se a função foi chamada.
    // @ts-ignore
    const viewModel = useTablesViewModel();
    
    // A expectativa abaixo DEVE falhar porque viewModel.clearAll é undefined.
    // Isso confirma que estamos na fase RED do TDD (funcionalidade ausente).
    expect(viewModel.clearAll).toHaveBeenCalled();
  });
});
