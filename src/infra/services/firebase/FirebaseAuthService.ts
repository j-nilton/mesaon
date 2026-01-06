import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, firestore } from './config';
import { AuthService } from '../../../model/services/AuthService';
import { User } from '../../../model/entities/User';
import { AuthError } from '../../../model/errors/AppError';

export class FirebaseAuthService implements AuthService {
  
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
      };
    } catch (error: any) {
      throw new AuthError(this.mapFirebaseError(error.code), error.code);
    }
  }

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
      };

      await setDoc(doc(firestore, 'users', newUser.id), newUser);

      return newUser;
    } catch (error: any) {
      throw new AuthError(this.mapFirebaseError(error.code), error.code);
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          resolve({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || undefined,
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async setUserOrganization(userId: string, organizationId: string): Promise<void> {
    const ref = doc(firestore, 'users', userId);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data() : {};
    await setDoc(ref, { ...current, organizationId }, { merge: true });
  }

  async setUserRole(userId: string, role: 'organization' | 'collaborator'): Promise<void> {
    const ref = doc(firestore, 'users', userId);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data() : {};
    await setDoc(ref, { ...current, role }, { merge: true });
  }

  async addCodeToHistory(userId: string, code: string): Promise<void> {
    const ref = collection(firestore, 'users', userId, 'codeHistory');
    await addDoc(ref, { code, at: Date.now() });
  }

  async getUserProfile(userId: string) {
    const ref = doc(firestore, 'users', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as any) : null;
  }

  async getCodeHistory(userId: string): Promise<Array<{ code: string; at: number }>> {
    const ref = collection(firestore, 'users', userId, 'codeHistory');
    const q = await getDocs(ref);
    return q.docs.map(d => d.data() as any);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new AuthError(this.mapFirebaseError(error.code), error.code);
    }
  }

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
