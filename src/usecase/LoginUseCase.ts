import { AuthService } from '../model/services/AuthService';
import { User } from '../model/entities/User';
import { AuthError } from '../model/errors/AppError';

export class LoginUseCase {
  constructor(private authService: AuthService) {}

  async execute(email: string, pass: string): Promise<User> {
    // Valida campos obrigatórios
    if (!email || !pass) {
      throw new AuthError('E-mail e senha são obrigatórios.');
    }
    // Realiza login via serviço de autenticação
    return this.authService.login(email, pass);
  }
}
