import { AccessCodeService } from '../model/services/AccessCodeService'

export class DeleteAccessCodeUseCase {
  // Injeta serviço de código de acesso
  constructor(private accessCodeService: AccessCodeService) {}
  async execute(code: string): Promise<void> {
    // Exclui organização pelo código
    await this.accessCodeService.deleteOrganizationByCode(code)
  }
}

