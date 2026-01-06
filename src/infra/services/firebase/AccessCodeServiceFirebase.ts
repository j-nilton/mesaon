import { AccessCodeService } from '../../../model/services/AccessCodeService'
import { Organization } from '../../../model/entities/Organization'
import { User } from '../../../model/entities/User'
import { firestore } from './config'
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore'

export class AccessCodeServiceFirebase implements AccessCodeService {
  async generateUniqueCode(): Promise<string> {
    // Gera 9 dígitos e garante unicidade verificando no Firestore
    while (true) {
      const code = Math.floor(100000000 + Math.random() * 900000000).toString()
      const exists = await this.getOrganizationByCode(code)
      if (!exists) return code
    }
  }

  async createOrganizationWithCode(code: string, owner?: User): Promise<Organization> {
    const ref = doc(firestore, 'organizations', code)
    const now = Date.now()
    const org: Organization = {
      id: code,
      accessCode: code,
      createdAt: now,
      ownerUserId: owner?.id,
      name: owner?.name,
      ownerEmail: owner?.email,
    }
    await setDoc(ref, org)
    return org
  }

  async getOrganizationByCode(code: string): Promise<Organization | null> {
    const snap = await getDoc(doc(firestore, 'organizations', code))
    if (!snap.exists()) return null
    return snap.data() as Organization
  }

  async deleteOrganizationByCode(code: string): Promise<void> {
    await deleteDoc(doc(firestore, 'organizations', code))
  }

  async updateMembersCount(code: string, delta: number): Promise<void> {
    const ref = doc(firestore, 'organizations', code)
    try {
      await updateDoc(ref, { membersCount: increment(delta) })
    } catch {
      await setDoc(ref, { membersCount: delta }, { merge: true })
    }
  }
}
