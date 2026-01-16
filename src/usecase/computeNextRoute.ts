export type NavigationInput = {
  isAuthenticated: boolean;
  accessCode?: string;
};

export function computeNextRoute({ isAuthenticated, accessCode }: NavigationInput): string {
  const isValidCode = !!accessCode && /^\d{9}$/.test(accessCode);
  if (isAuthenticated && isValidCode) {
    return '/(authenticated)/(tabs)/dashboard';
  }
  if (isAuthenticated) {
    return '/(authenticated)/standalone/collaborator';
  }
  return '/';
}

