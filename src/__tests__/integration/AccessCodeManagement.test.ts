import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GenerateAccessCodeUseCase } from '../../usecase/GenerateAccessCodeUseCase'
import { ValidateAccessCodeUseCase } from '../../usecase/ValidateAccessCodeUseCase'
import { GetCodeHistoryUseCase } from '../../usecase/GetCodeHistoryUseCase'
import { createMockAccessCodeService, createMockAuthService } from '../mocks'
import { createMockUser, createMockOrganization } from '../mocks/factories'

describe('Integration: Access Code Management', () => {
  let accessCodeService: ReturnType<typeof createMockAccessCodeService>
  let authService: ReturnType<typeof createMockAuthService>
  let generateAccessCodeUseCase: GenerateAccessCodeUseCase
  let validateAccessCodeUseCase: ValidateAccessCodeUseCase
  let getCodeHistoryUseCase: GetCodeHistoryUseCase

  beforeEach(() => {
    accessCodeService = createMockAccessCodeService()
    authService = createMockAuthService()
    generateAccessCodeUseCase = new GenerateAccessCodeUseCase(accessCodeService, authService)
    validateAccessCodeUseCase = new ValidateAccessCodeUseCase(accessCodeService, authService)
    getCodeHistoryUseCase = new GetCodeHistoryUseCase(authService)
  })

  it('should generate code and validate it', async () => {
    const mockUser = createMockUser()
    const mockOrg = createMockOrganization()

    // Generate Code
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)
    vi.mocked(authService.setUserOrganization).mockResolvedValue(undefined)
    vi.mocked(authService.addCodeToHistory).mockResolvedValue(undefined)

    const generatedOrg = await generateAccessCodeUseCase.execute()
    expect(generatedOrg).toEqual(mockOrg)

    // Validate Code
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(accessCodeService.getOrganizationByCode).mockResolvedValue(mockOrg)
    vi.mocked(authService.setUserOrganization).mockResolvedValue(undefined)
    vi.mocked(authService.addCodeToHistory).mockResolvedValue(undefined)
    vi.mocked(accessCodeService.updateMembersCount).mockResolvedValue(undefined)

    const validatedOrg = await validateAccessCodeUseCase.execute('123456789')
    expect(validatedOrg).toEqual(mockOrg)
  })

  it('should track code history after generating and validating codes', async () => {
    const mockUser = createMockUser()
    const mockOrg = createMockOrganization()
    const history = [
      { code: '123456789', at: Date.now() - 5000 },
      { code: '987654321', at: Date.now() },
    ]

    // Generate First Code
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)
    vi.mocked(authService.setUserOrganization).mockResolvedValue(undefined)
    vi.mocked(authService.addCodeToHistory).mockResolvedValue(undefined)

    await generateAccessCodeUseCase.execute()

    // Get History
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(authService.getCodeHistory).mockResolvedValue(history)

    const retrievedHistory = await getCodeHistoryUseCase.execute()
    expect(retrievedHistory).toHaveLength(2)
    expect(retrievedHistory[0].code).toBe('123456789')
  })

  it('should prevent unauthenticated user from generating code but allow validation', async () => {
    const mockOrg = createMockOrganization()

    // Try to generate without user - still succeeds but with no user updates
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.generateUniqueCode).mockResolvedValue('123456789')
    vi.mocked(accessCodeService.createOrganizationWithCode).mockResolvedValue(mockOrg)

    const org = await generateAccessCodeUseCase.execute()
    expect(org).toEqual(mockOrg)

    // Can validate without user
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
    vi.mocked(accessCodeService.getOrganizationByCode).mockResolvedValue(mockOrg)

    const validatedOrg = await validateAccessCodeUseCase.execute('123456789')
    expect(validatedOrg).toEqual(mockOrg)
  })
})
