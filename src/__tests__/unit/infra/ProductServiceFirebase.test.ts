import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductServiceFirebase } from '@/infra/services/firebase/ProductServiceFirebase'
import type { ProductCategory } from '@/model/entities/Product'

// ==============================
// FIRESTORE MOCKS
// ==============================

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
}))

vi.mock('@/infra/services/firebase/config', () => ({
  firestore: {},
}))

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

// ==============================
// TESTS
// ==============================

describe('ProductServiceFirebase', () => {
  let service: ProductServiceFirebase

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProductServiceFirebase()
  })

  // ------------------------------
  // listByAccessCode
  // ------------------------------
  it('should list products by access code', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'p1',
          data: () => ({
            name: 'Pizza',
            description: 'Cheese pizza',
            accessCode: '123',
            createdAt: 100,
          }),
        },
        {
          id: 'p2',
          data: () => ({
            name: 'Burger',
            description: 'Beef',
            accessCode: '123',
            createdAt: 200,
          }),
        },
      ],
    } as any)

    const result = await service.listByAccessCode('123')

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('p2') // ordered by createdAt desc
  })

  it('should filter products by search term', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'p1',
          data: () => ({
            name: 'Pizza',
            description: 'Cheese',
            accessCode: '123',
            createdAt: 100,
          }),
        },
        {
          id: 'p2',
          data: () => ({
            name: 'Burger',
            description: 'Beef',
            accessCode: '123',
            createdAt: 200,
          }),
        },
      ],
    } as any)

    const result = await service.listByAccessCode('123', 'pizza')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Pizza')
  })

  it('should apply category filter', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any)

    await service.listByAccessCode('123', undefined, 'Bebidas' as ProductCategory)

    expect(where).toHaveBeenCalledWith('category', '==', 'Bebidas')
  })

  // ------------------------------
  // create
  // ------------------------------
  it('should create a product', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'p1' } as any)
    vi.mocked(getDoc).mockResolvedValue({
      data: () => ({
        name: 'Soda',
        price: 5,
        accessCode: '123',
      }),
    } as any)

    const product = await service.create('123', {
      name: 'Soda',
      price: 5,
      category: 'Bebidas' as ProductCategory,
    } as any)

    expect(addDoc).toHaveBeenCalled()
    expect(product.id).toBe('p1')
    expect(product.name).toBe('Soda')
  })

  // ------------------------------
  // update
  // ------------------------------
  it('should update a product', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      data: () => ({
        name: 'Updated Pizza',
      }),
    } as any)

    const product = await service.update('p1', { name: 'Updated Pizza' })

    expect(updateDoc).toHaveBeenCalled()
    expect(product.name).toBe('Updated Pizza')
  })

  // ------------------------------
  // delete
  // ------------------------------
  it('should delete a product', async () => {
    await service.delete('p1')

    expect(deleteDoc).toHaveBeenCalled()
  })
})
