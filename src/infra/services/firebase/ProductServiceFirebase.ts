import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import { firestore } from './config'
import { Product, ProductCategory } from '../../../model/entities/Product'
import { ProductService } from '../../../model/services/ProductService'

// Serviço de Produtos Firebase
export class ProductServiceFirebase implements ProductService {
  // Método para listar produtos por código de acesso
  async listByAccessCode(accessCode: string, q?: string, category?: ProductCategory): Promise<Product[]> {
    const col = collection(firestore, 'products');
    const clauses = [where('accessCode', '==', accessCode)];
    // Adiciona a cláusula de categoria se fornecida
    if (category){
      clauses.push(where('category', '==', category));
    }
    const snapshot = await getDocs(query(col, ...clauses));
    let items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Product[];
    // Filtra os itens pelo termo de busca, se fornecido
    if (q) {
      const s = q.trim().toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
    }
    // Ordena os itens por data de criação, do mais recente ao mais antigo
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  // Método para criar um novo produto  
  async create(accessCode: string, input: Omit<Product, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = Date.now()
    // Prepara o payload para criação do produto
    const payload = { ...input, accessCode, createdAt: now };
    const col = collection(firestore, 'products');
    const ref = await addDoc(col, payload);
    const snap = await getDoc(ref);
    return { id: ref.id, ...(snap.data() as any) } as Product;
  }

  // Método para atualizar um produto existente
  async update(id: string, changes: Partial<Omit<Product, 'id' | 'accessCode' | 'createdAt'>>): Promise<Product> {
    const ref = doc(firestore, 'products', id);
    await updateDoc(ref, { ...changes, updatedAt: Date.now() });
    const snap = await getDoc(ref);
    return { id, ...(snap.data() as any) } as Product;
  }

  // Método para excluir um produto
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(firestore, 'products', id));
  }
}
