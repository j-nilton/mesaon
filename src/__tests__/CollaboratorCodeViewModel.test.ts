import { describe, it, expect } from 'vitest'
import { normalizeCodeInput } from '@/viewmodel/CollaboratorCodeViewModel'

describe('CollaboratorCodeViewModel helpers', () => {
  it('normaliza entrada mantendo apenas 9 dígitos', () => {
    expect(normalizeCodeInput('123-456-789')).toBe('123456789')
    expect(normalizeCodeInput('12a34b56c7890')).toBe('123456789')
    expect(normalizeCodeInput('')).toBe('')
  })
})
