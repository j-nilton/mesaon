import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RecoverPasswordUseCase } from '../../../usecase/RecoverPasswordUseCase'
import { createMockAuthService } from '../../mocks'

describe('Unit: RecoverPasswordUseCase', () => {
  let useCase: RecoverPasswordUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new RecoverPasswordUseCase(authService)
  })

  it('should send password reset email with valid email', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined)

    await useCase.execute('test@example.com')

    expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com')
  })

  it('should throw error when email is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow('E-mail inválido.')
  })

  it('should throw error when email format is invalid', async () => {
    await expect(useCase.execute('invalidemail')).rejects.toThrow('E-mail inválido.')
  })

  it('should throw error when email has no domain', async () => {
    await expect(useCase.execute('test@')).rejects.toThrow('E-mail inválido.')
  })

  it('should throw error when email has no local part', async () => {
    await expect(useCase.execute('@example.com')).rejects.toThrow('E-mail inválido.')
  })

  it('should accept valid email formats', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined)

    await useCase.execute('user.name+tag@example.co.uk')

    expect(authService.resetPassword).toHaveBeenCalled()
  })

  it('should not call service when email is invalid', async () => {
    await expect(useCase.execute('invalid')).rejects.toThrow()

    expect(authService.resetPassword).not.toHaveBeenCalled()
  })
})
