import { Organization } from '../entities/Organization'
import { User } from '../entities/User'

export interface AccessCodeService {
  generateUniqueCode(): Promise<string>
  createOrganizationWithCode(code: string, owner?: User): Promise<Organization>
  getOrganizationByCode(code: string): Promise<Organization | null>
  deleteOrganizationByCode(code: string): Promise<void>
  updateMembersCount(code: string, delta: number): Promise<void>
}
