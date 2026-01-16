import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { container } from '../di/container';
import { useAppState } from './state/AppState';
import { computeNextRoute } from '../usecase/computeNextRoute';

export default function RootLayout() {
  const router = useRouter();
  const { hydrated, isAuthenticated, user, accessCode, setIsAuthenticated, setUser } = useAppState();

  useEffect(() => {
    let mounted = true;
    // Bootstrap de sessão: reflete Firebase Auth no estado global
    container.getAuthService().getCurrentUser().then((u) => {
      if (!mounted) return;
      setIsAuthenticated(!!u);
      setUser(u ? { uid: u.id, email: u.email } : undefined);
    }).catch(() => {
      // Ignora erros de bootstrap; mantém telas públicas
    });
    return () => { mounted = false; };
  }, [setIsAuthenticated, setUser]);

  useEffect(() => {
    if (!hydrated) return;
    // Guarda de navegação global: redireciona instantaneamente após hidratar
    const next = computeNextRoute({ isAuthenticated, accessCode });
    if (next !== '/') {
      router.replace(next);
    }
  }, [hydrated, isAuthenticated, accessCode, router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
