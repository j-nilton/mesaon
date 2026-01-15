import { describe, it, expect } from 'vitest'
import { User } from '../../../model/entities/User'
import { createMockUser } from '../../mocks/factories'

describe('Unit: User Entity', () => {
  it('should create a user with all required properties', () => {
    const user = createMockUser()

    expect(user).toBeDefined()
    expect(user.id).toBeDefined()
    expect(user.email).toBeDefined()
  })

  it('should have required properties: id and email', () => {
    const user = createMockUser()

    expect(user.id).toBe('user-123')
    expect(user.email).toBe('test@example.com')
  })

  it('should have optional properties', () => {
    const user = createMockUser()

    expect(user.name).toBe('Test User')
    expect(user.role).toBe('organization')
    expect(user.organizationId).toBe('123456789')
    expect(user.emailVerified).toBe(true)
  })

  it('should accept only valid roles', () => {
    const organizationUser = createMockUser({ role: 'organization' })
    const collaboratorUser = createMockUser({ role: 'collaborator' })

    expect(organizationUser.role).toBe('organization')
    expect(collaboratorUser.role).toBe('collaborator')
  })

  it('should allow creating user without optional properties', () => {
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

  it('should update user properties', () => {
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

  it('should create user with partial overrides', () => {
    const user = createMockUser({
      email: 'newemail@example.com',
      role: 'collaborator',
    })

    expect(user.email).toBe('newemail@example.com')
    expect(user.role).toBe('collaborator')
    expect(user.id).toBe('user-123')
  })
})
