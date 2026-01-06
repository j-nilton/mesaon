import { AuthService } from '../model/services/AuthService';
import { User } from '../model/entities/User';
import { AuthError } from '../model/errors/AppError';

export class LoginUseCase {
  constructor(private authService: AuthService) {}

  async execute(email: string, pass: string): Promise<User> {
    if (!email || !pass) {
      throw new AuthError('E-mail e senha são obrigatórios.');
    }
    // Aqui poderiam entrar outras regras de negócio (ex: verificar tentativas, logar analytics)
    return this.authService.login(email, pass);
  }
}
