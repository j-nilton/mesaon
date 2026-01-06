import { AuthService } from '../model/services/AuthService'

export class RecoverPasswordUseCase {
  constructor(private auth: AuthService) {}
  async execute(email: string): Promise<void> {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      throw new Error('E-mail inválido.')
    }
    await this.auth.resetPassword(email)
  }
}
