import { describe, it, expect, vi } from 'vitest'
import { TableServiceFirebase } from '@/infra/services/firebase/TableServiceFirebase'

vi.mock('@/infra/services/firebase/config', () => ({
  firestore: {}
}))

vi.mock('firebase/firestore', () => {
  const dataStore: any = {
    'id1': { orders: [{ name: 'X', price: 10, quantity: 2 }], total: 20 }
  }
  return {
    collection: vi.fn(),
    doc: vi.fn((_fs: any, _col: string, id: string) => ({ id })),
    getDoc: vi.fn(async (ref: any) => ({
      exists: () => !!dataStore[ref.id],
      data: () => dataStore[ref.id] || {}
    })),
    updateDoc: vi.fn(async (_ref: any, payload: any) => {
      dataStore[_ref.id] = { ...(dataStore[_ref.id] || {}), ...payload }
    }),
    deleteDoc: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
  }
})

describe('TableServiceFirebase update', () => {
  it('recalcula total com base nos pedidos', async () => {
    const svc = new TableServiceFirebase()
    const updated = await svc.update('id1', { orders: [{ name: 'Y', price: 5, quantity: 3 }] } as any)
    expect(updated.total).toBe(15)
  })
})

