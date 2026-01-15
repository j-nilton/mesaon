import { AuthService } from '../model/services/AuthService'

export class GetCurrentUserProfileUseCase {
  constructor(private authService: AuthService) {}
  async execute(): Promise<import('../model/entities/User').User | null> {
    const user = await this.authService.getCurrentUser()
    if (!user) return null
    const profile = await this.authService.getUserProfile(user.id)
    return profile || user
  }
}

