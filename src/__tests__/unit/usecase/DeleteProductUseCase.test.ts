import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteProductUseCase } from '../../../usecase/DeleteProductUseCase'
import { createMockAuthService, createMockProductService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unit: DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase
  let authService: ReturnType<typeof createMockAuthService>
  let productService: ReturnType<typeof createMockProductService>

  beforeEach(() => {
    authService = createMockAuthService()
    productService = createMockProductService()
    useCase = new DeleteProductUseCase(productService, authService)
  })

  it('should delete product when user is authenticated with organization', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.delete).mockResolvedValue(undefined)

    await useCase.execute('prod-123')

    expect(productService.delete).toHaveBeenCalledWith('prod-123')
  })

  it('should throw error when user is not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('prod-123')).rejects.toThrow('Usuário não autenticado.')
  })

  it('should throw error when user has no organization', async () => {
    const mockUser = createMockUser({ organizationId: undefined })
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)

    await expect(useCase.execute('prod-123')).rejects.toThrow('Operação não autorizada.')
  })

  it('should call getUserProfile to check authorization', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockUser)
    vi.mocked(productService.delete).mockResolvedValue(undefined)

    await useCase.execute('prod-123')

    expect(authService.getUserProfile).toHaveBeenCalledWith(mockUser.id)
  })
})
