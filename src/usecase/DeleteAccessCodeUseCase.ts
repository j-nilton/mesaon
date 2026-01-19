import { AccessCodeService } from '../model/services/AccessCodeService'

export class DeleteAccessCodeUseCase {
  constructor(private accessCodeService: AccessCodeService) {}
  async execute(code: string): Promise<void> {
    // Remove a organização associada ao código informado
    await this.accessCodeService.deleteOrganizationByCode(code)
  }
}

