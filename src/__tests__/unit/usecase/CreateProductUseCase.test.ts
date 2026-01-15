import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateProductUseCase } from '../../../usecase/CreateProductUseCase'
import { createMockAuthService, createMockProductService } from '../../mocks'
import { createMockUser, createMockProduct } from '../../mocks/factories'

describe('Unitário: CreateProductUseCase', () => {
  let useCase: CreateProductUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let productService: ReturnType<typeof createMockProductService>

  beforeEach(() => {
    authService = createMockAuthService()
    productService = createMockProductService()
    useCase = new CreateProductUseCase(productService, authService)
  })

  it('deve criar produto com dados válidos', async () => {
    const mockUser = createMockUser()
    const mockProduct = createMockProduct()
    const input = { name: 'Pizza', price: 45.99, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.create).mockResolvedValue(mockProduct)

    const result = await useCase.execute('123456789', input)

    expect(result).toEqual(mockProduct)
    expect(productService.create).toHaveBeenCalledWith('123456789', input)
  })

  it('deve lançar erro quando usuário não está autenticado', async () => {
    const input = { name: 'Pizza', price: 45.99, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('deve lançar erro quando organização do usuário não corresponde ao código', async () => {
    const mockUser = createMockUser({ organizationId: '999999999' })
    const input = { name: 'Pizza', price: 45.99, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Operação não autorizada.'
    )
  })

  it('deve lançar erro com formato inválido de código de acesso', async () => {
    const mockUser = createMockUser({ organizationId: '12345' })
    const input = { name: 'Pizza', price: 45.99, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('12345', input)).rejects.toThrow(
      'Código de acesso inválido.'
    )
  })

  it('deve lançar erro quando nome do produto está vazio', async () => {
    const mockUser = createMockUser()
    const input = { name: '   ', price: 45.99, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Nome do produto é obrigatório.'
    )
  })

  it('deve lançar erro quando preço é zero', async () => {
    const mockUser = createMockUser()
    const input = { name: 'Pizza', price: 0, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Preço inválido.'
    )
  })

  it('deve lançar erro quando preço é negativo', async () => {
    const mockUser = createMockUser()
    const input = { name: 'Pizza', price: -10, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Preço inválido.'
    )
  })

  it('deve lançar erro quando preço é NaN', async () => {
    const mockUser = createMockUser()
    const input = { name: 'Pizza', price: NaN, category: 'Pizzas' as const }

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('123456789', input)).rejects.toThrow(
      'Preço inválido.'
    )
  })
})
