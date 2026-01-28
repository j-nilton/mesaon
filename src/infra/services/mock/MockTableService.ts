import { TableService } from '../../../model/services/TableService';
import { Table, TableOrder } from '../../../model/entities/Table';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_TABLES = '@mock_tables';

export class MockTableService implements TableService {
  private tables: Table[] = [];
  private listeners: Map<string, ((items: Table[]) => void)[]> = new Map();
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_TABLES);
      if (json) {
        this.tables = JSON.parse(json);
      }
    } catch (e) {
      console.warn('Falha ao carregar mock tables', e);
    }
    this.initialized = true;
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(this.tables));
    } catch (e) {
      console.warn('Falha ao persistir mock tables', e);
    }
  }

  async listByAccessCode(accessCode: string): Promise<Table[]> {
    await this.init();
    return this.tables.filter(t => t.accessCode === accessCode);
  }

  async create(accessCode: string, data: { name: string; waiterName?: string; notes?: string; orders?: TableOrder[] }): Promise<Table> {
    await this.init();
    const newTable: Table = {
      id: Math.random().toString(36).substring(7),
      accessCode,
      name: data.name,
      waiterName: data.waiterName,
      notes: data.notes,
      orders: data.orders || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.tables.push(newTable);
    await this.persist();
    this.notify(accessCode);
    return newTable;
  }

  async getById(id: string): Promise<Table | null> {
    await this.init();
    return this.tables.find(t => t.id === id) || null;
  }

  async update(id: string, changes: Partial<Omit<Table, 'id' | 'accessCode' | 'createdAt'>>): Promise<Table> {
    await this.init();
    const index = this.tables.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Mesa não encontrada');
    
    this.tables[index] = { ...this.tables[index], ...changes, updatedAt: Date.now() };
    await this.persist();
    this.notify(this.tables[index].accessCode);
    return this.tables[index];
  }

  async delete(id: string): Promise<void> {
    await this.init();
    const table = this.tables.find(t => t.id === id);
    if (table) {
      this.tables = this.tables.filter(t => t.id !== id);
      await this.persist();
      this.notify(table.accessCode);
    }
  }

  subscribeByAccessCode(accessCode: string, onChange: (items: Table[]) => void): () => void {
    const current = this.listeners.get(accessCode) || [];
    current.push(onChange);
    this.listeners.set(accessCode, current);
    
    // Garante inicialização antes de notificar
    this.init().then(() => {
        onChange(this.tables.filter(t => t.accessCode === accessCode));
    });

    return () => {
      const list = this.listeners.get(accessCode);
      if (list) {
        this.listeners.set(accessCode, list.filter(l => l !== onChange));
      }
    };
  }

  private notify(accessCode: string) {
    const list = this.listeners.get(accessCode);
    if (list) {
      const items = this.tables.filter(t => t.accessCode === accessCode);
      list.forEach(cb => cb(items));
    }
  }
}