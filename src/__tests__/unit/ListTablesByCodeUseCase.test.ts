import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListTablesByCodeUseCase } from '../../usecase/ListTablesByCodeUseCase'
import { createMockTableService } from '../mocks'
import { createMockTable } from '../mocks/factories'

describe('Unit: ListTablesByCodeUseCase', () => {
  let useCase: ListTablesByCodeUseCase
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    tableService = createMockTableService()
    useCase = new ListTablesByCodeUseCase(tableService)
  })

  it('should list tables by access code', async () => {
    const mockTables = [
      createMockTable({ name: 'Mesa 1' }),
      createMockTable({ name: 'Mesa 2' }),
    ]

    vi.mocked(tableService.listByAccessCode).mockResolvedValue(mockTables)

    const result = await useCase.execute('123456789')

    expect(result).toEqual(mockTables)
    expect(tableService.listByAccessCode).toHaveBeenCalledWith('123456789')
  })

  it('should throw error with invalid access code format', async () => {
    await expect(useCase.execute('12345')).rejects.toThrow(
      'Código de acesso inválido.'
    )
  })

  it('should throw error when access code is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(
      'Código de acesso inválido.'
    )
  })

  it('should return empty array when no tables found', async () => {
    vi.mocked(tableService.listByAccessCode).mockResolvedValue([])

    const result = await useCase.execute('123456789')

    expect(result).toEqual([])
  })

  it('should not call service for invalid access code', async () => {
    await expect(useCase.execute('abc')).rejects.toThrow()

    expect(tableService.listByAccessCode).not.toHaveBeenCalled()
  })
})
