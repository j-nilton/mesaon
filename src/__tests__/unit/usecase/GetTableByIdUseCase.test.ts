import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetTableByIdUseCase } from '../../../usecase/GetTableByIdUseCase'
import { createMockAuthService, createMockTableService } from '../../mocks'
import { createMockUser, createMockTable } from '../../mocks/factories'

describe('Unitário: GetTableByIdUseCase', () => {
  let useCase: GetTableByIdUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    useCase = new GetTableByIdUseCase(tableService, authService)
  })

  it('deve retornar mesa quando usuário estiver autenticado', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.getById).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123')

    expect(result).toEqual(mockTable)
    expect(tableService.getById).toHaveBeenCalledWith('table-123')
  })

  it('deve retornar null quando mesa não existir', async () => {
    const mockUser = createMockUser()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.getById).mockResolvedValue(null)

    const result = await useCase.execute('nonexistent-id')

    expect(result).toBeNull()
  })

  it('deve lançar erro quando usuário não está autenticado', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('table-123')).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('deve repassar id correto da mesa ao serviço', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.getById).mockResolvedValue(mockTable)

    await useCase.execute('table-999')

    expect(tableService.getById).toHaveBeenCalledWith('table-999')
  })
})
