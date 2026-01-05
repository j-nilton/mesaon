//Contrato de Usuário como organização
export interface Organization {
  id: string;
  accessCode: string;
  name?: string;
  createdAt: number;
  ownerUserId?: string;
  ownerEmail?: string;
}

