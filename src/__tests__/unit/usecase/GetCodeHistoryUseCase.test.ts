import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetCodeHistoryUseCase } from '../../../usecase/GetCodeHistoryUseCase'
import { createMockAuthService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unitário: GetCodeHistoryUseCase', () => {
  let useCase: GetCodeHistoryUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new GetCodeHistoryUseCase(authService)
  })

  it('deve retornar histórico de códigos para usuário autenticado', async () => {
    const mockUser = createMockUser()
    const history = [
      { code: '123456789', at: Date.now() - 10000 },
      { code: '987654321', at: Date.now() },
    ]

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getCodeHistory).mockResolvedValue(history)

    const result = await useCase.execute()

    expect(result).toEqual(history)
    expect(authService.getCodeHistory).toHaveBeenCalledWith(mockUser.id)
  })

  it('deve retornar array vazio quando usuário não estiver autenticado', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    const result = await useCase.execute()

    expect(result).toEqual([])
    expect(authService.getCodeHistory).not.toHaveBeenCalled()
  })

  it('deve retornar array vazio quando histórico estiver vazio', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getCodeHistory).mockResolvedValue([])

    const result = await useCase.execute()

    expect(result).toEqual([])
  })
})
