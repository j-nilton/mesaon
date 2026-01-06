import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { container } from '../../di/container'

type Role = 'organization' | 'collaborator' | undefined

type AppStateValue = {
  role: Role
  accessCode?: string
  setRole: (r: Role) => void
  setAccessCode: (c?: string) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(undefined)
  const [accessCode, setAccessCode] = useState<string | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const profile = await container.getCurrentUserProfileUseCase().execute()
      if (profile?.role) setRole(profile.role)
      if (profile?.organizationId) setAccessCode(profile.organizationId)
    })()
  }, [])

  const value = useMemo(
    () => ({ role, accessCode, setRole, setAccessCode }),
    [role, accessCode]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('AppStateProvider missing')
  return ctx
}

