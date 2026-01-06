import { useState } from 'react';
import { RegisterUseCase } from '../usecase/RegisterUseCase';
import { router } from 'expo-router';

export function useRegisterViewModel(registerUseCase: RegisterUseCase) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      await registerUseCase.execute(trimmedName, trimmedEmail, password);
      // Após cadastro, vai para a tela de seleção de perfil/boas-vindas
      // router.replace('/welcome'); 
      // Por enquanto, voltamos ao login ou dashboard
      router.replace('/(authenticated)/dashboard'); 
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isLoading,
    errorMessage,
    handleRegister,
    navigateToLogin
  };
}
