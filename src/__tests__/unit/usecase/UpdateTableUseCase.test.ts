import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateTableUseCase } from '../../../usecase/UpdateTableUseCase'
import { createMockAuthService, createMockTableService } from '../../mocks'
import { createMockUser, createMockTable, createMockTableOrder } from '../../mocks/factories'

describe('Unitário: UpdateTableUseCase', () => {
  let useCase: UpdateTableUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    useCase = new UpdateTableUseCase(tableService, authService)
  })

  it('deve atualizar mesa com dados válidos', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { name: 'Mesa 1 Atualizada' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
    expect(tableService.update).toHaveBeenCalled()
  })

  it('deve lançar erro quando usuário não está autenticado', async () => {
    const changes = { name: 'Mesa 1' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('deve lançar erro quando nome da mesa está vazio', async () => {
    const mockUser = createMockUser()
    const changes = { name: '   ' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Nome da mesa é obrigatório.'
    )
  })

  it('deve validar pedidos ao atualizar', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { orders: [createMockTableOrder()] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
  })

  it('deve lançar erro quando pedido possui nome inválido', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ name: '' })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('deve lançar erro quando pedido possui preço inválido', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ price: NaN })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('deve lançar erro quando quantidade do pedido é zero', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ quantity: 0 })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('deve lançar erro quando quantidade do pedido é negativa', async () => {
    const mockUser = createMockUser()
    const changes = { orders: [createMockTableOrder({ quantity: -1 })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(useCase.execute('table-123', changes)).rejects.toThrow(
      'Pedidos inválidos.'
    )
  })

  it('deve aceitar pedido com preço zero', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { orders: [createMockTableOrder({ price: 0 })] }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
  })

  it('deve permitir atualização sem pedidos', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const changes = { name: 'Mesa Atualizada' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(mockTable)

    const result = await useCase.execute('table-123', changes)

    expect(result).toEqual(mockTable)
  })
})
