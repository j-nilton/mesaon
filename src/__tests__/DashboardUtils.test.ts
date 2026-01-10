
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { calculateMenuPosition, shouldShowFab, handlePopupClose } from '../viewmodel/DashboardUtils'

describe('DashboardUtils', () => {
  describe('calculateMenuPosition', () => {
    it('posiciona menu abaixo (topo alinhado) quando não é o último item', () => {
      const screenHeight = 800
      const screenWidth = 400
      const anchor = { x: 350, y: 100, width: 30, height: 30 }
      
      const pos = calculateMenuPosition(anchor, screenHeight, screenWidth, false)
      
      expect(pos.top).toBe(100) // Aligns with anchor top
      expect(pos.bottom).toBeUndefined()
      expect(pos.right).toBe(20) // 400 - (350 + 30)
    })

    it('posiciona menu acima (fundo alinhado) quando é o último item', () => {
      const screenHeight = 800
      const screenWidth = 400
      // Anchor near bottom: y = 700
      const anchor = { x: 350, y: 700, width: 30, height: 30 }
      
      const pos = calculateMenuPosition(anchor, screenHeight, screenWidth, true)
      
      expect(pos.top).toBeUndefined()
      expect(pos.bottom).toBe(70) // 800 - (700 + 30) = 70. Aligns with anchor bottom.
      expect(pos.right).toBe(20)
    })

    it('força menu para cima quando é o último item, mesmo com espaço abaixo', () => {
      const screenHeight = 800
      const screenWidth = 400
      const anchor = { x: 350, y: 100, width: 30, height: 30 } // High up
      
      const pos = calculateMenuPosition(anchor, screenHeight, screenWidth, true)
      
      expect(pos.top).toBeUndefined()
      expect(pos.bottom).toBe(670) // 800 - (100 + 30)
    })
  })

  describe('shouldShowFab', () => {
    it('mostra FAB se conteúdo for menor que a tela', () => {
      // Content 500, Layout 800 -> No scroll
      expect(shouldShowFab(500, 800, 0)).toBe(true)
    })

    it('mostra FAB se rolando e longe do fim', () => {
      // Content 1000, Layout 800, Offset 0 -> Top
      expect(shouldShowFab(1000, 800, 0)).toBe(true)
    })

    it('esconde FAB se rolando e perto do fim', () => {
      // Content 1000, Layout 800
      // Offset 190 -> 190 + 800 = 990. 1000 - 24 = 976. 990 > 976 -> Hide
      expect(shouldShowFab(1000, 800, 190)).toBe(false)
    })
  })

  describe('handlePopupClose', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('deve fechar o popup após o delay especificado', () => {
      const setOpen = vi.fn()
      handlePopupClose(setOpen, 100)
      
      expect(setOpen).not.toHaveBeenCalled()
      vi.advanceTimersByTime(100)
      expect(setOpen).toHaveBeenCalledWith(false)
    })

    it('deve usar o delay padrão de 100ms se não especificado', () => {
      const setOpen = vi.fn()
      handlePopupClose(setOpen)
      
      expect(setOpen).not.toHaveBeenCalled()
      vi.advanceTimersByTime(100)
      expect(setOpen).toHaveBeenCalledWith(false)
    })
  })
})
