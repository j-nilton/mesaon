import { Table } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'
import { AuthService } from '../model/services/AuthService'

export class GetTableByIdUseCase {
  constructor(private service: TableService, private auth: AuthService) {}
  async execute(id: string): Promise<Table | null> {
    // Garante que o usuário está autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Busca a mesa pelo ID
    return this.service.getById(id)
  }
}

