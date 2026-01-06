import { ProductService } from '../model/services/ProductService'
import { AuthService } from '../model/services/AuthService'

export class DeleteProductUseCase {
  constructor(private products: ProductService, private auth: AuthService) {}
  async execute(id: string): Promise<void> {
    const user = await this.auth.getCurrentUser()
    if (!user) throw new Error('Usuário não autenticado.')
    const profile = await this.auth.getUserProfile(user.id)
    if (!profile?.organizationId) throw new Error('Operação não autorizada.')
    await this.products.delete(id)
  }
}
