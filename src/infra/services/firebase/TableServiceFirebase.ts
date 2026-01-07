import { collection, addDoc, getDocs, query, where, getDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from './config';
import { Table, TableOrder } from '../../../model/entities/Table';
import { TableService } from '../../../model/services/TableService';

// Implementação do serviço de tabelas usando Firebase Firestore
export class TableServiceFirebase implements TableService {
  // Método para listar todas as mesas associadas a um código de acesso
  async listByAccessCode(accessCode: string): Promise<Table[]> {
    const col = collection(firestore, 'tables');
    const snapshot = await getDocs(query(col, where('accessCode', '==', accessCode)));
    const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Table[];
    return items.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }

  // Método para criar uma nova mesa
  async create(accessCode: string, data: { name: string; waiterName?: string; notes?: string; orders?: TableOrder[] }): Promise<Table> {
    const now = Date.now();
    const total = (data.orders || []).reduce((acc, it) => acc + it.price * it.quantity, 0);
    const payload: any = { accessCode, name: data.name, orders: data.orders || [], total, createdAt: now };
    if (data.waiterName){
      payload.waiterName = data.waiterName;
    } 
    if (data.notes){
      payload.notes = data.notes;
    } 
    //Criar a mesa no Firestore
    const ref = await addDoc(collection(firestore, 'tables'), payload);
    const snap = await getDoc(ref);
    return { id: ref.id, ...(snap.data() as any) } as Table;
  }

  // Método para recuperar uma mesa por ID
  async getById(id: string): Promise<Table | null> {
    //Recuperar a mesa do Firestore
    const ref = doc(firestore, 'tables', id);
    const snap = await getDoc(ref)
    if (!snap.exists()){
      return null;
    } 
    return { id, ...(snap.data() as any) } as Table;
  }

  // Método para atualizar uma mesa existente
  async update(id: string, changes: Partial<Omit<Table, 'id' | 'accessCode' | 'createdAt'>>): Promise<Table> {
    const ref = doc(firestore, 'tables', id);
    const currentSnap = await getDoc(ref);

    // Verificar se a mesa existe
    if (!currentSnap.exists()){
      throw new Error('Mesa não encontrada.');
    } 
    // Atualizar os campos da mesa
    const current = currentSnap.data() as any
    let orders;
    if (changes.orders !== undefined) {
      orders = changes.orders;
    } else {
      orders = current.orders || [];
    }
    // Calcular o total com base nos pedidos atualizados
    const total = orders.reduce((acc: number, it: TableOrder) => acc + it.price * it.quantity, 0);
    const payload = { ...changes, total, updatedAt: Date.now() };
    await updateDoc(ref, payload as any);
    const updatedSnap = await getDoc(ref);
    return { id, ...(updatedSnap.data() as any) } as Table;
  }

  // Método para excluir uma mesa existente
  async delete(id: string): Promise<void> {
    const ref = doc(firestore, 'tables', id);
    await deleteDoc(ref);
  }
  // Método para assinar mudanças em uma mesa por código de acesso
  subscribeByAccessCode(accessCode: string, onChange: (items: Table[]) => void): () => void {
    const col = collection(firestore, 'tables');
    const q = query(col, where('accessCode', '==', accessCode));
    // Assinar mudanças na coleção de mesas filtrada por código de acesso
    const unsub = onSnapshot(q, (snapshot) => {
      // Mapear os documentos do snapshot para objetos Table
      const items = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Table[];
      // Ordenar as mesas por createdAt
      const sorted = items.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      // Chamar o callback com as mesas ordenadas
      onChange(sorted);
    })
    return unsub;
  }
}
