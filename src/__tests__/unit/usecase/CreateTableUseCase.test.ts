import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateTableUseCase } from '../../../usecase/CreateTableUseCase'
import { createMockAuthService, createMockTableService } from '../../mocks'
import { createMockUser, createMockTable } from '../../mocks/factories'

describe('Unitário: CreateTableUseCase', () => {
  let useCase: CreateTableUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    authService = createMockAuthService()
    tableService = createMockTableService()
    useCase = new CreateTableUseCase(tableService, authService)
  })

  it('deve criar mesa com dados válidos', async () => {
    const mockUser = createMockUser()
    const mockTable = createMockTable()
    const input = { name: 'Mesa 1', waiterName: 'João' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(tableService.create).mockResolvedValue(mockTable)

    const result = await useCase.execute('123456789', input)

    expect(result).toEqual(mockTable)
    expect(tableService.create).toHaveBeenCalled()
  })

  it('deve lançar erro com formato inválido de código de acesso', async () => {
    const input = { name: 'Mesa 1' }

    await expect(useCase.execute('12345', input)).rejects.toThrow(
      'Código de acesso inválido.'
    )
  })

  it('deve lançar erro quando nome da mesa está vazio', async () => {
    const input = { name: '   ' }

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Nome da mesa é obrigatório.'
    )
  })

  it('deve lançar erro quando usuário não está autenticado', async () => {
    const input = { name: 'Mesa 1' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('deve aparar nome da mesa antes de criar', async () => {
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

  it('deve aparar campos opcionais', async () => {
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

  it('deve tratar campos opcionais vazios como undefined', async () => {
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
