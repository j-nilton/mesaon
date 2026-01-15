import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TableServiceFirebase } from '@/infra/services/firebase/TableServiceFirebase'
import type { Table } from '@/model/entities/Table'

// =========================
// Firebase Mocks
// =========================
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDoc: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
  }
})

vi.mock('@/infra/services/firebase/config', () => ({
  firestore: {},
}))

import {
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'

// =========================
// Helpers
// =========================
const mockTable = (overrides?: Partial<Table>): Table => ({
  id: '1',
  name: 'Table 1',
  accessCode: 'ABC123',
  orders: [],
  total: 0,
  createdAt: 1,
  ...overrides,
})

// =========================
// Tests
// =========================
describe('TableServiceFirebase', () => {
  let service: TableServiceFirebase

  beforeEach(() => {
    vi.clearAllMocks()
    service = new TableServiceFirebase()
  })

  it('deve listar mesas por accessCode ordenadas por createdAt', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: '2', data: () => ({ createdAt: 2 }) },
        { id: '1', data: () => ({ createdAt: 1 }) },
      ],
    } as any)

    const result = await service.listByAccessCode('ABC')

    expect(result.map(t => t.id)).toEqual(['1', '2'])
  })

  it('deve criar mesa e calcular corretamente o total', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: '1' } as any)
    vi.mocked(getDoc).mockResolvedValue({
      data: () => ({
        name: 'Table',
        orders: [{ id: '1', name: 'Dish', price: 10, quantity: 2 }],
        total: 20,
      }),
    } as any)

    const table = await service.create('ABC', {
      name: 'Table',
      orders: [{ id: '1', name: 'Dish', price: 10, quantity: 2 }] as any,
    })

    expect(table.total).toBe(20)
    expect(addDoc).toHaveBeenCalled()
  })

  it('deve retornar uma mesa por id', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => mockTable(),
    } as any)

    const table = await service.getById('1')

    expect(table?.id).toBe('1')
  })

  it('deve retornar null se a mesa não existir', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as any)

    const table = await service.getById('999')

    expect(table).toBeNull()
  })

  it('deve atualizar mesa existente e recalcular o total', async () => {
    vi.mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ orders: [{ id: '1', name: 'Dish', price: 5, quantity: 1 }] }),
      } as any)
      .mockResolvedValueOnce({
        data: () => ({ total: 20 }),
      } as any)

    const table = await service.update('1', {
      orders: [{ id: '1', name: 'Dish', price: 10, quantity: 2 }] as any,
    })

    expect(updateDoc).toHaveBeenCalled()
    expect(table.total).toBe(20)
  })

  it('deve lançar erro ao atualizar mesa inexistente', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as any)

    await expect(service.update('999', {}))
      .rejects
      .toThrow('Mesa não encontrada.')
  })

  it('deve excluir uma mesa', async () => {
    await service.delete('1')

    expect(deleteDoc).toHaveBeenCalled()
  })

  it('deve assinar mudanças por accessCode', () => {
    const unsubscribe = vi.fn()
    vi.mocked(onSnapshot).mockImplementation((_q: any, cb: any) => {
      cb({
        docs: [
          { id: '1', data: () => ({ createdAt: 2 }) },
          { id: '2', data: () => ({ createdAt: 1 }) },
        ],
      })
      return unsubscribe
    })

    const onChange = vi.fn()

    const result = service.subscribeByAccessCode('ABC', onChange)

    expect(onChange).toHaveBeenCalled()
    expect(result).toBe(unsubscribe)
  })
})
