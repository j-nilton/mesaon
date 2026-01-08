import { Table } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'

export class ListTablesByCodeUseCase {
  // Injeta o serviço de mesas
  constructor(private service: TableService) {}
  async execute(accessCode: string): Promise<Table[]> {
    // Valida formato do código de acesso
    if (!/^\d{9}$/.test(accessCode)) {
      throw new Error('Código de acesso inválido.')
    }
    // Lista mesas pelo código
    return this.service.listByAccessCode(accessCode)
  }
}

