import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CheckEmailVerificationUseCase } from '../../usecase/CheckEmailVerificationUseCase'
import { createMockAuthService } from '../mocks'
import { createMockUser } from '../mocks/factories'

describe('Unit: CheckEmailVerificationUseCase', () => {
  let useCase: CheckEmailVerificationUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new CheckEmailVerificationUseCase(authService)
  })

  it('should return true when user email is verified', async () => {
    const mockUser = createMockUser({ emailVerified: true })
    vi.mocked(authService.reloadUser).mockResolvedValue(undefined)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const result = await useCase.execute()

    expect(result).toBe(true)
    expect(authService.reloadUser).toHaveBeenCalledTimes(1)
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('should return false when user email is not verified', async () => {
    const mockUser = createMockUser({ emailVerified: false })
    vi.mocked(authService.reloadUser).mockResolvedValue(undefined)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const result = await useCase.execute()

    expect(result).toBe(false)
  })

  it('should return false when user is null', async () => {
    vi.mocked(authService.reloadUser).mockResolvedValue(undefined)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)

    const result = await useCase.execute()

    expect(result).toBe(false)
  })

  it('should return false when user emailVerified is undefined', async () => {
    const mockUser = createMockUser({ emailVerified: undefined })
    vi.mocked(authService.reloadUser).mockResolvedValue(undefined)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const result = await useCase.execute()

    expect(result).toBe(false)
  })

  it('should call reloadUser before getting current user', async () => {
    const mockUser = createMockUser({ emailVerified: true })
    let reloadUserCalled = false
    vi.mocked(authService.reloadUser).mockImplementation(async () => {
      reloadUserCalled = true
    })
    vi.mocked(authService.getCurrentUser).mockImplementation(async () => {
      expect(reloadUserCalled).toBe(true)
      return mockUser
    })

    await useCase.execute()

    expect(reloadUserCalled).toBe(true)
  })
})
