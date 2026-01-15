import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateTableUseCase } from '../../../usecase/CreateTableUseCase'
import { createMockAuthService, createMockTableService } from '../../mocks'
import { createMockUser, createMockTable } from '../../mocks/factories'

describe('Unit: CreateTableUseCase', () => {
  let useCase: CreateTableUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    useCase = new CreateTableUseCase(tableService, authService)
  })

  it('should create a table with valid data', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const input = { name: 'Mesa 1', waiterName: 'João' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.create).mockResolvedValue(mockTable)

    const result = await useCase.execute('123456789', input)

    expect(result).toEqual(mockTable)
    expect(tableService.create).toHaveBeenCalled()
  })

  it('should throw error with invalid access code format', async () => {
    const input = { name: 'Mesa 1' }

    await expect(useCase.execute('12345', input)).rejects.toThrow(
      'Código de acesso inválido.'
    )
  })

  it('should throw error when table name is empty', async () => {
    const input = { name: '   ' }

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Nome da mesa é obrigatório.'
    )
  })

  it('should throw error when user is not authenticated', async () => {
    const input = { name: 'Mesa 1' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('should trim table name before creating', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable({ name: 'Mesa 1' })
    const input = { name: '  Mesa 1  ' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.create).mockResolvedValue(mockTable)

    await useCase.execute('123456789', input)

    expect(tableService.create).toHaveBeenCalledWith(
      '123456789',
      expect.objectContaining({
        name: 'Mesa 1',
      })
    )
  })

  it('should trim optional fields', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const input = { 
      name: 'Mesa 1',
      waiterName: '  João  ',
      notes: '  observações  '
    }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.create).mockResolvedValue(mockTable)

    await useCase.execute('123456789', input)

    expect(tableService.create).toHaveBeenCalledWith(
      '123456789',
      expect.objectContaining({
        waiterName: 'João',
        notes: 'observações',
      })
    )
  })

  it('should handle empty optional fields as undefined', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const input = { 
      name: 'Mesa 1',
      waiterName: '   ',
      notes: undefined
    }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.create).mockResolvedValue(mockTable)

    await useCase.execute('123456789', input)

    const call = vi.mocked(tableService.create).mock.calls[0]
    expect(call[1].waiterName).toBeUndefined()
    expect(call[1].notes).toBeUndefined()
  })
})
