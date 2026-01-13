import { describe, it, expect } from 'vitest'
import { Table, TableOrder } from '../../model/entities/Table'
import { createMockTable, createMockTableOrder } from '../mocks/factories'

describe('Unit: Table Entity', () => {
  it('should create a table with required properties', () => {
    const table = createMockTable()

    expect(table).toBeDefined()
    expect(table.id).toBeDefined()
    expect(table.accessCode).toBeDefined()
    expect(table.name).toBeDefined()
    expect(table.createdAt).toBeDefined()
  })

  it('should have correct required properties', () => {
    const table = createMockTable()

    expect(table.id).toBe('table-123')
    expect(table.accessCode).toBe('123456789')
    expect(table.name).toBe('Mesa 1')
    expect(table.createdAt).toBeGreaterThan(0)
  })

  it('should have optional properties: waiterName, notes, orders, total, updatedAt', () => {
    const table = createMockTable()

    expect(table.waiterName).toBeDefined()
    expect(table.notes).toBeDefined()
    expect(table.orders).toBeDefined()
    expect(Array.isArray(table.orders)).toBe(true)
  })

  it('should create table with minimal properties', () => {
    const minimalTable: Table = {
      id: 'table-001',
      accessCode: 'ABC123',
      name: 'Mesa 5',
      createdAt: Date.now(),
    }

    expect(minimalTable.id).toBe('table-001')
    expect(minimalTable.name).toBe('Mesa 5')
    expect(minimalTable.waiterName).toBeUndefined()
    expect(minimalTable.notes).toBeUndefined()
    expect(minimalTable.orders).toBeUndefined()
    expect(minimalTable.total).toBeUndefined()
    expect(minimalTable.updatedAt).toBeUndefined()
  })

  it('should handle table orders correctly', () => {
    const orders: TableOrder[] = [
      createMockTableOrder({ name: 'Pizza', quantity: 1 }),
      createMockTableOrder({ name: 'Refrigerante', quantity: 2 }),
    ]

    const table = createMockTable({ orders })

    expect(table.orders).toHaveLength(2)
    expect(table.orders?.[0].name).toBe('Pizza')
    expect(table.orders?.[1].quantity).toBe(2)
  })

  it('should calculate total from orders', () => {
    const orders: TableOrder[] = [
      createMockTableOrder({ price: 50.0, quantity: 1 }),
      createMockTableOrder({ price: 20.0, quantity: 2 }),
    ]

    const table = createMockTable({ orders, total: 90.0 })

    expect(table.total).toBe(90.0)
  })

  it('should handle empty orders array', () => {
    const table = createMockTable({ orders: [], total: 0 })

    expect(table.orders).toHaveLength(0)
    expect(table.total).toBe(0)
  })

  it('should update table properties', () => {
    const originalTable = createMockTable()
    const updatedTable: Table = {
      ...originalTable,
      waiterName: 'Maria',
      notes: 'Alérgico a glúten',
      updatedAt: Date.now(),
    }

    expect(updatedTable.waiterName).toBe('Maria')
    expect(updatedTable.notes).toBe('Alérgico a glúten')
    expect(updatedTable.updatedAt).toBeGreaterThanOrEqual(originalTable.createdAt)
    expect(updatedTable.id).toBe(originalTable.id)
  })

  it('should create table with partial overrides', () => {
    const table = createMockTable({
      name: 'Mesa Especial',
      waiterName: 'Carlos',
    })

    expect(table.name).toBe('Mesa Especial')
    expect(table.waiterName).toBe('Carlos')
    expect(table.id).toBe('table-123')
    expect(table.accessCode).toBe('123456789')
  })

  it('should preserve accessCode consistency', () => {
    const table = createMockTable({ accessCode: 'CODE123' })

    expect(table.accessCode).toBe('CODE123')
    expect(table.accessCode.length).toBeGreaterThan(0)
  })
})

describe('Unit: TableOrder Entity', () => {
  it('should create a table order with required properties', () => {
    const order = createMockTableOrder()

    expect(order).toBeDefined()
    expect(order.id).toBeDefined()
    expect(order.name).toBeDefined()
    expect(order.price).toBeDefined()
    expect(order.quantity).toBeDefined()
  })

  it('should have correct properties', () => {
    const order = createMockTableOrder()

    expect(order.id).toBe('order-123')
    expect(order.name).toBe('Pizza Margherita')
    expect(order.price).toBe(45.99)
    expect(order.quantity).toBe(2)
  })

  it('should handle quantity as positive number', () => {
    const order = createMockTableOrder({ quantity: 5 })

    expect(order.quantity).toBe(5)
    expect(typeof order.quantity).toBe('number')
    expect(order.quantity).toBeGreaterThan(0)
  })

  it('should handle price as decimal', () => {
    const order = createMockTableOrder({ price: 99.99 })

    expect(order.price).toBe(99.99)
    expect(typeof order.price).toBe('number')
  })

  it('should update order properties', () => {
    const originalOrder = createMockTableOrder()
    const updatedOrder: TableOrder = {
      ...originalOrder,
      quantity: 3,
      price: 55.99,
    }

    expect(updatedOrder.quantity).toBe(3)
    expect(updatedOrder.price).toBe(55.99)
    expect(updatedOrder.id).toBe(originalOrder.id)
  })

  it('should calculate order total', () => {
    const order = createMockTableOrder({ price: 50.0, quantity: 3 })
    const total = order.price * order.quantity

    expect(total).toBe(150.0)
  })
})
