import { Table } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'

export class SubscribeTablesByCodeUseCase {
  constructor(private service: TableService) {}
  execute(accessCode: string, onChange: (items: Table[]) => void): () => void {
    // Valida o código de acesso
    if (!/^\d{9}$/.test(accessCode)) {
      throw new Error('Código de acesso inválido.')
    }
    // Realiza a inscrição para atualizações das mesas
    return this.service.subscribeByAccessCode(accessCode, onChange)
  }
}

