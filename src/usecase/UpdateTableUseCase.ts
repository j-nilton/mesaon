import { Table, TableOrder } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'
import { AuthService } from '../model/services/AuthService'

export class UpdateTableUseCase {
  // Injeta serviços de mesa e autenticação
  constructor(private service: TableService, private auth: AuthService) {}
  async execute(id: string, changes: Partial<Omit<Table, 'id' | 'accessCode' | 'createdAt'>>): Promise<Table> {
    // Busca usuário autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Valida nome se informado
    if (changes.name !== undefined && !changes.name.trim()) throw new Error('Nome da mesa é obrigatório.')
    // Valida pedidos se informado
    if (changes.orders !== undefined) {
      const valid = (changes.orders as TableOrder[]).every(o => o.name && Number.isFinite(o.price) && Number.isFinite(o.quantity) && o.quantity > 0 && o.price >= 0)
      if (!valid) throw new Error('Pedidos inválidos.')
    }
    // Atualiza mesa
    return this.service.update(id, changes)
  }
}

