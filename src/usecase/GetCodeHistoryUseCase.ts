import { AuthService } from '../model/services/AuthService'

export class GetCodeHistoryUseCase {
  constructor(private authService: AuthService) {}
  async execute(): Promise<Array<{ code: string; at: number }>> {
    const user = await this.authService.getCurrentUser()
    if (!user) return []
    return this.authService.getCodeHistory(user.id)
  }
}

