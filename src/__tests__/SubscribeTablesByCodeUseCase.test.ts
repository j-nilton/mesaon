import { describe, it, expect, vi } from 'vitest'
import { SubscribeTablesByCodeUseCase } from '@/usecase/SubscribeTablesByCodeUseCase'
import { Table } from '@/model/entities/Table'

describe('SubscribeTablesByCodeUseCase', () => {
  it('lança erro para código inválido', () => {
    const service = { subscribeByAccessCode: vi.fn() } as any
    const uc = new SubscribeTablesByCodeUseCase(service)
    expect(() => uc.execute('123', vi.fn())).toThrowError(/Código de acesso inválido/)
  })

  it('assina alterações para código válido', () => {
    const service = { subscribeByAccessCode: vi.fn((code: string, cb: (t: Table[]) => void) => {
      cb([{ id: '1', name: 'Mesa 1', accessCode: code } as any])
      return vi.fn()
    }) } as any
    const uc = new SubscribeTablesByCodeUseCase(service)
    const onChange = vi.fn()
    const unsub = uc.execute('123456789', onChange)
    expect(service.subscribeByAccessCode).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith([{ id: '1', name: 'Mesa 1', accessCode: '123456789' } as any])
    expect(typeof unsub).toBe('function')
  })
})

