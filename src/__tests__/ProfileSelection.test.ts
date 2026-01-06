import { describe, it, expect, vi } from 'vitest'
import { SetUserRoleUseCase } from '@/usecase/SetUserRoleUseCase'
import { AuthService } from '@/model/services/AuthService'

const authService = {
  getCurrentUser: vi.fn(),
  setUserRole: vi.fn(),
} as unknown as AuthService

describe('SetUserRoleUseCase', () => {
  it('deve definir papel do usuário autenticado', async () => {
    ;(authService.getCurrentUser as any).mockResolvedValue({ id: 'u1' })
    const uc = new SetUserRoleUseCase(authService)
    await uc.execute('collaborator')
    expect(authService.setUserRole).toHaveBeenCalledWith('u1', 'collaborator')
  })

  it('erro se usuário não autenticado', async () => {
    ;(authService.getCurrentUser as any).mockResolvedValue(null)
    const uc = new SetUserRoleUseCase(authService)
    await expect(uc.execute('organization')).rejects.toThrow('Usuário não autenticado.')
  })
})

