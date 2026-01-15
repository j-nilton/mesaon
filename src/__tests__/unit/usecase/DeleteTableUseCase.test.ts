import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteTableUseCase } from '../../../usecase/DeleteTableUseCase'
import { createMockAuthService, createMockTableService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unitário: DeleteTableUseCase', () => {
  let useCase: DeleteTableUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    useCase = new DeleteTableUseCase(tableService, authService)
  })

  it('deve excluir mesa quando usuário estiver autenticado', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.delete).mockResolvedValue(undefined)

    await useCase.execute('table-123')

    expect(tableService.delete).toHaveBeenCalledWith('table-123')
  })

  it('deve lançar erro quando usuário não está autenticado', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('table-123')).rejects.toThrow('Usuário não autenticado.')
  })

  it('deve repassar id correto da mesa ao serviço', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.delete).mockResolvedValue(undefined)

    await useCase.execute('table-999')

    expect(tableService.delete).toHaveBeenCalledWith('table-999')
  })
})
