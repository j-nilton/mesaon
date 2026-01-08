import { TableService } from '../model/services/TableService'
import { AuthService } from '../model/services/AuthService'

export class DeleteTableUseCase {
  // Injeta serviços de mesa e autenticação
  constructor(private service: TableService, private auth: AuthService) {}
  async execute(id: string): Promise<void> {
    // Busca usuário autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Exclui mesa pelo ID
    await this.service.delete(id)
  }
}

