import { ProductService } from '../../../model/services/ProductService';
import { Product, ProductCategory } from '../../../model/entities/Product';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PRODUCTS = '@mock_products';

export class MockProductService implements ProductService {
  private products: Product[] = [];
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (json) {
        this.products = JSON.parse(json);
      }
    } catch (e) {
      console.warn('Falha ao carregar mock products', e);
    }
    this.initialized = true;
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.warn('Falha ao persistir mock products', e);
    }
  }

  async listByAccessCode(accessCode: string, query?: string, category?: ProductCategory): Promise<Product[]> {
    await this.init();
    let result = this.products.filter(p => p.accessCode === accessCode);
    
    if (category) {
      result = result.filter(p => p.category === category);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lowerQuery) || p.description?.toLowerCase().includes(lowerQuery));
    }
    
    return result;
  }

  async create(accessCode: string, input: Omit<Product, 'id' | 'accessCode' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await this.init();
    const newProduct: Product = {
      ...input,
      id: Math.random().toString(36).substring(7),
      accessCode,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.products.push(newProduct);
    await this.persist();
    return newProduct;
  }

  async update(id: string, changes: Partial<Omit<Product, 'id' | 'accessCode' | 'createdAt'>>): Promise<Product> {
    await this.init();
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    
    this.products[index] = { ...this.products[index], ...changes, updatedAt: Date.now() };
    await this.persist();
    return this.products[index];
  }

  async delete(id: string): Promise<void> {
    await this.init();
    this.products = this.products.filter(p => p.id !== id);
    await this.persist();
  }
}