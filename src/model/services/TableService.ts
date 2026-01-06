import { Table, TableOrder } from '../entities/Table'

export interface TableService {
  listByAccessCode(accessCode: string): Promise<Table[]>
  create(accessCode: string, data: { name: string; waiterName?: string; notes?: string; orders?: TableOrder[] }): Promise<Table>
  getById(id: string): Promise<Table | null>
  update(id: string, changes: Partial<Omit<Table, 'id' | 'accessCode' | 'createdAt'>>): Promise<Table>
  delete(id: string): Promise<void>
}
