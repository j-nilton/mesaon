import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GenerateAccessCodeUseCase } from '../../../usecase/GenerateAccessCodeUseCase'
import { createMockAccessCodeService, createMockAuthService } from '../../mocks'
import { createMockUser, createMockOrganization } from '../../mocks/factories'

describe('Unitário: GenerateAccessCodeUseCase', () => {
  let useCase: GenerateAccessCodeUseCase
  let accessCodeService: ReturnType<typeof createMockAccessCodeService>
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    accessCodeService = createMockAccessCodeService()
    authService = createMockAuthService()
    useCase = new GenerateAccessCodeUseCase(accessCodeService, authService)
  })

  it('deve gerar código de acesso sem usuário atual', async () => {
    const mockOrg = createMockOrganization()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)

    const result = await useCase.execute()

    expect(result).toEqual(mockOrg)
    expect(accessCodeService.generateUniqueCode).toHaveBeenCalled()
    expect(accessCodeService.createOrganizationWithCode).toHaveBeenCalledWith('123456789', undefined)
  })

  it('deve gerar código de acesso com usuário atual e atualizar organização', async () => {
    const mockUser = createMockUser()
    const mockOrg = createMockOrganization()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)
    vi.mocked(authService.setUserOrganization).mockResolvedValue(undefined)
    vi.mocked(authService.addCodeToHistory).mockResolvedValue(undefined)

    const result = await useCase.execute()

    expect(result).toEqual(mockOrg)
    expect(authService.setUserOrganization).toHaveBeenCalledWith(mockUser.id, '123456789')
    expect(authService.addCodeToHistory).toHaveBeenCalledWith(mockUser.id, '123456789')
  })

  it('deve não atualizar organização do usuário quando não há login', async () => {
    const mockOrg = createMockOrganization()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)

    await useCase.execute()

    expect(authService.setUserOrganization).not.toHaveBeenCalled()
    expect(authService.addCodeToHistory).not.toHaveBeenCalled()
  })

  it('deve gerar código único antes de criar organização', async () => {
    const mockOrg = createMockOrganization()
    let generateCalled = false
    let createCalled = false

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.generateUniqueCode).mockImplementation(async () => {
      generateCalled = true
      return '123456789'
    })
    vi.mocked(accessCodeService.createOrganizationWithCode).mockImplementation(async () => {
      expect(generateCalled).toBe(true)
      createCalled = true
      return mockOrg
    })

    await useCase.execute()

    expect(generateCalled).toBe(true)
    expect(createCalled).toBe(true)
  })
})
