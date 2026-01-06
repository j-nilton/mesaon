import { useState } from 'react'
import { SetUserRoleUseCase } from '../usecase/SetUserRoleUseCase'
import { router } from 'expo-router'

export function useProfileSelectionViewModel(setRoleUC: SetUserRoleUseCase) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectOrganization = async () => {
    await selectRole('organization')
  }
  const selectCollaborator = async () => {
    await selectRole('collaborator')
  }

  const selectRole = async (role: 'organization' | 'collaborator') => {
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
