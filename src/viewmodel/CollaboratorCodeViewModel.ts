import { useEffect, useMemo, useState } from 'react'
import { ValidateAccessCodeUseCase } from '../usecase/ValidateAccessCodeUseCase'
import { GenerateAccessCodeUseCase } from '../usecase/GenerateAccessCodeUseCase'

export type CollaboratorCodeStatus = 'idle' | 'valid' | 'invalid' | 'checking' | 'success'

// Função pura para normalização que pode ser testada sem React
export function normalizeCodeInput(v: string): string {
  return v.replace(/\D/g, '').slice(0, 9)
}

// ViewModel focado no fluxo do colaborador
export interface CollaboratorCodeViewModel {
  codeInput: string;
  onChange: (v: string) => void;
  isComplete: boolean;
  status: CollaboratorCodeStatus;
  errorMessage: string;
  isLoading: boolean;
  confirmCode: () => Promise<void>;
  generateCode: () => Promise<void>;
  generatedCode: string | null;
  formatCode: (c: string) => string;
}

export function useCollaboratorCodeViewModel(validateUC: ValidateAccessCodeUseCase, generateUC?: GenerateAccessCodeUseCase): CollaboratorCodeViewModel {
  const [codeInput, setCodeInput] = useState('')
  const [status, setStatus] = useState<CollaboratorCodeStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  const isComplete = useMemo(() => /^\d{9}$/.test(codeInput.replace(/\D/g, '')), [codeInput])

  const onChange = (v: string): void => {
    const normalized = normalizeCodeInput(v)
    setCodeInput(normalized)
    setErrorMessage('')
    if (normalized.length !== 9) setStatus('idle')
  }

  useEffect(() => {
    const run = async () => {
      if (codeInput.length !== 9) return
      setStatus('checking')
      setIsLoading(true)
      setErrorMessage('')
      try {
        await validateUC.execute(codeInput)
        setStatus('success')
      } catch (e: any) {
        setStatus('invalid')
        setErrorMessage(e?.message || 'Código inválido ou inexistente.')
      } finally {
        setIsLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeInput])

  const confirmCode = async (): Promise<void> => {
    if (!isComplete) return
    setIsLoading(true)
    setErrorMessage('')
    try {
      await validateUC.execute(codeInput)
      setStatus('success')
    } catch (e: any) {
      setStatus('invalid')
      setErrorMessage(e?.message || 'Código inválido ou inexistente.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateCode = async (): Promise<void> => {
    if (!generateUC) return
    setIsLoading(true)
    setErrorMessage('')
    try {
      const org = await generateUC.execute()
      setGeneratedCode(org.accessCode)
      setCodeInput(org.accessCode)
      setStatus('idle')
    } catch (e: any) {
      setErrorMessage(e?.message || 'Falha ao gerar código.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCode = (c: string): string => {
    const s = c.replace(/\D/g, '').slice(0, 9)
    const part1 = s.slice(0, 3)
    const part2 = s.slice(3, 6)
    const part3 = s.slice(6, 9)
    return [part1, part2, part3].filter(Boolean).join(' - ')
  }

  return {
    codeInput,
    onChange,
    isComplete,
    status,
    errorMessage,
    isLoading,
    confirmCode,
    generateCode,
    generatedCode,
    formatCode,
  }
}
