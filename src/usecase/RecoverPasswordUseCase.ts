import { AuthService } from '../model/services/AuthService'

export class RecoverPasswordUseCase {
  constructor(private auth: AuthService) {}
  async execute(email: string): Promise<void> {
    // Valida formato do e-mail
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      throw new Error('E-mail inválido.')
    }
    // Solicita redefinição de senha
    await this.auth.resetPassword(email)
  }
}
