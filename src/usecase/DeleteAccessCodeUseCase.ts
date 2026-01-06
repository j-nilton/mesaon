import { AccessCodeService } from '../model/services/AccessCodeService'

export class DeleteAccessCodeUseCase {
  constructor(private accessCodeService: AccessCodeService) {}
  async execute(code: string): Promise<void> {
    await this.accessCodeService.deleteOrganizationByCode(code)
  }
}

