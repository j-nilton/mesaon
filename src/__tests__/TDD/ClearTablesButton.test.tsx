import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Button } from 'react-native';
import { useTablesViewModel } from '../../viewmodel/TablesViewModel';

// Mock do ViewModel
vi.mock('../../viewmodel/TablesViewModel');

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
      // clearAll: undefined (implícito)
    });

    // 2. Simulação de interação (Act)
    const { getByTestId } = render(<ClearTablesButton />);
    const button = getByTestId('clear-tables-btn');
    
    // Tenta clicar. Como clearAll é undefined, nada deve acontecer ou pode lançar erro dependendo da implementação do Button.
    fireEvent.press(button);

    // 3. Asserções (Assert)
    // Verificamos se a função foi chamada.
    const viewModel = useTablesViewModel();
    
    // A expectativa abaixo DEVE falhar porque viewModel.clearAll é undefined.
    // Isso confirma que estamos na fase RED do TDD (funcionalidade ausente).
    // @ts-ignore
    expect(viewModel.clearAll).toHaveBeenCalled();
  });
});
