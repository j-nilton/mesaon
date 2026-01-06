import { describe, it, expect } from 'vitest'
import { computeFabState } from '@/viewmodel/MenuViewModel'

describe('MenuViewModel computeFabState', () => {
  it('habilita FAB para organização com código válido e não carregando', () => {
    const s = computeFabState('organization', '123456789', false)
    expect(s.enabled).toBe(true)
    expect(s.reason).toBeUndefined()
  })

  it('habilita FAB para colaborador com código válido', () => {
    const s = computeFabState('collaborator', '123456789', false)
    expect(s.enabled).toBe(true)
    expect(s.reason).toBeUndefined()
  })

  it('desabilita FAB para código inválido', () => {
    const s = computeFabState('organization', '12', false)
    expect(s.enabled).toBe(false)
    expect(s.reason).toBeDefined()
  })

  it('desabilita FAB durante carregamento', () => {
    const s = computeFabState('organization', '123456789', true)
    expect(s.enabled).toBe(false)
    expect(s.reason).toBeDefined()
  })
})
