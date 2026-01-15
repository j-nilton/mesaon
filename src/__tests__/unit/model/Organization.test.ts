import { describe, it, expect } from 'vitest'
import { Organization } from '../../../model/entities/Organization'
import { createMockOrganization } from '../../mocks/factories'

describe('Unitário: Entidade Organização', () => {
  it('deve criar organização com propriedades obrigatórias', () => {
    const organization = createMockOrganization()

    expect(organization).toBeDefined()
    expect(organization.id).toBeDefined()
    expect(organization.accessCode).toBeDefined()
    expect(organization.createdAt).toBeDefined()
  })

  it('deve possuir propriedades obrigatórias corretas', () => {
    const organization = createMockOrganization()

    expect(organization.id).toBe('org-123')
    expect(organization.accessCode).toBe('123456789')
    expect(organization.createdAt).toBeGreaterThan(0)
  })

  it('deve possuir propriedades opcionais: name, ownerUserId, ownerEmail', () => {
    const organization = createMockOrganization()

    expect(organization.name).toBe('Meu Restaurante')
    expect(organization.ownerUserId).toBe('user-123')
    expect(organization.ownerEmail).toBe('owner@example.com')
  })

  it('deve criar organização com propriedades mínimas', () => {
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

  it('deve possuir accessCode para controle de acesso', () => {
    const organization = createMockOrganization()

    expect(organization.accessCode).toBeDefined()
    expect(organization.accessCode.length).toBeGreaterThan(0)
    expect(typeof organization.accessCode).toBe('string')
  })

  it('deve possuir timestamps', () => {
    const now = Date.now()
    const organization = createMockOrganization()

    expect(organization.createdAt).toBeGreaterThanOrEqual(now - 1000)
    expect(organization.createdAt).toBeLessThanOrEqual(now + 1000)
  })

  it('deve atualizar propriedades da organização', () => {
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

  it('deve criar organização com sobrescritas parciais', () => {
    const organization = createMockOrganization({
      name: 'Pizzaria da Esquina',
      ownerEmail: 'pizza@example.com',
    })

    expect(organization.name).toBe('Pizzaria da Esquina')
    expect(organization.ownerEmail).toBe('pizza@example.com')
    expect(organization.id).toBe('org-123')
    expect(organization.accessCode).toBe('123456789')
  })

  it('deve preservar accessCode como identificador único', () => {
    const org1 = createMockOrganization({ accessCode: 'CODE001' })
    const org2 = createMockOrganization({ accessCode: 'CODE002' })

    expect(org1.accessCode).toBe('CODE001')
    expect(org2.accessCode).toBe('CODE002')
    expect(org1.accessCode).not.toBe(org2.accessCode)
  })

  it('deve tratar informações do proprietário corretamente', () => {
    const organization = createMockOrganization({
      ownerUserId: 'user-456',
      ownerEmail: 'owner456@example.com',
    })

    expect(organization.ownerUserId).toBe('user-456')
    expect(organization.ownerEmail).toBe('owner456@example.com')
  })

  it('deve validar formato de e-mail em ownerEmail', () => {
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
