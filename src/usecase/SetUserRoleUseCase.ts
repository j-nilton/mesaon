import { AuthService } from '../model/services/AuthService'

export class SetUserRoleUseCase {
  constructor(private authService: AuthService) {}

  async execute(role: 'organization' | 'collaborator'): Promise<void> {
    // Garante que o usuário está autenticado
    const user = await this.authService.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Atualiza o papel do usuário
    await this.authService.setUserRole(user.id, role)
  }
}

