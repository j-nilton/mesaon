import { useState } from 'react'
import { RecoverPasswordUseCase } from '../usecase/RecoverPasswordUseCase'

export interface RecoverPasswordViewModel {
  email: string;
  setEmail: (v: string) => void;
  isLoading: boolean;
  errorMessage: string;
  canSubmit: boolean;
  submit: () => Promise<boolean>;
}

export function useRecoverPasswordViewModel(uc: RecoverPasswordUseCase): RecoverPasswordViewModel {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const canSubmit = /\S+@\S+\.\S+/.test(email)

  const submit = async (): Promise<boolean> => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      await uc.execute(email)
      return true
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao enviar e-mail de recuperação.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { email, setEmail, isLoading, errorMessage, canSubmit, submit }
}
