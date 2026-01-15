import { useState } from 'react';
import { LoginUseCase } from '../usecase/LoginUseCase';
import { router } from 'expo-router';

export interface LoginViewModel {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  isLoading: boolean;
  errorMessage: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
  handleLogin: () => Promise<void>;
  navigateToRegister: () => void;
}

export function useLoginViewModel(loginUseCase: LoginUseCase): LoginViewModel {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password;
      await loginUseCase.execute(trimmedEmail, trimmedPassword);
      // Navegação em caso de sucesso
      router.replace('/profile');
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = (): void => {
    router.push('/register');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    showPassword,
    toggleShowPassword: (): void => setShowPassword(!showPassword),
    handleLogin,
    navigateToRegister,
  };
}
