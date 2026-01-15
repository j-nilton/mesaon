import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RegisterUseCase } from '../../../usecase/RegisterUseCase'
import { createMockAuthService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unitário: RegisterUseCase', () => {
  let useCase: RegisterUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new RegisterUseCase(authService)
  })

  it('deve registrar usuário com dados válidos', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.register).mockResolvedValue(mockUser)
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    const result = await useCase.execute('John Doe', 'john@example.com', 'password123')

    expect(result).toEqual(mockUser)
    expect(authService.register).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123')
    expect(authService.sendVerificationEmail).toHaveBeenCalled()
  })

  it('deve lançar erro quando nome está vazio', async () => {
    await expect(useCase.execute('', 'john@example.com', 'password123')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )
  })

  it('deve lançar erro quando e-mail está vazio', async () => {
    await expect(useCase.execute('John Doe', '', 'password123')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )
  })

  it('deve lançar erro quando senha está vazia', async () => {
    await expect(useCase.execute('John Doe', 'john@example.com', '')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )
  })

  it('deve lançar erro quando senha tem menos de 6 caracteres', async () => {
    await expect(useCase.execute('John Doe', 'john@example.com', '12345')).rejects.toThrow(
      'A senha deve ter no mínimo 6 caracteres.'
    )
  })

  it('deve aceitar senha com exatamente 6 caracteres', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.register).mockResolvedValue(mockUser)
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    const result = await useCase.execute('John Doe', 'john@example.com', '123456')

    expect(result).toEqual(mockUser)
  })

  it('deve enviar e-mail de verificação após registro', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.register).mockResolvedValue(mockUser)
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    await useCase.execute('John Doe', 'john@example.com', 'password123')

    expect(authService.sendVerificationEmail).toHaveBeenCalled()
  })

  it('deve evitar chamada ao register quando validação falhar', async () => {
    await expect(useCase.execute('', 'john@example.com', 'password123')).rejects.toThrow()

    expect(authService.register).not.toHaveBeenCalled()
  })
})
