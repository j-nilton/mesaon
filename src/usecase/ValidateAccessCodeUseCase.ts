import { AccessCodeService } from '../model/services/AccessCodeService'
import { Organization } from '../model/entities/Organization'
import { AuthService } from '../model/services/AuthService'

export class ValidateAccessCodeUseCase {
  // Injeta serviços de código de acesso e autenticação
  constructor(private accessCodeService: AccessCodeService, private authService: AuthService) {}

  async execute(code: string): Promise<Organization> {
    // Normaliza código para apenas dígitos
    const normalized = code.replace(/\D/g, '')
    // Valida formato do código
    if (!/^\d{9}$/.test(normalized)) {
      throw new Error('Código inválido. Informe 9 dígitos.')
    }
    // Busca organização pelo código
    const org = await this.accessCodeService.getOrganizationByCode(normalized)
    if (!org) throw new Error('Código inexistente.')
    // Busca usuário autenticado
    const user = await this.authService.getCurrentUser()
    if (user) {
      // Vincula usuário à organização e salva histórico
      await this.authService.setUserOrganization(user.id, normalized)
      await this.authService.addCodeToHistory(user.id, normalized)
      await this.accessCodeService.updateMembersCount(normalized, 1)
    }
    return org
  }
}
