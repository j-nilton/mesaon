import { User } from '../entities/User';

export interface AuthService {
  login(email: string, pass: string): Promise<User>;
  register(name: string, email: string, pass: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  setUserOrganization(userId: string, organizationId: string): Promise<void>;
  setUserRole(userId: string, role: 'organization' | 'collaborator'): Promise<void>;
  addCodeToHistory(userId: string, code: string): Promise<void>;
  getUserProfile(userId: string): Promise<User | null>;
  getCodeHistory(userId: string): Promise<Array<{ code: string; at: number }>>;
  resetPassword(email: string): Promise<void>;
}
