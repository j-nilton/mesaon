import { AuthService } from '../../../model/services/AuthService';
import { User } from '../../../model/entities/User';
import { AuthError } from '../../../model/errors/AppError';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_USERS = '@mock_users';
const STORAGE_KEY_SESSION = '@mock_session';
const STORAGE_KEY_HISTORY = '@mock_history';

export class MockAuthService implements AuthService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private codeHistory: Map<string, Array<{ code: string; at: number }>> = new Map();
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEY_USERS);
      if (usersJson) this.users = JSON.parse(usersJson);

      const sessionJson = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
      if (sessionJson) this.currentUser = JSON.parse(sessionJson);

      const historyJson = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (historyJson) {
        const rawHistory = JSON.parse(historyJson);
        this.codeHistory = new Map(rawHistory);
      }
    } catch (e) {
      console.warn('Falha ao carregar mock data', e);
    }
    this.initialized = true;
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
      if (this.currentUser) {
        await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
      }
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(Array.from(this.codeHistory.entries())));
    } catch (e) {
      console.warn('Falha ao persistir mock data', e);
    }
  }

  async login(email: string, pass: string): Promise<User> {
    await this.init();
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new AuthError('Usuário não encontrado.');
    }
    // Senha ignorada no mock, mas poderia ser validada se salva
    this.currentUser = user;
    await this.persist();
    return user;
  }

  async register(name: string, email: string, pass: string): Promise<User> {
    await this.init();
    if (this.users.find(u => u.email === email)) {
      throw new AuthError('Email já cadastrado.');
    }
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      emailVerified: true, // Auto-verificado para facilitar testes
      role: 'collaborator'
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    await this.persist();
    return newUser;
  }

  async logout(): Promise<void> {
    await this.init();
    this.currentUser = null;
    await this.persist();
  }

  async getCurrentUser(): Promise<User | null> {
    await this.init();
    return this.currentUser;
  }

  async setUserOrganization(userId: string, organizationId: string): Promise<void> {
    await this.init();
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.organizationId = organizationId;
      // Atualiza também o currentUser se for o mesmo
      if (this.currentUser?.id === userId) {
        this.currentUser.organizationId = organizationId;
      }
      await this.persist();
    }
  }

  async setUserRole(userId: string, role: 'organization' | 'collaborator'): Promise<void> {
    await this.init();
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      if (this.currentUser?.id === userId) {
        this.currentUser.role = role;
      }
      await this.persist();
    }
  }

  async addCodeToHistory(userId: string, code: string): Promise<void> {
    await this.init();
    const history = this.codeHistory.get(userId) || [];
    history.push({ code, at: Date.now() });
    this.codeHistory.set(userId, history);
    await this.persist();
  }

  async getUserProfile(userId: string): Promise<User | null> {
    await this.init();
    return this.users.find(u => u.id === userId) || null;
  }

  async getCodeHistory(userId: string): Promise<Array<{ code: string; at: number }>> {
    await this.init();
    return this.codeHistory.get(userId) || [];
  }

  async resetPassword(email: string): Promise<void> {
    await this.init();
    const user = this.users.find(u => u.email === email);
    if (!user) throw new AuthError('Email não encontrado.');
  }

  async sendVerificationEmail(): Promise<void> {
    // No-op para mock
  }

  async reloadUser(): Promise<void> {
    await this.init();
    // Re-fetch user data if needed
  }
}