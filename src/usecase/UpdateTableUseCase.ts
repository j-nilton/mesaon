import { Table, TableOrder } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'
import { AuthService } from '../model/services/AuthService'

export class UpdateTableUseCase {
  constructor(private service: TableService, private auth: AuthService) {}
  async execute(id: string, changes: Partial<Omit<Table, 'id' | 'accessCode' | 'createdAt'>>): Promise<Table> {
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    if (changes.name !== undefined && !changes.name.trim()) throw new Error('Nome da mesa é obrigatório.')
    if (changes.orders !== undefined) {
      const valid = (changes.orders as TableOrder[]).every(o => o.name && Number.isFinite(o.price) && Number.isFinite(o.quantity) && o.quantity > 0 && o.price >= 0)
      if (!valid) throw new Error('Pedidos inválidos.')
    }
    return this.service.update(id, changes)
  }
}

