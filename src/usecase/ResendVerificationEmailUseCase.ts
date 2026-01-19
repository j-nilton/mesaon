import { AuthService } from '../model/services/AuthService'

export class ResendVerificationEmailUseCase {
  constructor(private authService: AuthService) {}

  async execute(): Promise<void> {
    // Reenvia e-mail de verificação para o usuário
    await this.authService.sendVerificationEmail()
  }
}
