import { ProductService } from '../model/services/ProductService'
import { Product, ProductCategory } from '../model/entities/Product'

export class ListProductsByCodeUseCase {
  // Injeta o serviço de produtos
  constructor(private products: ProductService) {}
  async execute(accessCode: string, query?: string, category?: ProductCategory): Promise<Product[]> {
    // Valida formato do código de acesso
    if (!accessCode || !/^\d{9}$/.test(accessCode)) throw new Error('Código de acesso inválido.')
    // Lista produtos pelo código, query e categoria
    return this.products.listByAccessCode(accessCode, query, category)
  }
}
