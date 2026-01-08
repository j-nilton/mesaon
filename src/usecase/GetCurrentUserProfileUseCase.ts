import { AuthService } from '../model/services/AuthService'

export class GetCurrentUserProfileUseCase {
  // Injeta o serviço de autenticação
  constructor(private authService: AuthService) {}
  async execute(): Promise<import('../model/entities/User').User | null> {
    // Busca usuário autenticado
    const user = await this.authService.getCurrentUser()
    if (!user) return null
    // Busca perfil detalhado
    const profile = await this.authService.getUserProfile(user.id)
    return profile || user
  }
}

