import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoginUseCase } from '../../../usecase/LoginUseCase'
import { createMockAuthService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unitário: LoginUseCase', () => {
  let useCase: LoginUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new LoginUseCase(authService)
  })

  it('deve realizar login com credenciais válidas', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.login).mockResolvedValue(mockUser)

    const result = await useCase.execute('test@example.com', 'password123')

    expect(result).toEqual(mockUser)
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('deve lançar erro quando e-mail está vazio', async () => {
    await expect(useCase.execute('', 'password123')).rejects.toThrow(
      'E-mail e senha são obrigatórios.'
    )
  })

  it('deve lançar erro quando senha está vazia', async () => {
    await expect(useCase.execute('test@example.com', '')).rejects.toThrow(
      'E-mail e senha são obrigatórios.'
    )
  })

  it('deve lançar erro quando e-mail e senha estão vazios', async () => {
    await expect(useCase.execute('', '')).rejects.toThrow(
      'E-mail e senha são obrigatórios.'
    )
  })

  it('deve evitar chamada ao serviço quando validação falhar', async () => {
    await expect(useCase.execute('', 'password')).rejects.toThrow()

    expect(authService.login).not.toHaveBeenCalled()
  })
})
