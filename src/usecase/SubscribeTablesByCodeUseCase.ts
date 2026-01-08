import { Table } from '../model/entities/Table'
import { TableService } from '../model/services/TableService'

export class SubscribeTablesByCodeUseCase {
  // Injeta o serviço de mesas
  constructor(private service: TableService) {}
  execute(accessCode: string, onChange: (items: Table[]) => void): () => void {
    // Valida formato do código de acesso
    if (!/^\d{9}$/.test(accessCode)) {
      throw new Error('Código de acesso inválido.')
    }
    // Realiza inscrição para atualizações das mesas
    return this.service.subscribeByAccessCode(accessCode, onChange)
  }
}

