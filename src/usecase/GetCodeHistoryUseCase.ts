import { AuthService } from '../model/services/AuthService'

export class GetCodeHistoryUseCase {
  constructor(private authService: AuthService) {}
  async execute(): Promise<Array<{ code: string; at: number }>> {
    // Obtém o usuário atual
    const user = await this.authService.getCurrentUser()
    if (!user) return []
    // Retorna o histórico de códigos do usuário
    return this.authService.getCodeHistory(user.id)
  }
}

