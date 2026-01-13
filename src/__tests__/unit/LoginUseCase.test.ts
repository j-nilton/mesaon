import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LoginUseCase } from '../../usecase/LoginUseCase'
import { createMockAuthService } from '../mocks'
import { createMockUser } from '../mocks/factories'

describe('Unit: LoginUseCase', () => {
  let useCase: LoginUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new LoginUseCase(authService)
  })

  it('should login with valid credentials', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.login).mockResolvedValue(mockUser)

    const result = await useCase.execute('test@example.com', 'password123')

    expect(result).toEqual(mockUser)
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('should throw error when email is empty', async () => {
    await expect(useCase.execute('', 'password123')).rejects.toThrow(
      'E-mail e senha são obrigatórios.'
    )
  })

  it('should throw error when password is empty', async () => {
    await expect(useCase.execute('test@example.com', '')).rejects.toThrow(
      'E-mail e senha são obrigatórios.'
    )
  })

  it('should throw error when both email and password are empty', async () => {
    await expect(useCase.execute('', '')).rejects.toThrow(
      'E-mail e senha são obrigatórios.'
    )
  })

  it('should not call service when validation fails', async () => {
    await expect(useCase.execute('', 'password')).rejects.toThrow()

    expect(authService.login).not.toHaveBeenCalled()
  })
})
