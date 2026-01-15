import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoginUseCase } from '../../usecase/LoginUseCase'
import { SetUserRoleUseCase } from '../../usecase/SetUserRoleUseCase'
import { GetCurrentUserProfileUseCase } from '../../usecase/GetCurrentUserProfileUseCase'
import { createMockAuthService } from '../mocks'
import { createMockUser } from '../mocks/factories'

describe('Integração: Fluxo de Autenticação', () => {
  let authService: ReturnType<typeof createMockAuthService>
  let loginUseCase: LoginUseCase
  let setUserRoleUseCase: SetUserRoleUseCase
  let getCurrentUserProfileUseCase: GetCurrentUserProfileUseCase

  beforeEach(() => {
    authService = createMockAuthService()
    loginUseCase = new LoginUseCase(authService)
    setUserRoleUseCase = new SetUserRoleUseCase(authService)
    getCurrentUserProfileUseCase = new GetCurrentUserProfileUseCase(authService)
  })

  it('deve completar login → definir papel → obter perfil', async () => {
    const mockUser = createMockUser()
    const mockProfile = createMockUser({ role: 'organization' })

    // Step 1: Login
    vi.mocked(authService.login).mockResolvedValue(mockUser)
    const loggedInUser = await loginUseCase.execute('test@example.com', 'password123')
    expect(loggedInUser).toEqual(mockUser)

    // Step 2: Set Role
    vi.mocked(authService.getCurrentUser).mockResolvedValue(loggedInUser)
    vi.mocked(authService.setUserRole).mockResolvedValue(undefined)
    await setUserRoleUseCase.execute('organization')
    expect(authService.setUserRole).toHaveBeenCalledWith(loggedInUser.id, 'organization')

    // Step 3: Get Profile
    vi.mocked(authService.getCurrentUser).mockResolvedValue(loggedInUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockProfile)
    const profile = await getCurrentUserProfileUseCase.execute()
    expect(profile).toEqual(mockProfile)
  })

  it('deve lidar com falha de login de forma adequada', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

    await expect(loginUseCase.execute('wrong@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials'
    )
  })

  it('deve impedir alteração de papel após logout', async () => {
    const mockUser = createMockUser()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.setUserRole).mockResolvedValue(undefined)
    await setUserRoleUseCase.execute('organization')

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    await expect(setUserRoleUseCase.execute('collaborator')).rejects.toThrow(
      'Usuário não autenticado.'
    )
  })
})
