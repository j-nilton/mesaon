import { ProductService } from '../model/services/ProductService'
import { AuthService } from '../model/services/AuthService'

export class DeleteProductUseCase {
  // Injeta serviços de produto e autenticação
  constructor(private products: ProductService, private auth: AuthService) {}
  async execute(id: string): Promise<void> {
    // Busca usuário autenticado
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    // Busca perfil do usuário
    const profile = await this.auth.getUserProfile(user.id)
    if (!profile?.organizationId) throw new Error('Operação não autorizada.')
    // Exclui produto pelo ID
    await this.products.delete(id)
  }
}
