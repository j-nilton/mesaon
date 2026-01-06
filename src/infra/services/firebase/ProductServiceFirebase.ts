import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import { firestore } from './config'
import { Product, ProductCategory } from '../../../model/entities/Product'
import { ProductService } from '../../../model/services/ProductService'

export class ProductServiceFirebase implements ProductService {
  async listByAccessCode(accessCode: string, q?: string, category?: ProductCategory): Promise<Product[]> {
    const col = collection(firestore, 'products')
    const clauses = [where('accessCode', '==', accessCode)]
    if (category) clauses.push(where('category', '==', category))
    const snapshot = await getDocs(query(col, ...clauses))
    let items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Product[]
    if (q) {
      const s = q.trim().toLowerCase()
      items = items.filter(p => p.name.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s))
    }
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }

  async create(accessCode: string, input: Omit<Product, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = Date.now()
    const payload = { ...input, accessCode, createdAt: now }
    const col = collection(firestore, 'products')
    const ref = await addDoc(col, payload)
    const snap = await getDoc(ref)
    return { id: ref.id, ...(snap.data() as any) } as Product
  }

  async update(id: string, changes: Partial<Omit<Product, 'id' | 'accessCode' | 'createdAt'>>): Promise<Product> {
    const ref = doc(firestore, 'products', id)
    await updateDoc(ref, { ...changes, updatedAt: Date.now() })
    const snap = await getDoc(ref)
    return { id, ...(snap.data() as any) } as Product
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(firestore, 'products', id))
  }
}
