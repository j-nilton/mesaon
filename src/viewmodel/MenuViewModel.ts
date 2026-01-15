import { useEffect, useMemo, useState } from 'react'
import { ListProductsByCodeUseCase } from '../usecase/ListProductsByCodeUseCase'
import { CreateProductUseCase } from '../usecase/CreateProductUseCase'
import { UpdateProductUseCase } from '../usecase/UpdateProductUseCase'
import { DeleteProductUseCase } from '../usecase/DeleteProductUseCase'
import { Product, ProductCategory } from '../model/entities/Product'

export function computeFabState(role?: 'organization' | 'collaborator', accessCode?: string, loading?: boolean): { enabled: boolean; reason?: string } {
  const hasValidCode = !!accessCode && /^\d{9}$/.test(accessCode)
  if (loading) return { enabled: false, reason: 'Aguarde carregamento dos produtos' }
  if (!hasValidCode) return { enabled: false, reason: 'Código de acesso inválido ou ausente' }
  return { enabled: true }
}

export interface MenuViewModel {
  products: Product[];
  query: string;
  setQuery: (v: string) => void;
  category: ProductCategory;
  setCategory: (v: ProductCategory) => void;
  loading: boolean;
  errorMessage: string;
  formOpen: boolean;
  editing: Product | null;
  form: { name: string; description?: string; price: string; imageUrl?: string; category: ProductCategory };
  setField: (k: keyof { name: string; description?: string; price: string; imageUrl?: string; category: ProductCategory }, v: string) => void;
  openForm: (p?: Product) => void;
  closeForm: () => void;
  submit: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  fabEnabled: boolean;
  fabDisabledReason?: string;
}

export function useMenuViewModel(
  listUC: ListProductsByCodeUseCase,
  createUC: CreateProductUseCase,
  updateUC: UpdateProductUseCase,
  deleteUC: DeleteProductUseCase,
  accessCode?: string,
  role?: 'organization' | 'collaborator' | undefined
): MenuViewModel {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ProductCategory>('Bebidas')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<{ name: string; description?: string; price: string; imageUrl?: string; category: ProductCategory }>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'Bebidas',
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(p => {
      const byCategory = category ? p.category === category : true
      const byQuery = q ? p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) : true
      return byCategory && byQuery
    })
  }, [products, query, category])

  const { enabled: fabEnabled, reason: fabDisabledReason } = useMemo(
    () => computeFabState(role, accessCode, loading),
    [role, accessCode, loading]
  )

  const load = async (): Promise<void> => {
    if (!accessCode) return
    setLoading(true)
    setErrorMessage('')
    try {
      const items = await listUC.execute(accessCode, query, category)
      setProducts(items)
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao carregar o cardápio.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessCode, category])

  const openForm = (p?: Product): void => {
    setEditing(p || null)
    setForm({
      name: p?.name || '',
      description: p?.description || '',
      price: p ? String(p.price) : '',
      imageUrl: p?.imageUrl || '',
      category: p?.category || category,
    })
    setFormOpen(true)
  }
  const closeForm = (): void => {
    setFormOpen(false)
    setEditing(null)
  }
  const setField = (k: keyof typeof form, v: string): void => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (): Promise<void> => {
    if (!accessCode) return
    setLoading(true)
    setErrorMessage('')
    try {
      if (!form.category) {
        throw new Error('Selecione uma categoria.')
      }
      const priceNumber = Number(form.price)
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim(),
        price: priceNumber,
        imageUrl: form.imageUrl?.trim(),
        category: form.category,
      }
      if (editing) {
        const updated = await updateUC.execute(editing.id, payload)
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      } else {
        const created = await createUC.execute(accessCode, payload)
        setProducts(prev => [created, ...prev])
      }
      await load()
      closeForm()
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao salvar produto.')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string): Promise<void> => {
    setLoading(true)
    setErrorMessage('')
    try {
      await deleteUC.execute(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao excluir produto.')
    } finally {
      setLoading(false)
    }
  }

  return {
    products: filtered,
    query,
    setQuery,
    category,
    setCategory,
    loading,
    errorMessage,
    formOpen,
    editing,
    form,
    setField,
    openForm,
    closeForm,
    submit,
    remove,
    fabEnabled,
    fabDisabledReason,
  }
}
