import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, firestore } from './config';
import { AuthService } from '../../../model/services/AuthService';
import { User } from '../../../model/entities/User';
import { AuthError } from '../../../model/errors/AppError';

// Serviço de Autenticação Firebase
export class FirebaseAuthService implements AuthService {
  // Método de login com email e senha
  async login(email: string, pass: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      // Buscar dados extras no Firestore (role, organizationId)
      // Por enquanto, retorna o básico se não tiver registro no banco
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || undefined,
        emailVerified: firebaseUser.emailVerified,
      };
    } catch (error: any) {
      throw new AuthError(this.mapFirebaseError(error.code), error.code);
    }
  }
  // Método de registro com email, senha e nome
  async register(name: string, email: string, pass: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      // Criar registro inicial no Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email: email,
        name: name,
        emailVerified: firebaseUser.emailVerified,
      };
      // Adiciona o novo usuário ao Firestore
      await setDoc(doc(firestore, 'users', newUser.id), newUser);

      return newUser;
    } catch (error: any) {
      throw new AuthError(this.mapFirebaseError(error.code), error.code);
    }
  }

  // Método de logout
  async logout(): Promise<void> {
    await signOut(auth);
  }
  // Método para obter o usuário atual
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          resolve({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || undefined,
            emailVerified: firebaseUser.emailVerified,
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  // Método para definir a organização do usuário
  async setUserOrganization(userId: string, organizationId: string): Promise<void> {
    const ref = doc(firestore, 'users', userId);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data() : {};
    await setDoc(ref, { ...current, organizationId }, { merge: true });
  }

  // Método para definir o papel do usuário (organization ou collaborator)
  async setUserRole(userId: string, role: 'organization' | 'collaborator'): Promise<void> {
    const ref = doc(firestore, 'users', userId);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data() : {};
    await setDoc(ref, { ...current, role }, { merge: true });
  }

  // Método para adicionar um código ao histórico do usuário
  async addCodeToHistory(userId: string, code: string): Promise<void> {
    const ref = collection(firestore, 'users', userId, 'codeHistory');
    await addDoc(ref, { code, at: Date.now() });
  }

  // Método para obter o perfil do usuário
  async getUserProfile(userId: string) {
    const ref = doc(firestore, 'users', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as any) : null;
  }

  // Método para obter o histórico de códigos do usuário
  async getCodeHistory(userId: string): Promise<Array<{ code: string; at: number }>> {
    const ref = collection(firestore, 'users', userId, 'codeHistory');
    const q = await getDocs(ref);
    return q.docs.map(d => d.data() as any);
  }

  // Método para redefinir a senha
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new AuthError(this.mapFirebaseError(error.code), error.code);
    }
  }

  // Método para enviar e-mail de verificação
  async sendVerificationEmail(): Promise<void> {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error: any) {
        // Ignorar erro se for porque já enviou recentemente (too-many-requests)
        // ou tratar conforme necessidade.
        if (error.code === 'auth/too-many-requests') {
          throw new AuthError('Muitas tentativas. Aguarde um pouco.', error.code);
        }
        throw new AuthError('Erro ao enviar e-mail de verificação.', error.code);
      }
    } else {
      throw new AuthError('Usuário não autenticado.', 'auth/no-user');
    }
  }

  // Método para recarregar o perfil do usuário
  async reloadUser(): Promise<void> {
    if (auth.currentUser) {
      await auth.currentUser.reload();
    }
  }

  // Método para mapear erros do Firebase para erros da aplicação
  private mapFirebaseError(code: string): string {
    switch (code) {
      case 'auth/invalid-email': return 'E-mail inválido.';
      case 'auth/user-disabled': return 'Usuário desativado.';
      case 'auth/user-not-found': return 'Usuário não encontrado.';
      case 'auth/wrong-password': return 'Senha incorreta.';
      case 'auth/email-already-in-use': return 'E-mail já está em uso.';
      case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
      default: return 'Ocorreu um erro na autenticação.';
    }
  }
}
