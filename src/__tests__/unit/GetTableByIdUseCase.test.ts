import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetTableByIdUseCase } from '../../usecase/GetTableByIdUseCase'
import { createMockAuthService, createMockTableService } from '../mocks'
import { createMockUser, createMockTable } from '../mocks/factories'

describe('Unit: GetTableByIdUseCase', () => {
  let useCase: GetTableByIdUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    useCase = new GetTableByIdUseCase(tableService, authService)
  })

  it('should return table when user is authenticated', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.getById).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123')

    expect(result).toEqual(mockTable)
    expect(tableService.getById).toHaveBeenCalledWith('table-123')
  })

  it('should return null when table does not exist', async () => {
    const mockUser = createMockUser()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.getById).mockResolvedValue(null)

    const result = await useCase.execute('nonexistent-id')

    expect(result).toBeNull()
  })

  it('should throw error when user is not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('table-123')).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('should pass correct table id to service', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.getById).mockResolvedValue(mockTable)

    await useCase.execute('table-999')

    expect(tableService.getById).toHaveBeenCalledWith('table-999')
  })
})
