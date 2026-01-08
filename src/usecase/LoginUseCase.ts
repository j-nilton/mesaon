import { AuthService } from '../model/services/AuthService';
import { User } from '../model/entities/User';
import { AuthError } from '../model/errors/AppError';

export class LoginUseCase {
  // Injeta o serviço de autenticação
  constructor(private authService: AuthService) {}

  async execute(email: string, pass: string): Promise<User> {
    // Valida se email e senha foram informados
    if (!email || !pass) {
      throw new AuthError('E-mail e senha são obrigatórios.');
    }
    // Executa login pelo serviço
    return this.authService.login(email, pass);
  }
}
