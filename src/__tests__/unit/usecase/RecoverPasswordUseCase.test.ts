import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RecoverPasswordUseCase } from '../../../usecase/RecoverPasswordUseCase'
import { createMockAuthService } from '../../mocks'

describe('Unitário: RecoverPasswordUseCase', () => {
  let useCase: RecoverPasswordUseCase
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    authService = createMockAuthService()
    useCase = new RecoverPasswordUseCase(authService)
  })

  it('deve enviar e-mail de redefinição com e-mail válido', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined)

    await useCase.execute('test@example.com')

    expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com')
  })

  it('deve lançar erro quando e-mail está vazio', async () => {
    await expect(useCase.execute('')).rejects.toThrow('E-mail inválido.')
  })

  it('deve lançar erro quando formato de e-mail é inválido', async () => {
    await expect(useCase.execute('invalidemail')).rejects.toThrow('E-mail inválido.')
  })

  it('deve lançar erro quando e-mail não possui domínio', async () => {
    await expect(useCase.execute('test@')).rejects.toThrow('E-mail inválido.')
  })

  it('deve lançar erro quando e-mail não possui parte local', async () => {
    await expect(useCase.execute('@example.com')).rejects.toThrow('E-mail inválido.')
  })

  it('deve aceitar formatos de e-mail válidos', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined)

    await useCase.execute('user.name+tag@example.co.uk')

    expect(authService.resetPassword).toHaveBeenCalled()
  })

  it('deve evitar chamada ao serviço quando e-mail é inválido', async () => {
    await expect(useCase.execute('invalid')).rejects.toThrow()

    expect(authService.resetPassword).not.toHaveBeenCalled()
  })
})
