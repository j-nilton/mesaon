import { ProductService } from '../model/services/ProductService'
import { AuthService } from '../model/services/AuthService'
import { Product } from '../model/entities/Product'

export class UpdateProductUseCase {
  // Injeta serviços de produto e autenticação
  constructor(private products: ProductService, private auth: AuthService) {}
  async execute(id: string, changes: Partial<Omit<Product, 'id' | 'accessCode' | 'createdAt'>>): Promise<Product> {
    // Busca usuário autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Busca perfil do usuário
    const profile = await this.auth.getUserProfile(user.id)
    if (!profile?.organizationId) throw new Error('Operação não autorizada.')
    // Valida preço se informado
    if (changes.price !== undefined && (!Number.isFinite(changes.price) || (changes.price as number) <= 0)) throw new Error('Preço inválido.')
    // Valida nome se informado
    if (changes.name !== undefined && !changes.name.trim()) throw new Error('Nome do produto é obrigatório.')
    // Atualiza produto
    return this.products.update(id, changes)
  }
}
