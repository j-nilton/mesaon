import { AuthService } from '../model/services/AuthService'

export class ResendVerificationEmailUseCase {
  // Injeta o serviço de autenticação
  constructor(private authService: AuthService) {}

  async execute(): Promise<void> {
    // Reenvia e-mail de verificação
    await this.authService.sendVerificationEmail()
  }
}
