import { describe, it, expect, vi } from 'vitest'
import { isValidEmail, checkPasswordRequirements } from '@/viewmodel/RegisterViewModel'

vi.mock('expo-router', () => ({
  router: {
    replace: vi.fn(),
    back: vi.fn(),
    push: vi.fn(),
  },
}))

describe('RegisterViewModel Validation', () => {
  describe('isValidEmail', () => {
    it('aceita e-mail válido', () => {
      expect(isValidEmail('test@valid-domain.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('rejeita formato inválido', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@example')).toBe(false)
    })

    it('rejeita domínio @email.com', () => {
      expect(isValidEmail('user@email.com')).toBe(false)
    })

    it('rejeita domínio @example.com', () => {
      expect(isValidEmail('user@example.com')).toBe(false)
    })
    
    it('aceita e-mail com subdomínio', () => {
      expect(isValidEmail('user@mail.co.uk')).toBe(true)
    })
  })

  describe('checkPasswordRequirements', () => {
    it('aceita senha forte (todos os requisitos)', () => {
      // 8 chars, upper, lower, number
      expect(checkPasswordRequirements({ length: true, upper: true, lower: true, number: true })).toBe(true)
    })

    it('aceita senha média (length + number + upper)', () => {
      expect(checkPasswordRequirements({ length: true, upper: true, lower: false, number: true })).toBe(true)
    })

    it('aceita senha média (length + number + lower)', () => {
      expect(checkPasswordRequirements({ length: true, upper: false, lower: true, number: true })).toBe(true)
    })

    it('rejeita senha fraca (sem número)', () => {
      expect(checkPasswordRequirements({ length: true, upper: true, lower: true, number: false })).toBe(false)
    })

    it('rejeita senha fraca (sem letras)', () => {
      expect(checkPasswordRequirements({ length: true, upper: false, lower: false, number: true })).toBe(false)
    })

    it('rejeita senha curta', () => {
      expect(checkPasswordRequirements({ length: false, upper: true, lower: true, number: true })).toBe(false)
    })
  })
})
