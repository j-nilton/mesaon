import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListProductsByCodeUseCase } from '../../../usecase/ListProductsByCodeUseCase'
import { createMockProductService } from '../../mocks'
import { createMockProduct } from '../../mocks/factories'

describe('Unitário: ListProductsByCodeUseCase', () => {
  let useCase: ListProductsByCodeUseCase
  let productService: ReturnType<typeof createMockProductService>

  beforeEach(() => {
    productService = createMockProductService()
    useCase = new ListProductsByCodeUseCase(productService)
  })

  it('deve listar produtos por código de acesso', async () => {
    const mockProducts = [
      createMockProduct({ name: 'Pizza' }),
      createMockProduct({ name: 'Pasta' }),
    ]

    vi.mocked(productService.listByAccessCode).mockResolvedValue(mockProducts)

    const result = await useCase.execute('123456789')

    expect(result).toEqual(mockProducts)
    expect(productService.listByAccessCode).toHaveBeenCalledWith('123456789', undefined, undefined)
  })

  it('deve listar produtos com filtro de consulta', async () => {
    const mockProducts = [createMockProduct({ name: 'Pizza Margherita' })]

    vi.mocked(productService.listByAccessCode).mockResolvedValue(mockProducts)

    const result = await useCase.execute('123456789', 'Pizza')

    expect(result).toEqual(mockProducts)
    expect(productService.listByAccessCode).toHaveBeenCalledWith('123456789', 'Pizza', undefined)
  })

  it('deve listar produtos com filtro de categoria', async () => {
    const mockProducts = [createMockProduct({ category: 'Pizzas' })]

    vi.mocked(productService.listByAccessCode).mockResolvedValue(mockProducts)

    const result = await useCase.execute('123456789', undefined, 'Pizzas')

    expect(result).toEqual(mockProducts)
    expect(productService.listByAccessCode).toHaveBeenCalledWith('123456789', undefined, 'Pizzas')
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

  it('deve retornar array vazio quando nenhum produto for encontrado', async () => {
    vi.mocked(productService.listByAccessCode).mockResolvedValue([])

    const result = await useCase.execute('123456789')

    expect(result).toEqual([])
  })
})
