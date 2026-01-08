import { ProductService } from '../model/services/ProductService'
import { AuthService } from '../model/services/AuthService'
import { Product } from '../model/entities/Product'

export class CreateProductUseCase {
  // Injeta serviços de produto e autenticação
  constructor(private products: ProductService, private auth: AuthService) {}
  async execute(accessCode: string, input: Omit<Product, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    // Busca usuário autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Busca perfil do usuário
    const profile = await this.auth.getUserProfile(user.id)
    if (profile?.organizationId !== accessCode) throw new Error('Operação não autorizada.')
    // Valida código de acesso
    if (!accessCode || !/^\d{9}$/.test(accessCode)) throw new Error('Código de acesso inválido.')
    // Valida nome do produto
    if (!input.name?.trim()) throw new Error('Nome do produto é obrigatório.')
    // Valida preço do produto
    if (!Number.isFinite(input.price) || input.price <= 0) throw new Error('Preço inválido.')
    // Cria produto
    return this.products.create(accessCode, input)
  }
}
