export type NavigationInput = {
  isAuthenticated: boolean;
  accessCode?: string;
};

export function computeNextRoute({ isAuthenticated, accessCode }: NavigationInput): string {
  // Verifica se o código de acesso é válido
  const isValidCode = !!accessCode && /^\d{9}$/.test(accessCode);
  if (isAuthenticated && isValidCode) {
    // Usuário autenticado e código válido
    return '/(authenticated)/(tabs)/dashboard';
  }
  if (isAuthenticated) {
    // Usuário autenticado sem código válido
    return '/(authenticated)/standalone/collaborator';
  }
  // Usuário não autenticado
  return '/';
}

