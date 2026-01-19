import { Table } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'

export class ListTablesByCodeUseCase {
  constructor(private service: TableService) {}
  async execute(accessCode: string): Promise<Table[]> {
    // Valida o código de acesso
    if (!/^\d{9}$/.test(accessCode)) {
      throw new Error('Código de acesso inválido.')
    }
    // Lista mesas associadas ao código
    return this.service.listByAccessCode(accessCode)
  }
}

