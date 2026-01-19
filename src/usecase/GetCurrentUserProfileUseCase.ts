import { AuthService } from '../model/services/AuthService'

export class GetCurrentUserProfileUseCase {
  constructor(private authService: AuthService) {}
  async execute(): Promise<import('../model/entities/User').User | null> {
    // Obtém o usuário autenticado
    const user = await this.authService.getCurrentUser()
    if (!user) return null
    // Retorna o perfil completo se existir, senão retorna dados básicos do usuário
    const profile = await this.authService.getUserProfile(user.id)
    return profile || user
  }
}

