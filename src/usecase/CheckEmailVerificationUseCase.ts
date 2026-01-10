import { AuthService } from '../model/services/AuthService'

export class CheckEmailVerificationUseCase {
  constructor(private authService: AuthService) {}

  async execute(): Promise<boolean> {
    await this.authService.reloadUser()
    const user = await this.authService.getCurrentUser()
    return !!user?.emailVerified
  }
}
