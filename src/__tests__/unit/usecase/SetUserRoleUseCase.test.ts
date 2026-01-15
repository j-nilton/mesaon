import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SetUserRoleUseCase } from '../../../usecase/SetUserRoleUseCase'
import { createMockAuthService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unitário: SetUserRoleUseCase', () => {
  let useCase: SetUserRoleUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new SetUserRoleUseCase(authService)
  })

  it('deve definir papel do usuário como organization', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.setUserRole).mockResolvedValue(undefined)

    await useCase.execute('organization')

    expect(authService.setUserRole).toHaveBeenCalledWith(mockUser.id, 'organization')
  })

  it('deve definir papel do usuário como collaborator', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.setUserRole).mockResolvedValue(undefined)

    await useCase.execute('collaborator')

    expect(authService.setUserRole).toHaveBeenCalledWith(mockUser.id, 'collaborator')
  })

  it('deve lançar erro quando usuário não está autenticado', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('organization')).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })

  it('deve não chamar setUserRole quando usuário não está autenticado', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    await expect(useCase.execute('organization')).rejects.toThrow()

    expect(authService.setUserRole).not.toHaveBeenCalled()
  })
})
