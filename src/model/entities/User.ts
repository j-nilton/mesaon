export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'organization' | 'collaborator';
  organizationId?: string;
}
