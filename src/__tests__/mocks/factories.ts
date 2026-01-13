import { User } from '../../model/entities/User'
import { Product, ProductCategory } from '../../model/entities/Product'
import { Table, TableOrder } from '../../model/entities/Table'
import { Organization } from '../../model/entities/Organization'

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'organization',
  organizationId: '123456789',
  emailVerified: true,
  ...overrides,
})

export const createMockProduct = (overrides?: Partial<Product>): Product => ({
  id: 'prod-123',
  accessCode: '123456789',
  name: 'Pizza Margherita',
  price: 45.99,
  category: 'Pizzas' as ProductCategory,
  createdAt: Date.now(),
  description: 'Classic pizza with tomato and basil',
  ...overrides,
})

export const createMockTableOrder = (overrides?: Partial<TableOrder>): TableOrder => ({
  id: 'order-123',
  name: 'Pizza Margherita',
  price: 45.99,
  quantity: 2,
  ...overrides,
})

export const createMockTable = (overrides?: Partial<Table>): Table => ({
  id: 'table-123',
  accessCode: '123456789',
  name: 'Mesa 1',
  createdAt: Date.now(),
  waiterName: 'João',
  notes: 'Observações',
  orders: [createMockTableOrder()],
  ...overrides,
})

export const createMockOrganization = (overrides?: Partial<Organization>): Organization => ({
  id: 'org-123',
  accessCode: '123456789',
  name: 'Meu Restaurante',
  createdAt: Date.now(),
  ownerUserId: 'user-123',
  ownerEmail: 'owner@example.com',
  ...overrides,
})
