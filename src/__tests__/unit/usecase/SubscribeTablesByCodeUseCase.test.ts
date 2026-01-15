import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SubscribeTablesByCodeUseCase } from '../../../usecase/SubscribeTablesByCodeUseCase'
import { createMockTableService } from '../../mocks'
import { createMockTable } from '../../mocks/factories'

describe('Unit: SubscribeTablesByCodeUseCase', () => {
  let useCase: SubscribeTablesByCodeUseCase
  let tableService: ReturnType<typeof createMockTableService>

  beforeEach(() => {
    tableService = createMockTableService()
    useCase = new SubscribeTablesByCodeUseCase(tableService)
  })

  it('should subscribe to tables by access code', () => {
    const mockUnsubscribe = vi.fn()
    const mockOnChange = vi.fn()

    vi.mocked(tableService.subscribeByAccessCode).mockReturnValue(mockUnsubscribe)

    const result = useCase.execute('123456789', mockOnChange)

    expect(result).toBe(mockUnsubscribe)
    expect(tableService.subscribeByAccessCode).toHaveBeenCalledWith('123456789', mockOnChange)
  })

  it('should throw error with invalid access code format', () => {
    const mockOnChange = vi.fn()

    expect(() => useCase.execute('12345', mockOnChange)).toThrow(
      'Código de acesso inválido.'
    )
  })

  it('should throw error when access code is empty', () => {
    const mockOnChange = vi.fn()

    expect(() => useCase.execute('', mockOnChange)).toThrow(
      'Código de acesso inválido.'
    )
  })

  it('should return unsubscribe function', () => {
    const mockUnsubscribe = vi.fn()
    const mockOnChange = vi.fn()

    vi.mocked(tableService.subscribeByAccessCode).mockReturnValue(mockUnsubscribe)

    const result = useCase.execute('123456789', mockOnChange)

    expect(typeof result).toBe('function')
    result()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should not call service for invalid access code', () => {
    const mockOnChange = vi.fn()

    expect(() => useCase.execute('abc', mockOnChange)).toThrow()

    expect(tableService.subscribeByAccessCode).not.toHaveBeenCalled()
  })
})
