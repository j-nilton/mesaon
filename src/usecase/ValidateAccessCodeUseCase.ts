import { AccessCodeService } from '../model/services/AccessCodeService'
import { Organization } from '../model/entities/Organization'
import { AuthService } from '../model/services/AuthService'

export class ValidateAccessCodeUseCase {
  constructor(private accessCodeService: AccessCodeService, private authService: AuthService) {}

  async execute(code: string): Promise<Organization> {
    // Normaliza o código para conter apenas dígitos
    const normalized = code.replace(/\D/g, '')
    // Valida o formato do código
    if (!/^\d{9}$/.test(normalized)) {
      throw new Error('Código inválido. Informe 9 dígitos.')
    }
    // Busca organização pelo código
    const org = await this.accessCodeService.getOrganizationByCode(normalized)
    if (!org) throw new Error('Código inexistente.')
    // Atualiza perfil e histórico do usuário, e incrementa membros
    const user = await this.authService.getCurrentUser()
    if (user) {
      await this.authService.setUserOrganization(user.id, normalized)
      await this.authService.addCodeToHistory(user.id, normalized)
      await this.accessCodeService.updateMembersCount(normalized, 1)
    }
    return org
  }
}
