import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '@/usecase/LoginUseCase';
import { AuthService } from '@/model/services/AuthService';
import { User } from '@/model/entities/User';

// Mock do AuthService
const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
} as unknown as AuthService;

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    loginUseCase = new LoginUseCase(mockAuthService);
  });

  it('deve realizar login com sucesso quando credenciais forem válidas', async () => {
    // Arrange
    const mockUser: User = { id: '123', email: 'teste@mesaon.com' };
    (mockAuthService.login as any).mockResolvedValue(mockUser);

    // Act
    const result = await loginUseCase.execute('teste@mesaon.com', '123456');

    // Assert
    expect(mockAuthService.login).toHaveBeenCalledWith('teste@mesaon.com', '123456');
    expect(result).toEqual(mockUser);
  });

  it('deve lançar erro se email não for informado', async () => {
    // Act & Assert
    await expect(loginUseCase.execute('', '123456'))
      .rejects
      .toThrow('E-mail e senha são obrigatórios.');
  });
});
