import { ProductService } from '../model/services/ProductService'
import { Product, ProductCategory } from '../model/entities/Product'

export class ListProductsByCodeUseCase {
  constructor(private products: ProductService) {}
  async execute(accessCode: string, query?: string, category?: ProductCategory): Promise<Product[]> {
    if (!accessCode || !/^\d{9}$/.test(accessCode)) throw new Error('Código de acesso inválido.')
    return this.products.listByAccessCode(accessCode, query, category)
  }
}
