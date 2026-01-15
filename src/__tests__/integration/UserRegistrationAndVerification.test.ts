import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RegisterUseCase } from '../../usecase/RegisterUseCase'
import { CheckEmailVerificationUseCase } from '../../usecase/CheckEmailVerificationUseCase'
import { ResendVerificationEmailUseCase } from '../../usecase/ResendVerificationEmailUseCase'
import { RecoverPasswordUseCase } from '../../usecase/RecoverPasswordUseCase'
import { createMockAuthService } from '../mocks'
import { createMockUser } from '../mocks/factories'

describe('Integração: Registro e Verificação de Usuário', () => {
  let authService: ReturnType<typeof createMockAuthService>
  let registerUseCase: RegisterUseCase
  let checkEmailVerificationUseCase: CheckEmailVerificationUseCase
  let resendVerificationEmailUseCase: ResendVerificationEmailUseCase
  let recoverPasswordUseCase: RecoverPasswordUseCase

  beforeEach(() => {
    authService = createMockAuthService()
    registerUseCase = new RegisterUseCase(authService)
    checkEmailVerificationUseCase = new CheckEmailVerificationUseCase(authService)
    resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(authService)
    recoverPasswordUseCase = new RecoverPasswordUseCase(authService)
  })

  it('deve completar fluxo de registro e verificação de e-mail', async () => {
    const mockUser = createMockUser({ emailVerified: false })
    const verifiedUser = createMockUser({ emailVerified: true })

    // Register User
    vi.mocked(authService.register).mockResolvedValue(mockUser)
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    const registered = await registerUseCase.execute(
      'John Doe',
      'john@example.com',
      'password123'
    )
    expect(registered).toEqual(mockUser)
    expect(authService.sendVerificationEmail).toHaveBeenCalled()

    // Check Email Verification (not yet verified)
    vi.mocked(authService.reloadUser).mockResolvedValue(undefined)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    let isVerified = await checkEmailVerificationUseCase.execute()
    expect(isVerified).toBe(false)

    // Resend Verification Email
    vi.mocked(authService.sendVerificationEmail).mockResolvedValue(undefined)

    await resendVerificationEmailUseCase.execute()
    expect(authService.sendVerificationEmail).toHaveBeenCalledTimes(2)

    // Check Email Verification (after verification)
    vi.mocked(authService.reloadUser).mockResolvedValue(undefined)
    vi.mocked(authService.getCurrentUser).mockResolvedValue(verifiedUser)

    isVerified = await checkEmailVerificationUseCase.execute()
    expect(isVerified).toBe(true)
  })

  it('deve validar dados de registro', async () => {
    // Missing name
    await expect(registerUseCase.execute('', 'john@example.com', 'password123')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )

    // Missing email
    await expect(registerUseCase.execute('John Doe', '', 'password123')).rejects.toThrow(
      'Todos os campos são obrigatórios.'
    )

    // Password too short
    await expect(registerUseCase.execute('John Doe', 'john@example.com', '12345')).rejects.toThrow(
      'A senha deve ter no mínimo 6 caracteres.'
    )
  })

  it('deve lidar com fluxo de recuperação de senha', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined)

    await recoverPasswordUseCase.execute('john@example.com')

    expect(authService.resetPassword).toHaveBeenCalledWith('john@example.com')
  })

  it('deve validar formato de e-mail para recuperação de senha', async () => {
    // Invalid email
    await expect(recoverPasswordUseCase.execute('invalid')).rejects.toThrow('E-mail inválido.')

    // Empty email
    await expect(recoverPasswordUseCase.execute('')).rejects.toThrow('E-mail inválido.')
  })

  it('deve lidar com erros de serviço de forma adequada', async () => {
    const serviceError = new Error('Database error')

    vi.mocked(authService.register).mockRejectedValue(serviceError)

    await expect(
      registerUseCase.execute('John Doe', 'john@example.com', 'password123')
    ).rejects.toThrow('Database error')
  })

  it('deve evitar chamadas de serviço quando validação falhar', async () => {
    // Register with invalid data should not call service
    await expect(registerUseCase.execute('', 'john@example.com', 'password123')).rejects.toThrow()

    expect(authService.register).not.toHaveBeenCalled()
    expect(authService.sendVerificationEmail).not.toHaveBeenCalled()

    // Recover password with invalid email should not call service
    await expect(recoverPasswordUseCase.execute('invalid')).rejects.toThrow()

    expect(authService.resetPassword).not.toHaveBeenCalled()
  })
})
