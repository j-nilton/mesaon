import { ProductService } from '../model/services/ProductService'
import { AuthService } from '../model/services/AuthService'
import { Product } from '../model/entities/Product'

export class CreateProductUseCase {
  constructor(private products: ProductService, private auth: AuthService) {}
  async execute(accessCode: string, input: Omit<Product, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    const profile = await this.auth.getUserProfile(user.id)
    if (profile?.organizationId !== accessCode) throw new Error('Operação não autorizada.')
    if (!accessCode || !/^\d{9}$/.test(accessCode)) throw new Error('Código de acesso inválido.')
    if (!input.name?.trim()) throw new Error('Nome do produto é obrigatório.')
    if (!Number.isFinite(input.price) || input.price <= 0) throw new Error('Preço inválido.')
    return this.products.create(accessCode, input)
  }
}
