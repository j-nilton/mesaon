//Contrato de Usuário como colaborador
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'organization' | 'collaborator';
  organizationId?: string;
  emailVerified?: boolean;
}
