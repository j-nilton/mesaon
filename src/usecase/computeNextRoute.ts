export type NavigationInput = {
  isAuthenticated: boolean;
  accessCode?: string;
};

// Função responsável por determinar a próxima rota de navegação com base na autenticação e código de acesso
export function computeNextRoute({ isAuthenticated, accessCode }: NavigationInput): string {
  const isValidCode = !!accessCode && /^\d{9}$/.test(accessCode);
  // Usuário autenticado e código válido: direciona para dashboard
  if (isAuthenticated && isValidCode) {
    return '/(authenticated)/(tabs)/dashboard';
  }
  // Usuário autenticado sem código válido: direciona para colaborador
  if (isAuthenticated) {
    return '/(authenticated)/standalone/collaborator';
  }
  // Não autenticado: direciona para tela inicial
  return '/';
}

