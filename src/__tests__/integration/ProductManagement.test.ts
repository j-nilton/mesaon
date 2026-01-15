import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateProductUseCase } from '../../usecase/CreateProductUseCase'
import { UpdateProductUseCase } from '../../usecase/UpdateProductUseCase'
import { DeleteProductUseCase } from '../../usecase/DeleteProductUseCase'
import { ListProductsByCodeUseCase } from '../../usecase/ListProductsByCodeUseCase'
import { createMockAuthService, createMockProductService } from '../mocks'
import { createMockUser, createMockProduct } from '../mocks/factories'

describe('Integração: Gerenciamento de Produtos', () => {
  let authService: ReturnType<typeof createMockAuthService>
  let productService: ReturnType<typeof createMockProductService>
  let createProductUseCase: CreateProductUseCase
  let updateProductUseCase: UpdateProductUseCase
  let deleteProductUseCase: DeleteProductUseCase
  let listProductsByCodeUseCase: ListProductsByCodeUseCase

  beforeEach(() => {
    authService = createMockAuthService()
    productService = createMockProductService()
    createProductUseCase = new CreateProductUseCase(productService, authService)
    updateProductUseCase = new UpdateProductUseCase(productService, authService)
    deleteProductUseCase = new DeleteProductUseCase(productService, authService)
    listProductsByCodeUseCase = new ListProductsByCodeUseCase(productService)
  })

  it('deve criar, listar, atualizar e excluir um produto', async () => {
    const mockUser = createMockUser()
    let mockProduct = createMockProduct()

    // Create Product
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.create).mockResolvedValue(mockProduct)

    const created = await createProductUseCase.execute('123456789', {
      name: 'Pizza',
      price: 45.99,
      category: 'Pizzas',
    })
    expect(created.name).toBe('Pizza Margherita')

    // List Products
    const products = [mockProduct]
    vi.mocked(productService.listByAccessCode).mockResolvedValue(products)

    const listed = await listProductsByCodeUseCase.execute('123456789')
    expect(listed).toHaveLength(1)

    // Update Product
    const updatedProduct = { ...mockProduct, name: 'Pizza Premium' }
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.update).mockResolvedValue(updatedProduct)

    const updated = await updateProductUseCase.execute('prod-123', { name: 'Pizza Premium' })
    expect(updated.name).toBe('Pizza Premium')

    // Delete Product
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.delete).mockResolvedValue(undefined)

    await deleteProductUseCase.execute('prod-123')
    expect(productService.delete).toHaveBeenCalledWith('prod-123')
  })

  it('deve exigir autorização nas operações de produto', async () => {
    const unauthorizedUser = createMockUser({ organizationId: '999999999' })

    // Try to create with unauthorized user (organizationId doesn't match code)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(unauthorizedUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(unauthorizedUser)

    await expect(
      createProductUseCase.execute('123456789', {
        name: 'Pizza',
        price: 45.99,
        category: 'Pizzas',
      })
    ).rejects.toThrow('Operação não autorizada.')

    // Try to delete with unauthorized user (no organization)
    const noOrgUser = createMockUser({ organizationId: undefined })
    vi.mocked(authService.getCurrentUser).mockResolvedValue(noOrgUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(noOrgUser)

    await expect(deleteProductUseCase.execute('prod-123')).rejects.toThrow(
      'Operação não autorizada.'
    )
  })

  it('deve validar dados do produto nas operações', async () => {
    const mockUser = createMockUser()

    // Create with invalid price
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(
      createProductUseCase.execute('123456789', {
        name: 'Pizza',
        price: 0,
        category: 'Pizzas',
      })
    ).rejects.toThrow('Preço inválido.')

    // Update with invalid price
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(updateProductUseCase.execute('prod-123', { price: -10 })).rejects.toThrow(
      'Preço inválido.'
    )
  })
})
