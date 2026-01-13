import { vi } from 'vitest'
import { AuthService } from '../../model/services/AuthService'
import { ProductService } from '../../model/services/ProductService'
import { TableService } from '../../model/services/TableService'
import { AccessCodeService } from '../../model/services/AccessCodeService'

export const createMockAuthService = (): AuthService => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  setUserOrganization: vi.fn(),
  setUserRole: vi.fn(),
  addCodeToHistory: vi.fn(),
  getUserProfile: vi.fn(),
  getCodeHistory: vi.fn(),
  resetPassword: vi.fn(),
  sendVerificationEmail: vi.fn(),
  reloadUser: vi.fn(),
})

export const createMockProductService = (): ProductService => ({
  listByAccessCode: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
})

export const createMockTableService = (): TableService => ({
  listByAccessCode: vi.fn(),
  create: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  subscribeByAccessCode: vi.fn(),
})

export const createMockAccessCodeService = (): AccessCodeService => ({
  generateUniqueCode: vi.fn(),
  createOrganizationWithCode: vi.fn(),
  getOrganizationByCode: vi.fn(),
  deleteOrganizationByCode: vi.fn(),
  updateMembersCount: vi.fn(),
})
