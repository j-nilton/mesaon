import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateProductUseCase } from '../../../usecase/UpdateProductUseCase'
import { createMockAuthService, createMockProductService } from '../../mocks'
import { createMockUser, createMockProduct } from '../../mocks/factories'

describe('Unit: UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let productService: ReturnType<typeof createMockProductService>

  beforeEach(() => {
    authService = createMockAuthService()
    productService = createMockProductService()
    useCase = new UpdateProductUseCase(productService, authService)
  })

  it('should update product with valid data', async () => {
    const mockUser = createMockUser()
    const mockProduct = createMockProduct()
    const changes = { name: 'Updated Pizza', price: 55.99 }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.update).mockResolvedValue(mockProduct)

    const result = await useCase.execute('prod-123', changes)

    expect(result).toEqual(mockProduct)
    expect(productService.update).toHaveBeenCalled()
  })

  it('should throw error when user is not authenticated', async () => {
    const changes = { name: 'Updated Pizza' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('should throw error when user has no organization', async () => {
    const mockUser = createMockUser({ organizationId: undefined })
    const changes = { name: 'Updated Pizza' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Operação não autorizada.'
    )
  })

  it('should throw error when price is zero', async () => {
    const mockUser = createMockUser()
    const changes = { price: 0 }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Preço inválido.'
    )
  })

  it('should throw error when price is negative', async () => {
    const mockUser = createMockUser()
    const changes = { price: -10 }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Preço inválido.'
    )
  })

  it('should throw error when product name is empty', async () => {
    const mockUser = createMockUser()
    const changes = { name: '   ' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Nome do produto é obrigatório.'
    )
  })

  it('should allow updating price to positive value', async () => {
    const mockUser = createMockUser()
    const mockProduct = createMockProduct()
    const changes = { price: 49.99 }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.update).mockResolvedValue(mockProduct)

    const result = await useCase.execute('prod-123', changes)

    expect(result).toEqual(mockProduct)
  })
})
