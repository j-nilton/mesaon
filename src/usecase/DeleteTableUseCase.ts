import { TableService } from '../model/services/TableService'
import { AuthService } from '../model/services/AuthService'

export class DeleteTableUseCase {
  constructor(private service: TableService, private auth: AuthService) {}
  async execute(id: string): Promise<void> {
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    await this.service.delete(id)
  }
}

