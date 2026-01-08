import { AccessCodeService } from '../model/services/AccessCodeService'
import { AuthService } from '../model/services/AuthService'
import { Organization } from '../model/entities/Organization'

export class GenerateAccessCodeUseCase {
  // Injeta serviços de código de acesso e autenticação
  constructor(private accessCodeService: AccessCodeService, private authService: AuthService) {}

  async execute(): Promise<Organization> {
    // Busca usuário autenticado
    const currentUser = await this.authService.getCurrentUser()
    // Gera código único
    const code = await this.accessCodeService.generateUniqueCode()
    // Cria organização com o código
    const org = await this.accessCodeService.createOrganizationWithCode(code, currentUser || undefined)
    if (currentUser) {
      // Vincula usuário à organização e salva histórico
      await this.authService.setUserOrganization(currentUser.id, code)
      await this.authService.addCodeToHistory(currentUser.id, code)
    }
    return org
  }
}
