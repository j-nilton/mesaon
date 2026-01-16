import { useState } from 'react';
import { RegisterUseCase } from '../usecase/RegisterUseCase';
import { ResendVerificationEmailUseCase } from '../usecase/ResendVerificationEmailUseCase';
import { CheckEmailVerificationUseCase } from '../usecase/CheckEmailVerificationUseCase';
import { GetCurrentUserProfileUseCase } from '../usecase/GetCurrentUserProfileUseCase';
import { router } from 'expo-router';

export const isValidEmail = (email: string) => {
  // RFC 5322ish regex - robust but not perfect (perfect is impossible with regex)
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email)) return false;
  
  // Structural "DNS" check (simulated)
  const domain = email.split('@')[1];
  if (!domain || !domain.includes('.')) return false;
  
  // Reject specific invalid domains or TLDs if necessary
  if (email.endsWith('@email.com')) return false;
  if (email.endsWith('@example.com')) return false;

  return true;
};

export const checkPasswordRequirements = (rules: { length: boolean; upper: boolean; lower: boolean; number: boolean }) => {
  const { length, upper, lower, number } = rules;
  // Strong: All
  // Medium: Length + Number + (Upper OR Lower)
  // Weak: Anything else (blocks submit)
  
  // We return a "score" or level, but for boolean check "isMediumOrBetter":
  return (length && number && (upper || lower));
};

export const validatePasswordInput = (value: string): string => {
  if (/[^A-Za-z0-9]/.test(value)) {
    return 'A senha deve conter apenas letras e números.';
  }
  return '';
};

export interface RegisterViewModel {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  isLoading: boolean;
  errorMessage: string;
  passwordError: string;
  passwordRules: { length: boolean; upper: boolean; lower: boolean; number: boolean };
  strength: 'Fraca' | 'Média' | 'Forte';
  handleRegister: () => Promise<void>;
  navigateToLogin: () => void;
  verificationSent: boolean;
  resendCooldown: number;
  handleResendEmail: () => Promise<void>;
  checkVerification: () => Promise<void>;
}

export function useRegisterViewModel(
  registerUseCase: RegisterUseCase,
  resendUseCase: ResendVerificationEmailUseCase,
  checkUseCase: CheckEmailVerificationUseCase,
  getProfileUseCase: GetCurrentUserProfileUseCase
): RegisterViewModel {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, _setPassword] = useState('');
  const [confirmPassword, _setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
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

  const setPassword = (value: string): void => {
    const error = validatePasswordInput(value);
    setPasswordError(error);
    _setPassword(value);
    setPasswordRules({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
    });
  };
  const setConfirmPassword = (value: string): void => {
    _setConfirmPassword(value);
  };

  const handleRegister = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage('');

    if (passwordError) {
      setErrorMessage(passwordError);
      setIsLoading(false);
      return;
    }

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage('Por favor, insira um e-mail válido.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    // Allow Medium or Strong passwords
    // Medium requires at least 8 chars + numbers + (upper OR lower)
    const isMediumOrBetter = checkPasswordRequirements(passwordRules);

    if (!isMediumOrBetter) {
      setErrorMessage('A senha deve ter no mínimo 8 caracteres, contendo letras e números.');
      setIsLoading(false);
      return;
    }

    try {
      const trimmedName = name.trim();
      await registerUseCase.execute(trimmedName, trimmedEmail, password);
      setVerificationSent(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async (): Promise<void> => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      await resendUseCase.execute();
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkVerification = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const verified = await checkUseCase.execute();
      if (verified) {
        const profile = await getProfileUseCase.execute();
        const hasOrg = profile?.role === 'organization' && !!profile?.organizationId;
        router.replace(hasOrg ? '/(authenticated)/(tabs)/dashboard' : '/(authenticated)/standalone/collaborator');
      } else {
        setErrorMessage('E-mail ainda não verificado.');
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = (): void => {
    router.back();
  };

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isLoading,
    errorMessage,
    passwordError,
    passwordRules,
    strength,
    handleRegister,
    navigateToLogin,
    verificationSent,
    resendCooldown,
    handleResendEmail,
    checkVerification
  };
}
