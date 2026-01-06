import { AccessCodeService } from '../model/services/AccessCodeService'
import { AuthService } from '../model/services/AuthService'
import { Organization } from '../model/entities/Organization'

export class GenerateAccessCodeUseCase {
  constructor(private accessCodeService: AccessCodeService, private authService: AuthService) {}

  async execute(): Promise<Organization> {
    const currentUser = await this.authService.getCurrentUser()
    const code = await this.accessCodeService.generateUniqueCode()
    const org = await this.accessCodeService.createOrganizationWithCode(code, currentUser || undefined)
    if (currentUser) {
      await this.authService.setUserOrganization(currentUser.id, code)
      await this.authService.addCodeToHistory(currentUser.id, code)
    }
    return org
  }
}
