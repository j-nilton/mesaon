import { Organization } from '../entities/Organization';
import { User } from '../entities/User';

//Contrato de Serviço para Geração de Código de Acesso
export interface AccessCodeService {
  //Método para gerar um código de acesso único
  generateUniqueCode(): Promise<string>;

  //Método para criar uma organização com um código de acesso
  createOrganizationWithCode(code: string, owner?: User): Promise<Organization>;

  //Método para obter uma organização por código de acesso
  getOrganizationByCode(code: string): Promise<Organization | null>;

  //Método para excluir uma organização por código de acesso
  deleteOrganizationByCode(code: string): Promise<void>;

  //Método para atualizar o contador de membros de uma organização por código de acesso
  updateMembersCount(code: string, delta: number): Promise<void>;
}
