import { useState } from 'react';
import { LoginUseCase } from '../usecase/LoginUseCase';
import { router } from 'expo-router';

export function useLoginViewModel(loginUseCase: LoginUseCase) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
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

  const navigateToRegister = () => {
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
    toggleShowPassword: () => setShowPassword(!showPassword),
    handleLogin,
    navigateToRegister,
  };
}
