export type TableOrder = { id: string; name: string; price: number; quantity: number }
export type Table = {
  id: string
  accessCode: string
  name: string
  waiterName?: string
  notes?: string
  orders?: TableOrder[]
  total?: number
  createdAt: number
  updatedAt?: number
}
