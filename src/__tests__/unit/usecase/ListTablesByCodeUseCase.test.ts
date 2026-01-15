import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListTablesByCodeUseCase } from '../../../usecase/ListTablesByCodeUseCase'
import { createMockTableService } from '../../mocks'
import { createMockTable } from '../../mocks/factories'

describe('Unitário: ListTablesByCodeUseCase', () => {
  let useCase: ListTablesByCodeUseCase
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    tableService = createMockTableService()
    useCase = new ListTablesByCodeUseCase(tableService)
  })

  it('deve listar mesas por código de acesso', async () => {
    const mockTables = [
      createMockTable({ name: 'Mesa 1' }),
      createMockTable({ name: 'Mesa 2' }),
    ]

    vi.mocked(tableService.listByAccessCode).mockResolvedValue(mockTables)

    const result = await useCase.execute('123456789')

    expect(result).toEqual(mockTables)
    expect(tableService.listByAccessCode).toHaveBeenCalledWith('123456789')
  })

  it('deve lançar erro com formato inválido de código de acesso', async () => {
    await expect(useCase.execute('12345')).rejects.toThrow(
      'Código de acesso inválido.'
    )
  })

  it('deve lançar erro quando código de acesso está vazio', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'Código de acesso inválido.'
    )
  })

  it('deve retornar array vazio quando nenhuma mesa for encontrada', async () => {
    vi.mocked(tableService.listByAccessCode).mockResolvedValue([])

    const result = await useCase.execute('123456789')

    expect(result).toEqual([])
  })

  it('deve não chamar serviço para código de acesso inválido', async () => {
    await expect(useCase.execute('abc')).rejects.toThrow()

    expect(tableService.listByAccessCode).not.toHaveBeenCalled()
  })
})
