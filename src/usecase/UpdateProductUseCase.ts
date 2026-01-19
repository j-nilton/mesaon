import { ProductService } from '../model/services/ProductService'
import { AuthService } from '../model/services/AuthService'
import { Product } from '../model/entities/Product'

export class UpdateProductUseCase {
  constructor(private products: ProductService, private auth: AuthService) {}
  async execute(id: string, changes: Partial<Omit<Product, 'id' | 'accessCode' | 'createdAt'>>): Promise<Product> {
    // Garante que o usuário está autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Verifica se o usuário pertence a uma organização
    const profile = await this.auth.getUserProfile(user.id)
    if (!profile?.organizationId) throw new Error('Operação não autorizada.')
    // Validações dos campos alterados
    if (changes.price !== undefined && (!Number.isFinite(changes.price) || (changes.price as number) <= 0)) throw new Error('Preço inválido.')
    if (changes.name !== undefined && !changes.name.trim()) throw new Error('Nome do produto é obrigatório.')
    // Atualiza o produto
    return this.products.update(id, changes)
  }
}
