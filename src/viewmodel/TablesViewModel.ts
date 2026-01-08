import { useEffect, useMemo, useState } from 'react'
import { ListTablesByCodeUseCase } from '../usecase/ListTablesByCodeUseCase'
import { CreateTableUseCase } from '../usecase/CreateTableUseCase'
import { UpdateTableUseCase } from '../usecase/UpdateTableUseCase'
import { DeleteTableUseCase } from '../usecase/DeleteTableUseCase'
import { Table } from '../model/entities/Table'

export function useTablesViewModel(
  listUC: ListTablesByCodeUseCase,
  createUC: CreateTableUseCase,
  updateUC: UpdateTableUseCase,
  deleteUC: DeleteTableUseCase,
  accessCode?: string,
  subscribeUC?: { execute: (code: string, onChange: (items: Table[]) => void) => () => void }
) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [nameInput, setNameInput] = useState('')

  const load = async () => {
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

  const refresh = async () => {
    if (!accessCode) return
    try {
      const items = await listUC.execute(accessCode)
      setTables(items)
    } catch (e: any) {
      // mantém erro silencioso para evitar "piscar"
    }
  }

  const create = async () => {
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

  const release = async (id: string) => {
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

  const remove = async (id: string) => {
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

  return {
    tables,
    loading,
    errorMessage,
    nameInput,
    setNameInput,
    load,
    refresh,
    create,
    release,
    remove,
    canCreate,
  }
}
