import { Product, ProductCategory } from '../entities/Product'

export interface ProductService {
  listByAccessCode(accessCode: string, query?: string, category?: ProductCategory): Promise<Product[]>
  create(accessCode: string, input: Omit<Product, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Product>
  update(id: string, changes: Partial<Omit<Product, 'id' | 'accessCode' | 'createdAt'>>): Promise<Product>
  delete(id: string): Promise<void>
}
