import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FirebaseAuthService } from '@/infra/services/firebase/FirebaseAuthService'
import { AuthError } from '@/model/errors/AppError'

// ==============================
// MOCKS DO FIREBASE AUTH
// ==============================

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
}))

// ==============================
// MOCKS DO FIRESTORE
// ==============================

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
}))

vi.mock('@/infra/services/firebase/config', () => ({
  auth: {
    currentUser: null,
  },
  firestore: {},
}))

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore'

// ==============================
// TESTES
// ==============================

describe('FirebaseAuthService', () => {
  let service: FirebaseAuthService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new FirebaseAuthService()
  })

  // ------------------------------
  // login
  // ------------------------------
  it('deve realizar login com sucesso.', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: {
        uid: 'user-1',
        email: 'teste@email.com',
        displayName: 'Teste',
        emailVerified: true,
      },
    } as any)

    const user = await service.login('teste@email.com', '123456')

    expect(user.id).toBe('user-1')
    expect(user.email).toBe('teste@email.com')
    expect(user.name).toBe('Teste')
  })

  it('deve lançar AuthError quando o login falhar.', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: 'auth/wrong-password' })

    await expect(
      service.login('x@email.com', 'errada')
    ).rejects.toBeInstanceOf(AuthError)
  })

  // ------------------------------
  // register
  // ------------------------------
  it('deve registrar um usuário com sucesso.', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: {
        uid: 'user-2',
        emailVerified: false,
      },
    } as any)

    const user = await service.register('João', 'joao@email.com', '123456')

    expect(updateProfile).toHaveBeenCalled()
    expect(setDoc).toHaveBeenCalled()
    expect(user.name).toBe('João')
  })

  // ------------------------------
  // logout
  // ------------------------------
  it('deve realizar logout', async () => {
    await service.logout()
    expect(signOut).toHaveBeenCalled()
  })

  // ------------------------------
  // getCurrentUser
  // ------------------------------
  it.skip('deve retornar o usuário atual se existir.', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_, callback: any) => {
      callback({
        uid: 'user-3',
        email: 'u@email.com',
        displayName: 'User',
        emailVerified: true,
      })
      return () => {}
    })

    const user = await service.getCurrentUser()

    expect(user?.id).toBe('user-3')
  })

  it.skip('deve retornar null quando não houver usuário autenticado.', async () => {
    vi.mocked(onAuthStateChanged).mockImplementation((_, callback: any) => {
      callback(null)
      return () => {}
    })

    const user = await service.getCurrentUser()

    expect(user).toBeNull()
  })

  // ------------------------------
  // setUserOrganization
  // ------------------------------
  it('deve definir o organizationId do usuário.', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: (): any => false,
    } as any)

    await service.setUserOrganization('user-1', 'org-1')

    expect(setDoc).toHaveBeenCalled()
  })

  // ------------------------------
  // addCodeToHistory
  // ------------------------------
  it('deve adicionar código ao histórico do usuário.', async () => {
    await service.addCodeToHistory('user-1', '123456789')

    expect(addDoc).toHaveBeenCalled()
  })

  // ------------------------------
  // resetPassword
  // ------------------------------
  it('deve enviar e-mail de recuperação de senha.', async () => {
    await service.resetPassword('email@email.com')

    expect(sendPasswordResetEmail).toHaveBeenCalled()
  })

  it('deve lançar erro se redefinição de senha falhar.', async () => {
    vi.mocked(sendPasswordResetEmail).mockRejectedValue({ code: 'auth/invalid-email' })

    await expect(
      service.resetPassword('invalido')
    ).rejects.toBeInstanceOf(AuthError)
  })

  // ------------------------------
  // sendVerificationEmail
  // ------------------------------
  it('deve lançar erro se não houver usuário autenticado.', async () => {
    await expect(
      service.sendVerificationEmail()
    ).rejects.toBeInstanceOf(AuthError)
  })
})
