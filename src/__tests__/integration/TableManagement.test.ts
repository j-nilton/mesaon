import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateTableUseCase } from '../../usecase/CreateTableUseCase'
import { UpdateTableUseCase } from '../../usecase/UpdateTableUseCase'
import { DeleteTableUseCase } from '../../usecase/DeleteTableUseCase'
import { GetTableByIdUseCase } from '../../usecase/GetTableByIdUseCase'
import { ListTablesByCodeUseCase } from '../../usecase/ListTablesByCodeUseCase'
import { SubscribeTablesByCodeUseCase } from '../../usecase/SubscribeTablesByCodeUseCase'
import { createMockAuthService, createMockTableService } from '../mocks'
import { createMockUser, createMockTable, createMockTableOrder } from '../mocks/factories'

describe('Integration: Table Management', () => {
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>
  let createTableUseCase: CreateTableUseCase
  let updateTableUseCase: UpdateTableUseCase
  let deleteTableUseCase: DeleteTableUseCase
  let getTableByIdUseCase: GetTableByIdUseCase
  let listTablesByCodeUseCase: ListTablesByCodeUseCase
  let subscribeTablesByCodeUseCase: SubscribeTablesByCodeUseCase

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    createTableUseCase = new CreateTableUseCase(tableService, authService)
    updateTableUseCase = new UpdateTableUseCase(tableService, authService)
    deleteTableUseCase = new DeleteTableUseCase(tableService, authService)
    getTableByIdUseCase = new GetTableByIdUseCase(tableService, authService)
    listTablesByCodeUseCase = new ListTablesByCodeUseCase(tableService)
    subscribeTablesByCodeUseCase = new SubscribeTablesByCodeUseCase(tableService)
  })

  it('should create, list, get, update, and delete a table', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()

    // Create Table
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.create).mockResolvedValue(mockTable)

    const created = await createTableUseCase.execute('123456789', { name: 'Mesa 1' })
    expect(created.name).toBe('Mesa 1')

    // List Tables
    const tables = [mockTable]
    vi.mocked(tableService.listByAccessCode).mockResolvedValue(tables)

    const listed = await listTablesByCodeUseCase.execute('123456789')
    expect(listed).toHaveLength(1)

    // Get Table by ID
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.getById).mockResolvedValue(mockTable)

    const fetched = await getTableByIdUseCase.execute('table-123')
    expect(fetched?.id).toBe('table-123')

    // Update Table
    const updatedTable = { ...mockTable, name: 'Mesa 1 Atualizada' }
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.update).mockResolvedValue(updatedTable)

    const updated = await updateTableUseCase.execute('table-123', { name: 'Mesa 1 Atualizada' })
    expect(updated.name).toBe('Mesa 1 Atualizada')

    // Delete Table
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.delete).mockResolvedValue(undefined)

    await deleteTableUseCase.execute('table-123')
    expect(tableService.delete).toHaveBeenCalledWith('table-123')
  })

  it('should handle subscription to tables', async () => {
    const mockUnsubscribe = vi.fn()
    const mockOnChange = vi.fn()
    const tables = [createMockTable({ name: 'Mesa 1' })]

    vi.mocked(tableService.subscribeByAccessCode).mockReturnValue(mockUnsubscribe)

    const unsubscribe = subscribeTablesByCodeUseCase.execute('123456789', mockOnChange)

    expect(unsubscribe).toBe(mockUnsubscribe)
    expect(tableService.subscribeByAccessCode).toHaveBeenCalledWith('123456789', mockOnChange)
  })

  it('should validate table data across operations', async () => {
    const mockUser = createMockUser()

    // Create with invalid name
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(createTableUseCase.execute('123456789', { name: '   ' })).rejects.toThrow(
      'Nome da mesa é obrigatório.'
    )

    // Update with invalid name
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(updateTableUseCase.execute('table-123', { name: '' })).rejects.toThrow(
      'Nome da mesa é obrigatório.'
    )

    // Update with invalid orders
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    await expect(
      updateTableUseCase.execute('table-123', {
        orders: [createMockTableOrder({ quantity: 0 })],
      })
    ).rejects.toThrow('Pedidos inválidos.')
  })

  it('should require authentication for table operations', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    // Create requires auth
    await expect(createTableUseCase.execute('123456789', { name: 'Mesa 1' })).rejects.toThrow(
      'Usuário não autenticado.'
    )

    // Update requires auth
    await expect(updateTableUseCase.execute('table-123', { name: 'Mesa 2' })).rejects.toThrow(
      'Usuário não autenticado.'
    )

    // Delete requires auth
    await expect(deleteTableUseCase.execute('table-123')).rejects.toThrow(
      'Usuário não autenticado.'
    )

    // Get requires auth
    await expect(getTableByIdUseCase.execute('table-123')).rejects.toThrow(
      'Usuário não autenticado.'
    )

    // List does NOT require auth
    vi.mocked(tableService.listByAccessCode).mockResolvedValue([])
    const result = await listTablesByCodeUseCase.execute('123456789')
    expect(result).toEqual([])
  })

  it('should handle multiple tables with different states', async () => {
    const mockUser = createMockUser()
    const table1 = createMockTable({ id: 'table-1', name: 'Mesa 1' })
    const table2 = createMockTable({ id: 'table-2', name: 'Mesa 2' })

    vi.mocked(tableService.listByAccessCode).mockResolvedValue([table1, table2])

    const tables = await listTablesByCodeUseCase.execute('123456789')

    expect(tables).toHaveLength(2)
    expect(tables[0].name).toBe('Mesa 1')
    expect(tables[1].name).toBe('Mesa 2')
  })
})
