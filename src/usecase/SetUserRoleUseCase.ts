import { AuthService } from '../model/services/AuthService'

export class SetUserRoleUseCase {
  // Injeta o serviço de autenticação
  constructor(private authService: AuthService) {}

  async execute(role: 'organization' | 'collaborator'): Promise<void> {
    // Busca usuário autenticado
    const user = await this.authService.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Define papel do usuário
    await this.authService.setUserRole(user.id, role)
  }
}

