import { AccessCodeService } from '../model/services/AccessCodeService'
import { AuthService } from '../model/services/AuthService'
import { Organization } from '../model/entities/Organization'

export class GenerateAccessCodeUseCase {
  constructor(private accessCodeService: AccessCodeService, private authService: AuthService) {}

  async execute(): Promise<Organization> {
    // Obtém o usuário atual
    const currentUser = await this.authService.getCurrentUser()
    // Gera um código único para a organização
    const code = await this.accessCodeService.generateUniqueCode()
    // Cria a organização com o código gerado
    const org = await this.accessCodeService.createOrganizationWithCode(code, currentUser || undefined)
    // Atualiza perfil e histórico do usuário
    if (currentUser) {
      await this.authService.setUserOrganization(currentUser.id, code)
      await this.authService.addCodeToHistory(currentUser.id, code)
    }
    return org
  }
}
