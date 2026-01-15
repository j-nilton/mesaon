import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ValidateAccessCodeUseCase } from '../../../usecase/ValidateAccessCodeUseCase'
import { createMockAccessCodeService, createMockAuthService } from '../../mocks'
import { createMockUser, createMockOrganization } from '../../mocks/factories'

describe('Unitário: ValidateAccessCodeUseCase', () => {
  let useCase: ValidateAccessCodeUseCase
  let accessCodeService: ReturnType<typeof createMockAccessCodeService>
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    accessCodeService = createMockAccessCodeService()
    authService = createMockAuthService()
    useCase = new ValidateAccessCodeUseCase(accessCodeService, authService)
  })

  it('deve validar código de acesso sem usuário', async () => {
    const mockOrg = createMockOrganization()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.getOrganizationByCode).mockResolvedValue(mockOrg)

    const result = await useCase.execute('123456789')

    expect(result).toEqual(mockOrg)
    expect(accessCodeService.getOrganizationByCode).toHaveBeenCalledWith('123456789')
  })

  it('deve validar e atualizar organização do usuário', async () => {
    const mockUser = createMockUser()
    const mockOrg = createMockOrganization()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(accessCodeService.getOrganizationByCode).mockResolvedValue(mockOrg)
    vi.mocked(authService.setUserOrganization).mockResolvedValue(undefined)
    vi.mocked(authService.addCodeToHistory).mockResolvedValue(undefined)
    vi.mocked(accessCodeService.updateMembersCount).mockResolvedValue(undefined)

    const result = await useCase.execute('123456789')

    expect(result).toEqual(mockOrg)
    expect(authService.setUserOrganization).toHaveBeenCalledWith(mockUser.id, '123456789')
    expect(authService.addCodeToHistory).toHaveBeenCalledWith(mockUser.id, '123456789')
    expect(accessCodeService.updateMembersCount).toHaveBeenCalledWith('123456789', 1)
  })

  it('deve lançar erro com formato de código inválido', async () => {
    await expect(useCase.execute('12345')).rejects.toThrow(
      'Código inválido. Informe 9 dígitos.'
    )
  })

  it('deve normalizar código antes da validação', async () => {
    const mockOrg = createMockOrganization()

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.getOrganizationByCode).mockResolvedValue(mockOrg)

    await useCase.execute('123-456-789')

    expect(accessCodeService.getOrganizationByCode).toHaveBeenCalledWith('123456789')
  })

  it('deve lançar erro quando código não existe', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.getOrganizationByCode).mockResolvedValue(null)

    await expect(useCase.execute('123456789')).rejects.toThrow(
      'Código inexistente.'
    )
  })

  it('deve lançar erro com caracteres não numéricos', async () => {
    await expect(useCase.execute('123abc789')).rejects.toThrow(
      'Código inválido. Informe 9 dígitos.'
    )
  })
})
