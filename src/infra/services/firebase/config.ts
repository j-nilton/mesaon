import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore: getReactNativePersistence is not exported in the web typings but exists in the RN bundle
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuração do Firebase
const extra = Constants.expoConfig?.extra as any;
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra?.FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra?.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra?.FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra?.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extra?.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra?.FIREBASE_APP_ID,
};

// Validação da configuração do Firebase
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Config Firebase ausente: ${key}. Verifique suas variáveis EXPO_PUBLIC_* ou extra.`);
  }
});

// Inicialização do Firebase
let app;
// Inicializa o Firebase se ainda não tiver sido inicializado
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    // Se já houver uma instância inicializada, obtém-a
    app = getApp();
}

// Inicialização do Firebase Auth
const auth = initializeAuth(app, {
  // Configuração de persistência para o Firebase Auth
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicialização do Firestore
const firestore = getFirestore(app);

export { app, auth, firestore };