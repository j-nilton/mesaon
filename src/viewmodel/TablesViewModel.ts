import { useEffect, useMemo, useState } from 'react'
import { ListTablesByCodeUseCase } from '../usecase/ListTablesByCodeUseCase'
import { CreateTableUseCase } from '../usecase/CreateTableUseCase'
import { UpdateTableUseCase } from '../usecase/UpdateTableUseCase'
import { DeleteTableUseCase } from '../usecase/DeleteTableUseCase'
import { Table } from '../model/entities/Table'

export interface TablesViewModel {
  tables: Table[];
  loading: boolean;
  errorMessage: string;
  nameInput: string;
  setNameInput: (v: string) => void;
  setQuery: (v: string) => void;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  create: () => Promise<void>;
  release: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  canCreate: boolean;
  clearAll: () => Promise<void>;
  canClearAll: boolean;
}

export function useTablesViewModel(
  listUC: ListTablesByCodeUseCase,
  createUC: CreateTableUseCase,
  updateUC: UpdateTableUseCase,
  deleteUC: DeleteTableUseCase,
  accessCode?: string,
  subscribeUC?: { execute: (code: string, onChange: (items: Table[]) => void) => () => void }
): TablesViewModel {
  const [tables, setTables] = useState<Table[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [nameInput, setNameInput] = useState('')

  const filteredTables = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tables
    return tables.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.waiterName || '').toLowerCase().includes(q)
    )
  }, [tables, query])

  const load = async (): Promise<void> => {
    if (!accessCode) return
    setLoading(true)
    setErrorMessage('')
    try {
      const items = await listUC.execute(accessCode)
      setTables(items)
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao carregar mesas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessCode])
  useEffect(() => {
    if (!accessCode || !subscribeUC) return
    let unsub: (() => void) | undefined
    try {
      unsub = subscribeUC.execute(accessCode, (items) => {
        setTables(items)
      })
    } catch {
      // fallback: polling
      const id = setInterval(() => {
        refresh()
      }, 4000)
      return () => clearInterval(id)
    }
    return () => {
      if (unsub) unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessCode, subscribeUC])

  const refresh = async (): Promise<void> => {
    if (!accessCode) return
    try {
      const items = await listUC.execute(accessCode)
      setTables(items)
    } catch (e: any) {
      // mantém erro silencioso para evitar "piscar"
    }
  }

  const create = async (): Promise<void> => {
    if (!accessCode) return
    setLoading(true)
    setErrorMessage('')
    try {
      const created = await createUC.execute(accessCode, { name: nameInput })
      setTables(prev => [...prev, created])
      setNameInput('')
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao criar mesa.')
    } finally {
      setLoading(false)
    }
  }

  const release = async (id: string): Promise<void> => {
    setLoading(true)
    setErrorMessage('')
    try {
      const updated = await updateUC.execute(id, { orders: [] })
      setTables(prev => prev.map(t => (t.id === id ? updated : t)))
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao liberar mesa.')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string): Promise<void> => {
    setLoading(true)
    setErrorMessage('')
    try {
      await deleteUC.execute(id)
      setTables(prev => prev.filter(t => t.id !== id))
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao excluir mesa.')
    } finally {
      setLoading(false)
    }
  }

  const canCreate = useMemo(() => !!nameInput.trim(), [nameInput])
  const canClearAll = useMemo(() => {
    return tables.some(t => (t.orders?.length || 0) > 0 || (t.total || 0) > 0)
  }, [tables])

  return {
    tables: filteredTables,
    loading,
    errorMessage,
    nameInput,
    setNameInput,
    setQuery,
    load,
    refresh,
    create,
    release,
    remove,
    canCreate,
    async clearAll() {
      setLoading(true)
      setErrorMessage('')
      try {
        const occupied = tables.filter(t => (t.orders?.length || 0) > 0 || (t.total || 0) > 0)
        const updatedList = await Promise.all(
          occupied.map(t => updateUC.execute(t.id, { orders: [] }))
        )
        setTables(prev =>
          prev.map(t => {
            const u = updatedList.find(x => x.id === t.id)
            return u ? u : t
          })
        )
      } catch (e: any) {
        setErrorMessage(e?.message || 'Falha ao liberar todas as mesas.')
      } finally {
        setLoading(false)
      }
    },
    canClearAll,
  }
}
