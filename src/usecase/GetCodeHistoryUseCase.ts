import { AuthService } from '../model/services/AuthService'

export class GetCodeHistoryUseCase {
  // Injeta o serviço de autenticação
  constructor(private authService: AuthService) {}
  async execute(): Promise<Array<{ code: string; at: number }>> {
    // Busca usuário autenticado
    const user = await this.authService.getCurrentUser()
    if (!user) return []
    // Retorna histórico de códigos
    return this.authService.getCodeHistory(user.id)
  }
}

