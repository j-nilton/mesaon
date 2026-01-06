import { Table } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'

export class ListTablesByCodeUseCase {
  constructor(private service: TableService) {}
  async execute(accessCode: string): Promise<Table[]> {
    if (!/^\d{9}$/.test(accessCode)) {
      throw new Error('Código de acesso inválido.')
    }
    return this.service.listByAccessCode(accessCode)
  }
}

