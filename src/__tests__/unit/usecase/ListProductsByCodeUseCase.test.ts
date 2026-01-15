import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListProductsByCodeUseCase } from '../../../usecase/ListProductsByCodeUseCase'
import { createMockProductService } from '../../mocks'
import { createMockProduct } from '../../mocks/factories'

describe('Unit: ListProductsByCodeUseCase', () => {
  let useCase: ListProductsByCodeUseCase
  let productService: ReturnType<typeof createMockProductService>

  beforeEach(() => {
    productService = createMockProductService()
    useCase = new ListProductsByCodeUseCase(productService)
  })

  it('should list products by access code', async () => {
    const mockProducts = [
      createMockProduct({ name: 'Pizza' }),
      createMockProduct({ name: 'Pasta' }),
    ]

    vi.mocked(productService.listByAccessCode).mockResolvedValue(mockProducts)

    const result = await useCase.execute('123456789')

    expect(result).toEqual(mockProducts)
    expect(productService.listByAccessCode).toHaveBeenCalledWith('123456789', undefined, undefined)
  })

  it('should list products with query filter', async () => {
    const mockProducts = [createMockProduct({ name: 'Pizza Margherita' })]

    vi.mocked(productService.listByAccessCode).mockResolvedValue(mockProducts)

    const result = await useCase.execute('123456789', 'Pizza')

    expect(result).toEqual(mockProducts)
    expect(productService.listByAccessCode).toHaveBeenCalledWith('123456789', 'Pizza', undefined)
  })

  it('should list products with category filter', async () => {
    const mockProducts = [createMockProduct({ category: 'Pizzas' })]

    vi.mocked(productService.listByAccessCode).mockResolvedValue(mockProducts)

    const result = await useCase.execute('123456789', undefined, 'Pizzas')

    expect(result).toEqual(mockProducts)
    expect(productService.listByAccessCode).toHaveBeenCalledWith('123456789', undefined, 'Pizzas')
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

  it('should return empty array when no products found', async () => {
    vi.mocked(productService.listByAccessCode).mockResolvedValue([])

    const result = await useCase.execute('123456789')

    expect(result).toEqual([])
  })
})
