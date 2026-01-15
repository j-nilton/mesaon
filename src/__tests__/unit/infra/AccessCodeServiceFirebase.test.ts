import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccessCodeServiceFirebase } from '@/infra/services/firebase/AccessCodeServiceFirebase'
import { Organization } from '@/model/entities/Organization'

// ==============================
// MOCKS DO FIREBASE
// ==============================

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ path: 'mock-path' })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  increment: vi.fn((v: number) => ({ __increment: v })),
}))

vi.mock('@/infra/services/firebase/config', () => ({
  firestore: {},
}))

import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore'

// ==============================
// TESTES
// ==============================

describe('AccessCodeServiceFirebase', () => {
  let service: AccessCodeServiceFirebase

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AccessCodeServiceFirebase()
  })

  // ------------------------------
  // generateUniqueCode
  // ------------------------------
  it('should generate a unique code when there is no organization.', async () => {
    vi.spyOn(service, 'getOrganizationByCode').mockResolvedValue(null)

    const code = await service.generateUniqueCode()

    expect(code).toHaveLength(9)
    expect(service.getOrganizationByCode).toHaveBeenCalled()
  })

  // ------------------------------
  // createOrganizationWithCode
  // ------------------------------
  it('must create an organization with the correct data.', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(123456)

    const org = await service.createOrganizationWithCode('123456789', {
      id: 'user-1',
      name: 'João',
      email: 'joao@email.com',
      emailVerified: true,
    })

    expect(setDoc).toHaveBeenCalled()
    expect(org).toEqual<Organization>({
      id: '123456789',
      accessCode: '123456789',
      createdAt: 123456,
      ownerUserId: 'user-1',
      name: 'João',
      ownerEmail: 'joao@email.com',
    })

    nowSpy.mockRestore()
  })

  // ------------------------------
  // getOrganizationByCode
  // ------------------------------
  it('should return null if the organization does not exist.', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
    } as any)

    const result = await service.getOrganizationByCode('123')

    expect(result).toBeNull()
  })

  it('should be returned to the organization if it exists.', async () => {
    const data = { id: '123' }

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => data,
    } as any)

    const result = await service.getOrganizationByCode('123')

    expect(result).toEqual(data)
  })

  // ------------------------------
  // deleteOrganizationByCode
  // ------------------------------
  it('should exclude the organization by code.', async () => {
    await service.deleteOrganizationByCode('123')

    expect(deleteDoc).toHaveBeenCalled()
  })

  // ------------------------------
  // updateMembersCount
  // ------------------------------
  it('should increment the member counter when updateDoc runs.', async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined)

    await service.updateMembersCount('123', 2)

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      { membersCount: expect.objectContaining({ __increment: 2 }) }
    )
  })

  it('should set the membersCount if updateDoc fails.', async () => {
    vi.mocked(updateDoc).mockRejectedValue(new Error('erro'))
    vi.mocked(setDoc).mockResolvedValue(undefined)

    await service.updateMembersCount('123', 3)

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      { membersCount: 3 },
      { merge: true }
    )
  })
})
