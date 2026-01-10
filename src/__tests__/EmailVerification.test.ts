import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// import { useRegisterViewModel } from '../viewmodel/RegisterViewModel'

import { ResendVerificationEmailUseCase } from '../usecase/ResendVerificationEmailUseCase'
import { CheckEmailVerificationUseCase } from '../usecase/CheckEmailVerificationUseCase'
import { AuthService } from '../model/services/AuthService'

const authService = {
  sendVerificationEmail: vi.fn(),
  reloadUser: vi.fn(),
  getCurrentUser: vi.fn(),
} as unknown as AuthService

describe('Email Verification UseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ResendVerificationEmailUseCase calls authService', async () => {
    const uc = new ResendVerificationEmailUseCase(authService)
    await uc.execute()
    expect(authService.sendVerificationEmail).toHaveBeenCalled()
  })

  it('CheckEmailVerificationUseCase reloads and checks user', async () => {
    const uc = new CheckEmailVerificationUseCase(authService)
    ;(authService.getCurrentUser as any).mockResolvedValue({ emailVerified: true })
    
    const result = await uc.execute()
    
    expect(authService.reloadUser).toHaveBeenCalled()
    expect(authService.getCurrentUser).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('CheckEmailVerificationUseCase returns false if not verified', async () => {
    const uc = new CheckEmailVerificationUseCase(authService)
    ;(authService.getCurrentUser as any).mockResolvedValue({ emailVerified: false })
    
    const result = await uc.execute()
    
    expect(result).toBe(false)
  })
})
