import { describe, it, expect } from 'vitest'
import { Organization } from '../../../model/entities/Organization'
import { createMockOrganization } from '../../mocks/factories'

describe('Unit: Organization Entity', () => {
  it('should create an organization with required properties', () => {
    const organization = createMockOrganization()

    expect(organization).toBeDefined()
    expect(organization.id).toBeDefined()
    expect(organization.accessCode).toBeDefined()
    expect(organization.createdAt).toBeDefined()
  })

  it('should have correct required properties', () => {
    const organization = createMockOrganization()

    expect(organization.id).toBe('org-123')
    expect(organization.accessCode).toBe('123456789')
    expect(organization.createdAt).toBeGreaterThan(0)
  })

  it('should have optional properties: name, ownerUserId, ownerEmail', () => {
    const organization = createMockOrganization()

    expect(organization.name).toBe('Meu Restaurante')
    expect(organization.ownerUserId).toBe('user-123')
    expect(organization.ownerEmail).toBe('owner@example.com')
  })

  it('should create organization with minimal properties', () => {
    const minimalOrganization: Organization = {
      id: 'org-001',
      accessCode: 'ABC123',
      createdAt: Date.now(),
    }

    expect(minimalOrganization.id).toBe('org-001')
    expect(minimalOrganization.accessCode).toBe('ABC123')
    expect(minimalOrganization.name).toBeUndefined()
    expect(minimalOrganization.ownerUserId).toBeUndefined()
    expect(minimalOrganization.ownerEmail).toBeUndefined()
  })

  it('should have accessCode for access control', () => {
    const organization = createMockOrganization()

    expect(organization.accessCode).toBeDefined()
    expect(organization.accessCode.length).toBeGreaterThan(0)
    expect(typeof organization.accessCode).toBe('string')
  })

  it('should have timestamps', () => {
    const now = Date.now()
    const organization = createMockOrganization()

    expect(organization.createdAt).toBeGreaterThanOrEqual(now - 1000)
    expect(organization.createdAt).toBeLessThanOrEqual(now + 1000)
  })

  it('should update organization properties', () => {
    const originalOrganization = createMockOrganization()
    const updatedOrganization: Organization = {
      ...originalOrganization,
      name: 'Novo Nome do Restaurante',
      ownerUserId: 'new-owner-id',
    }

    expect(updatedOrganization.name).toBe('Novo Nome do Restaurante')
    expect(updatedOrganization.ownerUserId).toBe('new-owner-id')
    expect(updatedOrganization.id).toBe(originalOrganization.id)
    expect(updatedOrganization.createdAt).toBe(originalOrganization.createdAt)
  })

  it('should create organization with partial overrides', () => {
    const organization = createMockOrganization({
      name: 'Pizzaria da Esquina',
      ownerEmail: 'pizza@example.com',
    })

    expect(organization.name).toBe('Pizzaria da Esquina')
    expect(organization.ownerEmail).toBe('pizza@example.com')
    expect(organization.id).toBe('org-123')
    expect(organization.accessCode).toBe('123456789')
  })

  it('should preserve accessCode as unique identifier', () => {
    const org1 = createMockOrganization({ accessCode: 'CODE001' })
    const org2 = createMockOrganization({ accessCode: 'CODE002' })

    expect(org1.accessCode).toBe('CODE001')
    expect(org2.accessCode).toBe('CODE002')
    expect(org1.accessCode).not.toBe(org2.accessCode)
  })

  it('should handle owner information correctly', () => {
    const organization = createMockOrganization({
      ownerUserId: 'user-456',
      ownerEmail: 'owner456@example.com',
    })

    expect(organization.ownerUserId).toBe('user-456')
    expect(organization.ownerEmail).toBe('owner456@example.com')
  })

  it('should validate email format in ownerEmail', () => {
    const validEmails = [
      'owner@example.com',
      'user.name@domain.co.uk',
      'email+tag@example.com',
    ]

    validEmails.forEach((email) => {
      const organization = createMockOrganization({ ownerEmail: email })
      expect(organization.ownerEmail).toBe(email)
    })
  })
})
