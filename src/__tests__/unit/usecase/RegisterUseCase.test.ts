import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RegisterUseCase } from '../../../usecase/RegisterUseCase'
import { createMockAuthService } from '../../mocks'
import { createMockUser } from '../../mocks/factories'

describe('Unit: RegisterUseCase', () => {
  let useCase: RegisterUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new RegisterUseCase(authService)
  })

  it('should register user with valid data', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.register).mockResolvedValue(mockUser)
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    const result = await useCase.execute('John Doe', 'john@example.com', 'password123')

    expect(result).toEqual(mockUser)
    expect(authService.register).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123')
    expect(authService.sendVerificationEmail).toHaveBeenCalled()
  })

  it('should throw error when name is empty', async () => {
    await expect(useCase.execute('', 'john@example.com', 'password123')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )
  })

  it('should throw error when email is empty', async () => {
    await expect(useCase.execute('John Doe', '', 'password123')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )
  })

  it('should throw error when password is empty', async () => {
    await expect(useCase.execute('John Doe', 'john@example.com', '')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )
  })

  it('should throw error when password is less than 6 characters', async () => {
    await expect(useCase.execute('John Doe', 'john@example.com', '12345')).rejects.toThrow(
      'A senha deve ter no mínimo 6 caracteres.'
    )
  })

  it('should accept password with exactly 6 characters', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.register).mockResolvedValue(mockUser)
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    const result = await useCase.execute('John Doe', 'john@example.com', '123456')

    expect(result).toEqual(mockUser)
  })

  it('should send verification email after registration', async () => {
    const mockUser = createMockUser()
    vi.mocked(authService.register).mockResolvedValue(mockUser)
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    await useCase.execute('John Doe', 'john@example.com', 'password123')

    expect(authService.sendVerificationEmail).toHaveBeenCalled()
  })

  it('should not call register when validation fails', async () => {
    await expect(useCase.execute('', 'john@example.com', 'password123')).rejects.toThrow()

    expect(authService.register).not.toHaveBeenCalled()
  })
})
