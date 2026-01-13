import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SetUserRoleUseCase } from '../../usecase/SetUserRoleUseCase'
import { createMockAuthService } from '../mocks'
import { createMockUser } from '../mocks/factories'

describe('Unit: SetUserRoleUseCase', () => {
  let useCase: SetUserRoleUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new SetUserRoleUseCase(authService)
  })

  it('should set user role to organization', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.setUserRole).mockResolvedValue(undefined)

    await useCase.execute('organization')

    expect(authService.setUserRole).toHaveBeenCalledWith(mockUser.id, 'organization')
  })

  it('should set user role to collaborator', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.setUserRole).mockResolvedValue(undefined)

    await useCase.execute('collaborator')

    expect(authService.setUserRole).toHaveBeenCalledWith(mockUser.id, 'collaborator')
  })

  it('should throw error when user is not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('organization')).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('should not call setUserRole when user is not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('organization')).rejects.toThrow()

    expect(authService.setUserRole).not.toHaveBeenCalled()
  })
})
