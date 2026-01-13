import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateTableUseCase } from '../../usecase/UpdateTableUseCase'
import { createMockAuthService, createMockTableService } from '../mocks'
import { createMockUser, createMockTable, createMockTableOrder } from '../mocks/factories'

describe('Unit: UpdateTableUseCase', () => {
  let useCase: UpdateTableUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    useCase = new UpdateTableUseCase(tableService, authService)
  })

  it('should update table with valid data', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { name: 'Mesa 1 Atualizada' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
    expect(tableService.update).toHaveBeenCalled()
  })

  it('should throw error when user is not authenticated', async () => {
    const changes = { name: 'Mesa 1' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('should throw error when table name is empty', async () => {
    const mockUser = createMockUser()
    const changes = { name: '   ' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Nome da mesa é obrigatório.'
    )
  })

  it('should validate orders when updating', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { orders: [createMockTableOrder()] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
  })

  it('should throw error when order has invalid name', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ name: '' })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('should throw error when order has invalid price', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ price: NaN })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('should throw error when order quantity is zero', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ quantity: 0 })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('should throw error when order quantity is negative', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ quantity: -1 })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('should accept order with price zero', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { orders: [createMockTableOrder({ price: 0 })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
  })

  it('should allow updating without orders', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { name: 'Mesa Atualizada' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
  })
})
