import { Table, TableOrder } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'
import { AuthService } from '../model/services/AuthService'

export class CreateTableUseCase {
  constructor(private service: TableService, private auth: AuthService) {}
  async execute(accessCode: string, data: { name: string; waiterName?: string; notes?: string; orders?: TableOrder[] }): Promise<Table> {
    // Valida o formato do código de acesso
    if (!/^\d{9}$/.test(accessCode)) throw new Error('Código de acesso inválido.')
    // Valida o nome da mesa
    const n = data.name.trim()
    if (!n) throw new Error('Nome da mesa é obrigatório.')
    // Garante que o usuário está autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Cria a mesa
    return this.service.create(accessCode, { name: n, waiterName: data.waiterName?.trim() || undefined, notes: data.notes?.trim() || undefined, orders: data.orders })
  }
}
