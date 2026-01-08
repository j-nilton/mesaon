import { AccessCodeService } from '../../../model/services/AccessCodeService'
import { Organization } from '../../../model/entities/Organization'
import { User } from '../../../model/entities/User'
import { firestore } from './config'
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore'

// Serviço para gerenciar códigos de acesso no Firebase
export class AccessCodeServiceFirebase implements AccessCodeService {
  // Gera um código único de acesso de 9 dígitos
  async generateUniqueCode(): Promise<string> {
    // Gera 9 dígitos e garante unicidade verificando no Firestore
    while (true) {
      const code = Math.floor(100000000 + Math.random() * 900000000).toString();
      const exists = await this.getOrganizationByCode(code);
      if (!exists) {
        return code;
      }
    }
  }

  // Cria uma organização com um código de acesso único
  async createOrganizationWithCode(code: string, owner?: User): Promise<Organization> {
    // Cria uma referência para o documento da organização no Firestore
    const ref = doc(firestore, 'organizations', code);
    const now = Date.now();
    // Cria uma organização com os dados fornecidos
    const org: Organization = {
      id: code,
      accessCode: code,
      createdAt: now,
      ownerUserId: owner?.id,
      name: owner?.name,
      ownerEmail: owner?.email,
    }
    // Salva a organização no Firestore
    await setDoc(ref, org);
    return org;
  }

  // Obtém uma organização pelo seu código de acesso
  async getOrganizationByCode(code: string): Promise<Organization | null> {
    // Obtém o documento da organização no Firestore
    const snap = await getDoc(doc(firestore, 'organizations', code));
    // Se o documento não existir, retorna null
    if (!snap.exists()){
      return null;
    }
    // Retorna os dados da organização
    return snap.data() as Organization;
  }

  // Exclui uma organização pelo seu código de acesso
  async deleteOrganizationByCode(code: string): Promise<void> {
    // Exclui o documento da organização no Firestore
    await deleteDoc(doc(firestore, 'organizations', code));
  }

  // Atualiza o contador de membros de uma organização
  async updateMembersCount(code: string, delta: number): Promise<void> {
    // Cria uma referência para o documento da organização no Firestore
    const ref = doc(firestore, 'organizations', code);
    try {
      // Tenta incrementar o contador de membros com o delta fornecido
      await updateDoc(ref, { membersCount: increment(delta) });
    } catch {
      // Se ocorrer um erro, define o contador de membros para o valor absoluto do delta
      await setDoc(ref, { membersCount: delta }, { merge: true });
    }
  }
}
