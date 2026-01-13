import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetCurrentUserProfileUseCase } from '../../usecase/GetCurrentUserProfileUseCase'
import { createMockAuthService } from '../mocks'
import { createMockUser } from '../mocks/factories'

describe('Unit: GetCurrentUserProfileUseCase', () => {
  let useCase: GetCurrentUserProfileUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new GetCurrentUserProfileUseCase(authService)
  })

  it('should return user profile when it exists', async () => {
    const mockUser = createMockUser()
    const mockProfile = createMockUser({ name: 'Profile Name' })

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockProfile)

    const result = await useCase.execute()

    expect(result).toEqual(mockProfile)
    expect(authService.getUserProfile).toHaveBeenCalledWith(mockUser.id)
  })

  it('should return current user when profile does not exist', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(null)

    const result = await useCase.execute()

    expect(result).toEqual(mockUser)
  })

  it('should return null when no user is logged in', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    const result = await useCase.execute()

    expect(result).toBeNull()
    expect(authService.getUserProfile).not.toHaveBeenCalled()
  })

  it('should prioritize user profile over current user', async () => {
    const mockUser = createMockUser({ name: 'User Name' })
    const mockProfile = createMockUser({ name: 'Profile Name' })

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getUserProfile).mockResolvedValue(mockProfile)

    const result = await useCase.execute()

    expect(result).toEqual(mockProfile)
    expect(result?.name).toBe('Profile Name')
  })
})
