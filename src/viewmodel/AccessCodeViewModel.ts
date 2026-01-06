import { useEffect, useMemo, useState } from 'react'
import { GenerateAccessCodeUseCase } from '../usecase/GenerateAccessCodeUseCase'
import { ValidateAccessCodeUseCase } from '../usecase/ValidateAccessCodeUseCase'

export type CodeStatus = 'idle' | 'valid' | 'invalid' | 'checking'

export function useAccessCodeViewModel(
  generateUC: GenerateAccessCodeUseCase,
  validateUC: ValidateAccessCodeUseCase
) {
  const [codeInput, setCodeInput] = useState('')
  const [status, setStatus] = useState<CodeStatus>('idle')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isComplete = useMemo(() => /^\d{9}$/.test(codeInput.replace(/\D/g, '')), [codeInput])

  useEffect(() => {
    const normalized = codeInput.replace(/\D/g, '')
    if (normalized.length === 9) {
      setStatus('checking')
      validateUC
        .execute(normalized)
        .then(() => setStatus('valid'))
        .catch(() => setStatus('invalid'))
    } else {
      setStatus('idle')
    }
  }, [codeInput, validateUC])

  const formatCode = (c: string) => {
    const s = c.replace(/\D/g, '').slice(0, 9)
    const part1 = s.slice(0, 3)
    const part2 = s.slice(3, 6)
    const part3 = s.slice(6, 9)
    return [part1, part2, part3].filter(Boolean).join(' - ')
  }

  const generateCode = async () => {
    setIsLoading(true)
    try {
      const org = await generateUC.execute()
      setGeneratedCode(org.accessCode)
    } finally {
      setIsLoading(false)
    }
  }

  const clearGeneratedCode = () => {
    setGeneratedCode(null)
  }

  const confirmCode = async () => {
    setIsLoading(true)
    try {
      await validateUC.execute(codeInput.replace(/\D/g, ''))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    codeInput,
    setCodeInput: (v: string) => setCodeInput(v.replace(/\D/g, '')),
    status,
    generatedCode,
    isLoading,
    isComplete,
    formatCode,
    generateCode,
    clearGeneratedCode,
    confirmCode,
  }
}
