import { useEffect, useMemo, useState } from 'react'
import { Table, TableOrder } from '../model/entities/Table'
import { GetTableByIdUseCase } from '../usecase/GetTableByIdUseCase'
import { UpdateTableUseCase } from '../usecase/UpdateTableUseCase'
import { DeleteTableUseCase } from '../usecase/DeleteTableUseCase'
import { ListProductsByCodeUseCase } from '../usecase/ListProductsByCodeUseCase'

export interface TableDetailsViewModel {
  table: Table | null;
  loading: boolean;
  errorMessage: string;
  orders: TableOrder[];
  products: { id: string; name: string; price: number; category: string }[];
  showAddModal: boolean;
  setShowAddModal: (v: boolean) => void;
  addOrder: (productId: string, quantity: number) => void;
  removeOrder: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: number;
  save: () => Promise<void>;
  release: () => Promise<void>;
  removeTable: () => Promise<void>;
  load: () => Promise<void>;
}

export function useTableDetailsViewModel(
  getUC: GetTableByIdUseCase,
  updateUC: UpdateTableUseCase,
  deleteUC: DeleteTableUseCase,
  listProductsUC: ListProductsByCodeUseCase,
  tableId: string,
  accessCode?: string
): TableDetailsViewModel {
  const [table, setTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [orders, setOrders] = useState<TableOrder[]>([])
  const [products, setProducts] = useState<{ id: string; name: string; price: number; category: string }[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const load = async (): Promise<void> => {
    setLoading(true)
    setErrorMessage('')
    try {
      const t = await getUC.execute(tableId)
      setTable(t)
      setOrders(t?.orders || [])
      if (accessCode) {
        const items = await listProductsUC.execute(accessCode, '', undefined)
        setProducts(items.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category } as any)))
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao carregar mesa.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, accessCode])

  const addOrder = (productId: string, quantity: number): void => {
    const p = products.find(x => x.id === productId)
    if (!p) return
    const id = Math.random().toString(36).slice(2, 8)
    setOrders(prev => [...prev, { id, name: p.name, price: p.price, quantity }])
  }
  const removeOrder = (id: string): void => setOrders(prev => prev.filter(x => x.id !== id))
  const updateQuantity = (id: string, quantity: number): void => setOrders(prev => prev.map(o => (o.id === id ? { ...o, quantity } : o)))

  const total = useMemo(() => orders.reduce((acc, it) => acc + it.price * it.quantity, 0), [orders])

  const save = async (): Promise<void> => {
    if (!table) return
    setLoading(true)
    setErrorMessage('')
    try {
      const updated = await updateUC.execute(table.id, { orders })
      setTable(updated)
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao salvar mesa.')
    } finally {
      setLoading(false)
    }
  }

  const release = async (): Promise<void> => {
    if (!table) return
    setLoading(true)
    setErrorMessage('')
    try {
      const updated = await updateUC.execute(table.id, { orders: [] })
      setTable(updated)
      setOrders([])
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao liberar mesa.')
    } finally {
      setLoading(false)
    }
  }

  const removeTable = async (): Promise<void> => {
    if (!table) return
    setLoading(true)
    setErrorMessage('')
    try {
      await deleteUC.execute(table.id)
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao excluir mesa.')
    } finally {
      setLoading(false)
    }
  }

  return {
    table,
    loading,
    errorMessage,
    orders,
    products,
    showAddModal,
    setShowAddModal,
    addOrder,
    removeOrder,
    updateQuantity,
    total,
    save,
    release,
    removeTable,
    load,
  }
}
