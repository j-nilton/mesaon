import { Table } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'

export class SubscribeTablesByCodeUseCase {
  constructor(private service: TableService) {}
  execute(accessCode: string, onChange: (items: Table[]) => void): () => void {
    if (!/^\d{9}$/.test(accessCode)) {
      throw new Error('Código de acesso inválido.')
    }
    return this.service.subscribeByAccessCode(accessCode, onChange)
  }
}

