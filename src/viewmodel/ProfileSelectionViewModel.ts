import { useState } from 'react'
import { SetUserRoleUseCase } from '../usecase/SetUserRoleUseCase'
import { router } from 'expo-router'

export interface ProfileSelectionViewModel {
  isLoading: boolean;
  errorMessage: string;
  selectOrganization: () => Promise<void>;
  selectCollaborator: () => Promise<void>;
}

export function useProfileSelectionViewModel(setRoleUC: SetUserRoleUseCase): ProfileSelectionViewModel {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectOrganization = async (): Promise<void> => {
    await selectRole('organization')
  }
  const selectCollaborator = async (): Promise<void> => {
    await selectRole('collaborator')
  }

  const selectRole = async (role: 'organization' | 'collaborator'): Promise<void> => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      await setRoleUC.execute(role)
      router.replace(role === 'organization' ? '/(authenticated)/(tabs)/dashboard' : '/(authenticated)/standalone/collaborator')
    } catch (e: any) {
      setErrorMessage(e.message || 'Erro ao definir perfil.')
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, errorMessage, selectOrganization, selectCollaborator }
}
