import { collection, addDoc, getDocs, query, where, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { firestore } from './config'
import { Table, TableOrder } from '../../../model/entities/Table'
import { TableService } from '../../../model/services/TableService'

export class TableServiceFirebase implements TableService {
  async listByAccessCode(accessCode: string): Promise<Table[]> {
    const col = collection(firestore, 'tables')
    const snapshot = await getDocs(query(col, where('accessCode', '==', accessCode)))
    const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Table[]
    return items.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
  }

  async create(accessCode: string, data: { name: string; waiterName?: string; notes?: string; orders?: TableOrder[] }): Promise<Table> {
    const now = Date.now()
    const total = (data.orders || []).reduce((acc, it) => acc + it.price * it.quantity, 0)
    const payload: any = { accessCode, name: data.name, orders: data.orders || [], total, createdAt: now }
    if (data.waiterName) payload.waiterName = data.waiterName
    if (data.notes) payload.notes = data.notes
    const ref = await addDoc(collection(firestore, 'tables'), payload)
    const snap = await getDoc(ref)
    return { id: ref.id, ...(snap.data() as any) } as Table
  }

  async getById(id: string): Promise<Table | null> {
    const ref = doc(firestore, 'tables', id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return { id, ...(snap.data() as any) } as Table
  }

  async update(id: string, changes: Partial<Omit<Table, 'id' | 'accessCode' | 'createdAt'>>): Promise<Table> {
    const ref = doc(firestore, 'tables', id)
    const currentSnap = await getDoc(ref)
    if (!currentSnap.exists()) throw new Error('Mesa não encontrada.')
    const current = currentSnap.data() as any
    const orders = changes.orders !== undefined ? changes.orders : current.orders || []
    const total = orders.reduce((acc: number, it: TableOrder) => acc + it.price * it.quantity, 0)
    const payload = { ...changes, total, updatedAt: Date.now() }
    await updateDoc(ref, payload as any)
    const updatedSnap = await getDoc(ref)
    return { id, ...(updatedSnap.data() as any) } as Table
  }

  async delete(id: string): Promise<void> {
    const ref = doc(firestore, 'tables', id)
    await deleteDoc(ref)
  }
}
