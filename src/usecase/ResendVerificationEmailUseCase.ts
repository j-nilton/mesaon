import { AuthService } from '../model/services/AuthService'

export class ResendVerificationEmailUseCase {
  constructor(private authService: AuthService) {}

  async execute(): Promise<void> {
    await this.authService.sendVerificationEmail()
  }
}
