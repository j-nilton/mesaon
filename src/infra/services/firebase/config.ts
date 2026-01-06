import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Preencher com as chaves reais do projeto ou usar variáveis de ambiente
const firebaseConfig = {
  apiKey: "AIzaSyAOCkZ8TmepGq0YsZnvg6Q-BC9kkjkgE6E",
  authDomain: "mesaon-933fe.firebaseapp.com",
  projectId: "mesaon-933fe",
  storageBucket: "mesaon-933fe.firebasestorage.app",
  messagingSenderId: "132003284812",
  appId: "1:132003284812:web:1690aafc77442868b371e9"
};

// Singleton para garantir uma única instância
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
