import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SubscribeTablesByCodeUseCase } from '../../../usecase/SubscribeTablesByCodeUseCase'
import { createMockTableService } from '../../mocks'
import { createMockTable } from '../../mocks/factories'

describe('Unitário: SubscribeTablesByCodeUseCase', () => {
  let useCase: SubscribeTablesByCodeUseCase
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    tableService = createMockTableService()
    useCase = new SubscribeTablesByCodeUseCase(tableService)
  })

  it('deve assinar mesas por código de acesso', () => {
    const mockUnsubscribe = vi.fn()
    const mockOnChange = vi.fn()

    vi.mocked(tableService.subscribeByAccessCode).mockReturnValue(mockUnsubscribe)

    const result = useCase.execute('123456789', mockOnChange)

    expect(result).toBe(mockUnsubscribe)
    expect(tableService.subscribeByAccessCode).toHaveBeenCalledWith('123456789', mockOnChange)
  })

  it('deve lançar erro com formato inválido de código de acesso', () => {
    const mockOnChange = vi.fn()

    expect(() => useCase.execute('12345', mockOnChange)).toThrow(
      'Código de acesso inválido.'
    )
  })

  it('deve lançar erro quando código de acesso está vazio', () => {
    const mockOnChange = vi.fn()

    expect(() => useCase.execute('', mockOnChange)).toThrow(
      'Código de acesso inválido.'
    )
  })

  it('deve retornar função de unsubscribe', () => {
    const mockUnsubscribe = vi.fn()
    const mockOnChange = vi.fn()

    vi.mocked(tableService.subscribeByAccessCode).mockReturnValue(mockUnsubscribe)

    const result = useCase.execute('123456789', mockOnChange)

    expect(typeof result).toBe('function')
    result()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('deve não chamar serviço para código de acesso inválido', () => {
    const mockOnChange = vi.fn()

    expect(() => useCase.execute('abc', mockOnChange)).toThrow()

    expect(tableService.subscribeByAccessCode).not.toHaveBeenCalled()
  })
})
