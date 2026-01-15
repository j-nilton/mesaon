import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GenerateAccessCodeUseCase } from '../../../usecase/GenerateAccessCodeUseCase'
import { createMockAccessCodeService, createMockAuthService } from '../../mocks'
import { createMockUser, createMockOrganization } from '../../mocks/factories'

describe('Unit: GenerateAccessCodeUseCase', () => {
  let useCase: GenerateAccessCodeUseCase
  let accessCodeService: ReturnType<typeof createMockAccessCodeService>
  let authService: ReturnType<typeof createMockAuthService>

  beforeEach(() => {
    accessCodeService = createMockAccessCodeService()
    authService = createMockAuthService()
    useCase = new GenerateAccessCodeUseCase(accessCodeService, authService)
  })

  it('should generate access code without current user', async () => {
    const mockOrg = createMockOrganization()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)

    const result = await useCase.execute()

    expect(result).toEqual(mockOrg)
    expect(accessCodeService.generateUniqueCode).toHaveBeenCalled()
    expect(accessCodeService.createOrganizationWithCode).toHaveBeenCalledWith('123456789', undefined)
  })

  it('should generate access code with current user and update organization', async () => {
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

  it('should not update user organization when no user is logged in', async () => {
    const mockOrg = createMockOrganization()
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)

    await useCase.execute()

    expect(authService.setUserOrganization).not.toHaveBeenCalled()
    expect(authService.addCodeToHistory).not.toHaveBeenCalled()
  })

  it('should generate unique code before creating organization', async () => {
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
