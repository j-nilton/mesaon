import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteProductUseCase } from '../../../usecase/DeleteProductUseCase'
import { createMockAuthService, createMockProductService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unitário: DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let productService: ReturnType<typeof createMockProductService>

  beforeEach(() => {
    authService = createMockAuthService()
    productService = createMockProductService()
    useCase = new DeleteProductUseCase(productService, authService)
  })

  it('deve excluir produto quando usuário estiver autenticado com organização', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.delete).mockResolvedValue(undefined)

    await useCase.execute('prod-123')

    expect(productService.delete).toHaveBeenCalledWith('prod-123')
  })

  it('deve lançar erro quando usuário não está autenticado', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('prod-123')).rejects.toThrow('Usuário não autenticado.')
  })

  it('deve lançar erro quando usuário não tiver organização', async () => {
    const mockUser = createMockUser({ organizationId: undefined })
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123')).rejects.toThrow('Operação não autorizada.')
  })

  it('deve chamar getUserProfile para verificar autorização', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.delete).mockResolvedValue(undefined)

    await useCase.execute('prod-123')

    expect(authService.getUserProfile).toHaveBeenCalledWith(mockUser.id)
  })
})
