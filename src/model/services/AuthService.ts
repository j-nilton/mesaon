import { User } from '../entities/User';

//Contrato de Serviço para Autenticação
export interface AuthService {

  //Método para fazer login com e-mail e senha
  login(email: string, pass: string): Promise<User>;

  //Método para registrar um novo usuário com nome, e-mail e senha
  register(name: string, email: string, pass: string): Promise<User>;

  //Método para fazer logout do usuário
  logout(): Promise<void>;

  //Método para obter o usuário atual autenticado
  getCurrentUser(): Promise<User | null>;

  //Método para associar um usuário a uma organização
  setUserOrganization(userId: string, organizationId: string): Promise<void>;

  //Método para definir a role de um usuário (organização ou colaborador)
  setUserRole(userId: string, role: 'organization' | 'collaborator'): Promise<void>;

  //Método para adicionar um código de acesso ao histórico de um usuário
  addCodeToHistory(userId: string, code: string): Promise<void>;

  //Método para obter o perfil de um usuário
  getUserProfile(userId: string): Promise<User | null>;

  //Método para obter o histórico de códigos de acesso de um usuário  
  getCodeHistory(userId: string): Promise<Array<{ code: string; at: number }>>;

  //Método para redefinir a senha de um usuário
  resetPassword(email: string): Promise<void>;

  //Método para enviar um e-mail de verificação para um usuário
  sendVerificationEmail(): Promise<void>;

  //Método para recarregar os dados do usuário autenticado
  reloadUser(): Promise<void>;
}
