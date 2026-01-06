import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GenerateAccessCodeUseCase } from '@/usecase/GenerateAccessCodeUseCase'
import { ValidateAccessCodeUseCase } from '@/usecase/ValidateAccessCodeUseCase'
import { AccessCodeService } from '@/model/services/AccessCodeService'
import { AuthService } from '@/model/services/AuthService'
import { Organization } from '@/model/entities/Organization'

const accessService = {
  generateUniqueCode: vi.fn(),
  createOrganizationWithCode: vi.fn(),
  getOrganizationByCode: vi.fn(),
  deleteOrganizationByCode: vi.fn(),
  updateMembersCount: vi.fn(),
} as unknown as AccessCodeService

const authService = {
  getCurrentUser: vi.fn(),
  setUserOrganization: vi.fn(),
  addCodeToHistory: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
} as unknown as AuthService

describe('Access Code UseCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GenerateAccessCodeUseCase deve criar organização com código único', async () => {
    const code = '123456789'
    ;(accessService.generateUniqueCode as any).mockResolvedValue(code)
    ;(authService.getCurrentUser as any).mockResolvedValue({ id: 'u1', email: 'a@b.com' })
    ;(accessService.createOrganizationWithCode as any).mockResolvedValue({ id: code, accessCode: code, createdAt: Date.now() } as Organization)

    const uc = new GenerateAccessCodeUseCase(accessService, authService)
    const org = await uc.execute()

    expect(accessService.generateUniqueCode).toHaveBeenCalled()
    expect(accessService.createOrganizationWithCode).toHaveBeenCalledWith(code, { id: 'u1', email: 'a@b.com' })
    expect(org.accessCode).toBe(code)
  })

  it('ValidateAccessCodeUseCase valida 9 dígitos e vincula usuário', async () => {
    const code = '987654321'
    ;(accessService.getOrganizationByCode as any).mockResolvedValue({ id: code, accessCode: code, createdAt: Date.now() } as Organization)
    ;(authService.getCurrentUser as any).mockResolvedValue({ id: 'u2', email: 'c@d.com' })
    const uc = new ValidateAccessCodeUseCase(accessService, authService)

    const org = await uc.execute(code)

    expect(accessService.getOrganizationByCode).toHaveBeenCalledWith(code)
    expect(authService.setUserOrganization).toHaveBeenCalledWith('u2', code)
    expect(org.accessCode).toBe(code)
  })

  it('ValidateAccessCodeUseCase rejeita formato inválido', async () => {
    const uc = new ValidateAccessCodeUseCase(accessService, authService)
    await expect(uc.execute('12')).rejects.toThrow('Código inválido. Informe 9 dígitos.')
  })
})
