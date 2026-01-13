import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ResendVerificationEmailUseCase } from '../../usecase/ResendVerificationEmailUseCase'
import { createMockAuthService } from '../mocks'

describe('Unit: ResendVerificationEmailUseCase', () => {
  let useCase: ResendVerificationEmailUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new ResendVerificationEmailUseCase(authService)
  })

  it('should resend verification email', async () => {
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    await useCase.execute()

    expect(authService.sendVerificationEmail).toHaveBeenCalledTimes(1)
  })

  it('should handle errors from auth service', async () => {
    const error = new Error('Email service unavailable')
    vi.mocked(authService.sendVerificationEmail).mockRejectedValue(error)

    await expect(useCase.execute()).rejects.toThrow('Email service unavailable')
  })
})
