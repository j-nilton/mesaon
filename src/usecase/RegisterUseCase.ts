import { AuthService } from '../model/services/AuthService';
import { User } from '../model/entities/User';
import { AuthError } from '../model/errors/AppError';

export class RegisterUseCase {
  // Injeta o serviço de autenticação
  constructor(private authService: AuthService) {}

  async execute(name: string, email: string, pass: string): Promise<User> {
    // Valida campos obrigatórios
    if (!name || !email || !pass) {
      throw new AuthError('Todos os campos são obrigatórios.');
    }

    // Valida tamanho da senha
    if (pass.length < 6) {
      throw new AuthError('A senha deve ter no mínimo 6 caracteres.');
    }

    // Cria usuário e envia e-mail de verificação
    const user = await this.authService.register(name, email, pass);
    await this.authService.sendVerificationEmail();
    return user;
  }
}
