import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateProductUseCase } from '../../../usecase/UpdateProductUseCase'
import { createMockAuthService, createMockProductService } from '../../mocks'
import { createMockUser, createMockProduct } from '../../mocks/factories'

describe('Unitário: UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let productService: ReturnType<typeof createMockProductService>

  beforeEach(() => {
    authService = createMockAuthService()
    productService = createMockProductService()
    useCase = new UpdateProductUseCase(productService, authService)
  })

  it('deve atualizar produto com dados válidos', async () => {
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

  it('deve lançar erro quando usuário não está autenticado', async () => {
    const changes = { name: 'Updated Pizza' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('deve lançar erro quando usuário não tem organização', async () => {
    const mockUser = createMockUser({ organizationId: undefined })
    const changes = { name: 'Updated Pizza' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Operação não autorizada.'
    )
  })

  it('deve lançar erro quando preço é zero', async () => {
    const mockUser = createMockUser()
    const changes = { price: 0 }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Preço inválido.'
    )
  })

  it('deve lançar erro quando preço é negativo', async () => {
    const mockUser = createMockUser()
    const changes = { price: -10 }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Preço inválido.'
    )
  })

  it('deve lançar erro quando nome do produto está vazio', async () => {
    const mockUser = createMockUser()
    const changes = { name: '   ' }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123', changes)).rejects.toThrow(
      'Nome do produto é obrigatório.'
    )
  })

  it('deve permitir atualização de preço para valor positivo', async () => {
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
