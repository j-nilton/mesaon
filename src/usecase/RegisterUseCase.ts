import { AuthService } from '../model/services/AuthService';
import { User } from '../model/entities/User';
import { AuthError } from '../model/errors/AppError';

export class RegisterUseCase {
  constructor(private authService: AuthService) {}

  async execute(name: string, email: string, pass: string): Promise<User> {
    if (!name || !email || !pass) {
      throw new AuthError('Todos os campos são obrigatórios.');
    }

    if (pass.length < 6) {
      throw new AuthError('A senha deve ter no mínimo 6 caracteres.');
    }

    const user = await this.authService.register(name, email, pass);
    await this.authService.sendVerificationEmail();
    return user;
  }
}
