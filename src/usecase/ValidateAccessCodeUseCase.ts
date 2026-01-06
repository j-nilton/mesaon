import { AccessCodeService } from '../model/services/AccessCodeService'
import { Organization } from '../model/entities/Organization'
import { AuthService } from '../model/services/AuthService'

export class ValidateAccessCodeUseCase {
  constructor(private accessCodeService: AccessCodeService, private authService: AuthService) {}

  async execute(code: string): Promise<Organization> {
    const normalized = code.replace(/\D/g, '')
    if (!/^\d{9}$/.test(normalized)) {
      throw new Error('Código inválido. Informe 9 dígitos.')
    }
    const org = await this.accessCodeService.getOrganizationByCode(normalized)
    if (!org) throw new Error('Código inexistente.')
    const user = await this.authService.getCurrentUser()
    if (user) {
      await this.authService.setUserOrganization(user.id, normalized)
      await this.authService.addCodeToHistory(user.id, normalized)
      await this.accessCodeService.updateMembersCount(normalized, 1)
    }
    return org
  }
}
