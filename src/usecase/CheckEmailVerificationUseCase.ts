import { AuthService } from '../model/services/AuthService'

export class CheckEmailVerificationUseCase {
  // Injeta o serviço de autenticação, permitindo abstração e testabilidade
  constructor(private authService: AuthService) {}

  async execute(): Promise<boolean> {
    // Garante que o status de verificação do usuário está atualizado
    await this.authService.reloadUser()
    const user = await this.authService.getCurrentUser()
    // Retorna true se o e-mail estiver verificado
    return !!user?.emailVerified
  }
}
