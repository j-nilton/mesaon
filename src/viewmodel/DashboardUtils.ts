
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export const calculateMenuPosition = (
  anchor: Rect,
  screenHeight: number,
  screenWidth: number,
  isLast: boolean
): { top?: number; bottom?: number; right: number } => {
  // Logic simplified: if it's one of the last cards, flip up. Otherwise, flip down.
  // This ensures deterministic behavior for the user.
  const isBottom = isLast
  
  // Align right edge of menu with right edge of anchor
  // The 'right' style property is the distance from the right edge of the screen
  const right = screenWidth - (anchor.x + anchor.width)
  
  return {
    // If not bottom (normal), top aligns with anchor top (overlapping)
    top: isBottom ? undefined : anchor.y,
    // If bottom (flip), bottom aligns with anchor bottom (overlapping)
    bottom: isBottom ? (screenHeight - (anchor.y + anchor.height)) : undefined,
    // Ensure the menu doesn't stick to the edge if the anchor is weirdly placed, 
    // but typically we trust the anchor. We can clamp it if needed.
    right: Math.max(0, right)
  }
}

export const shouldShowFab = (
  contentHeight: number,
  layoutHeight: number,
  offsetY: number
): boolean => {
  // If content fits in the screen (no scroll needed), always show FAB
  if (contentHeight <= layoutHeight) return true
  
  // If scrolling, hide when near bottom (24px threshold)
  return offsetY + layoutHeight < contentHeight - 24
}

export const handlePopupClose = (setOpen: (v: boolean) => void, delay: number = 100): void => {
  setTimeout(() => {
    setOpen(false)
  }, delay)
}
