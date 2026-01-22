export interface PriceRange {
  min?: number
  max?: number
}

export const formatCurrency = (value: number): string => {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0)
  return formatted.replace(/\u00A0/g, ' ')
}

export const getTotalSafe = (total?: number): number => {
  return typeof total === 'number' && isFinite(total) ? total : 0
}

export const sortTablesByPrice = <T extends { total?: number }>(
  tables: ReadonlyArray<T>,
  ascending: boolean
): T[] => {
  const copy = [...tables]
  copy.sort((a, b) => {
    const av = getTotalSafe(a.total)
    const bv = getTotalSafe(b.total)
    return ascending ? av - bv : bv - av
  })
  return copy
}

export const filterTablesByPriceRange = <T extends { total?: number }>(
  tables: ReadonlyArray<T>,
  min?: number,
  max?: number
): T[] => {
  return tables.filter(t => {
    const v = getTotalSafe(t.total)
    if (typeof min === 'number' && v < min) return false
    if (typeof max === 'number' && v > max) return false
    return true
  })
}
