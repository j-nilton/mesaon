import { describe, it, expect } from 'vitest';
import { computeNextRoute } from '../../../usecase/computeNextRoute';

describe('computeNextRoute', () => {
  it('Login → dashboard com código válido', () => {
    const route = computeNextRoute({ isAuthenticated: true, accessCode: '123456789' });
    expect(route).toBe('/(authenticated)/(tabs)/dashboard');
  });

  it('Login → collaborator sem código', () => {
    const route = computeNextRoute({ isAuthenticated: true, accessCode: undefined });
    expect(route).toBe('/(authenticated)/standalone/collaborator');
  });

  it('Depois de confirmar código → dashboard', () => {
    const route = computeNextRoute({ isAuthenticated: true, accessCode: '987654321' });
    expect(route).toBe('/(authenticated)/(tabs)/dashboard');
  });

  it('Reabrir app com sessão e código → dashboard instantâneo', () => {
    const route = computeNextRoute({ isAuthenticated: true, accessCode: '000111222' });
    expect(route).toBe('/(authenticated)/(tabs)/dashboard');
  });

  it('Logout → volta para público', () => {
    const route = computeNextRoute({ isAuthenticated: false, accessCode: undefined });
    expect(route).toBe('/');
  });

  it('Código inválido não permite dashboard', () => {
    const route = computeNextRoute({ isAuthenticated: true, accessCode: 'abc' as any });
    expect(route).toBe('/(authenticated)/standalone/collaborator');
  });
});

