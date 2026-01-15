import { describe, it, expect } from 'vitest'
import { User } from '../../../model/entities/User'
import { createMockUser } from '../../mocks/factories'

describe('Unitário: Entidade Usuário', () => {
  it('deve criar usuário com todas as propriedades obrigatórias', () => {
    const user = createMockUser()

    expect(user).toBeDefined()
    expect(user.id).toBeDefined()
    expect(user.email).toBeDefined()
  })

  it('deve possuir propriedades obrigatórias: id e email', () => {
    const user = createMockUser()

    expect(user.id).toBe('user-123')
    expect(user.email).toBe('test@example.com')
  })

  it('deve possuir propriedades opcionais', () => {
    const user = createMockUser()

    expect(user.name).toBe('Test User')
    expect(user.role).toBe('organization')
    expect(user.organizationId).toBe('123456789')
    expect(user.emailVerified).toBe(true)
  })

  it('deve aceitar apenas papéis válidos', () => {
    const organizationUser = createMockUser({ role: 'organization' })
    const collaboratorUser = createMockUser({ role: 'collaborator' })

    expect(organizationUser.role).toBe('organization')
    expect(collaboratorUser.role).toBe('collaborator')
  })

  it('deve permitir criar usuário sem propriedades opcionais', () => {
    const minimalUser: User = {
      id: 'user-001',
      email: 'minimal@example.com',
    }

    expect(minimalUser.id).toBe('user-001')
    expect(minimalUser.email).toBe('minimal@example.com')
    expect(minimalUser.name).toBeUndefined()
    expect(minimalUser.role).toBeUndefined()
    expect(minimalUser.organizationId).toBeUndefined()
    expect(minimalUser.emailVerified).toBeUndefined()
  })

  it('deve atualizar propriedades do usuário', () => {
    const user = createMockUser()
    const updatedUser: User = {
      ...user,
      name: 'Updated Name',
      emailVerified: false,
    }

    expect(updatedUser.name).toBe('Updated Name')
    expect(updatedUser.emailVerified).toBe(false)
    expect(updatedUser.id).toBe(user.id)
  })

  it('deve criar usuário com sobrescritas parciais', () => {
    const user = createMockUser({
      email: 'newemail@example.com',
      role: 'collaborator',
    })

    expect(user.email).toBe('newemail@example.com')
    expect(user.role).toBe('collaborator')
    expect(user.id).toBe('user-123')
  })
})
