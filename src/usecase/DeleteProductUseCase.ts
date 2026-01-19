import { ProductService } from '../model/services/ProductService'
import { AuthService } from '../model/services/AuthService'

export class DeleteProductUseCase {
  constructor(private products: ProductService, private auth: AuthService) {}
  async execute(id: string): Promise<void> {
    // Garante que o usuário está autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Verifica se o usuário pertence a uma organização
    const profile = await this.auth.getUserProfile(user.id)
    if (!profile?.organizationId) throw new Error('Operação não autorizada.')
    // Remove o produto
    await this.products.delete(id)
  }
}
