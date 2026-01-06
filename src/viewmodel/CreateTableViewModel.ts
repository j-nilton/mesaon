import { useState } from 'react'
import { CreateTableUseCase } from '../usecase/CreateTableUseCase'
import { TableOrder } from '../model/entities/Table'

export function useCreateTableViewModel(createUC: CreateTableUseCase, accessCode?: string) {
  const [name, setName] = useState('')
  const [waiterName, setWaiterName] = useState('')
  const [notes, setNotes] = useState('')
  const [orders, setOrders] = useState<TableOrder[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const addOrder = (o: Omit<TableOrder, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 8)
    setOrders(prev => [...prev, { id, ...o }])
  }
  const removeOrder = (id: string) => setOrders(prev => prev.filter(x => x.id !== id))

  const open = () => setIsOpen(true)
  const close = () => {
    setIsOpen(false)
    setErrorMessage('')
  }

  const total = orders.reduce((acc, it) => acc + it.price * it.quantity, 0)
  const canSubmit = !!accessCode && /^\d{9}$/.test(accessCode) && !!name.trim()

  const submit = async () => {
    if (!accessCode) return
    setIsLoading(true)
    setErrorMessage('')
    try {
      const created = await createUC.execute(accessCode, { name, waiterName, notes, orders })
      close()
      setName('')
      setWaiterName('')
      setNotes('')
      setOrders([])
      return created
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao criar mesa.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    name, setName,
    waiterName, setWaiterName,
    notes, setNotes,
    orders, addOrder, removeOrder,
    isOpen, open, close,
    isLoading, errorMessage,
    total, canSubmit, submit,
  }
}

