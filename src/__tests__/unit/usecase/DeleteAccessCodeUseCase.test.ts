import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteAccessCodeUseCase } from '../../../usecase/DeleteAccessCodeUseCase'
import { createMockAccessCodeService } from '../../mocks'

describe('Unit: DeleteAccessCodeUseCase', () => {
  let useCase: DeleteAccessCodeUseCase
  let accessCodeService: ReturnType<typeof createMockAccessCodeService>

  beforeEach(() => {
    accessCodeService = createMockAccessCodeService()
    useCase = new DeleteAccessCodeUseCase(accessCodeService)
  })

  it('should delete organization by code', async () => {
    vi.mocked(accessCodeService.deleteOrganizationByCode).mockResolvedValue(undefined)

    await useCase.execute('123456789')

    expect(accessCodeService.deleteOrganizationByCode).toHaveBeenCalledWith('123456789')
    expect(accessCodeService.deleteOrganizationByCode).toHaveBeenCalledTimes(1)
  })

  it('should pass the exact code provided', async () => {
    vi.mocked(accessCodeService.deleteOrganizationByCode).mockResolvedValue(undefined)

    await useCase.execute('999888777')

    expect(accessCodeService.deleteOrganizationByCode).toHaveBeenCalledWith('999888777')
  })

  it('should handle errors from access code service', async () => {
    const error = new Error('Organization not found')
    vi.mocked(accessCodeService.deleteOrganizationByCode).mockRejectedValue(error)

    await expect(useCase.execute('123456789')).rejects.toThrow('Organization not found')
  })
})
