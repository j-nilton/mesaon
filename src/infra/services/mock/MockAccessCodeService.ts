import { AccessCodeService } from '../../../model/services/AccessCodeService';
import { Organization } from '../../../model/entities/Organization';
import { User } from '../../../model/entities/User';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_ORGS = '@mock_orgs';

export class MockAccessCodeService implements AccessCodeService {
  private organizations: Map<string, Organization> = new Map();
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_ORGS);
      if (json) {
        const raw = JSON.parse(json);
        this.organizations = new Map(raw);
      }
    } catch (e) {
      console.warn('Falha ao carregar mock organizations', e);
    }
    this.initialized = true;
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ORGS, JSON.stringify(Array.from(this.organizations.entries())));
    } catch (e) {
      console.warn('Falha ao persistir mock organizations', e);
    }
  }

  async generateUniqueCode(): Promise<string> {
    await this.init();
    // Gera código de 9 dígitos
    let code = '';
    do {
      code = Math.floor(100000000 + Math.random() * 900000000).toString();
    } while (this.organizations.has(code));
    return code;
  }

  async createOrganizationWithCode(code: string, owner?: User): Promise<Organization> {
    await this.init();
    const org: Organization = {
      id: 'org_' + code,
      accessCode: code,
      ownerUserId: owner?.id || 'unknown',
      createdAt: Date.now()
    };
    this.organizations.set(code, org);
    await this.persist();
    return org;
  }

  async getOrganizationByCode(code: string): Promise<Organization | null> {
    await this.init();
    return this.organizations.get(code) || null;
  }

  async deleteOrganizationByCode(code: string): Promise<void> {
    await this.init();
    this.organizations.delete(code);
    await this.persist();
  }

  async updateMembersCount(code: string, delta: number): Promise<void> {
    await this.init();
    const org = this.organizations.get(code);
    if (org) {
      // org.membersCount = (org.membersCount || 0) + delta;
      // Se tiver campo membersCount na entidade Organization, descomentar
    }
  }
}