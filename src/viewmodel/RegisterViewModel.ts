import { useState } from 'react';
import { RegisterUseCase } from '../usecase/RegisterUseCase';
import { router } from 'expo-router';

export function useRegisterViewModel(registerUseCase: RegisterUseCase) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, _setPassword] = useState('');
  const [confirmPassword, _setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });
  const strength = (() => {
    const count = Object.values(passwordRules).filter(Boolean).length;
    if (count <= 2) return 'Fraca';
    if (count === 3) return 'Média';
    return 'Forte';
  })();

  const sanitize = (value: string) => value.replace(/[^A-Za-z0-9]/g, '');
  const setPassword = (value: string) => {
    const v = sanitize(value);
    _setPassword(v);
    setPasswordRules({
      length: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      number: /[0-9]/.test(v),
    });
  };
  const setConfirmPassword = (value: string) => {
    _setConfirmPassword(sanitize(value));
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }
    const allRulesOk = Object.values(passwordRules).every(Boolean);
    if (!allRulesOk) {
      setErrorMessage('A senha não atende aos requisitos mínimos.');
      setIsLoading(false);
      return;
    }

    try {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      await registerUseCase.execute(trimmedName, trimmedEmail, password);
      router.replace('/(authenticated)/standalone/collaborator');
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
    passwordRules,
    strength,
    handleRegister,
    navigateToLogin
  };
}
