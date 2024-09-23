'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

type ActualitesState = [string, (updatedActualites: string) => void]

const ActualitesContext = createContext<ActualitesState | undefined>(undefined)

export function ActualitesProvider({
  children,
  actualites,
  setterForTests,
}: {
  children: ReactNode
  actualites: string
  setterForTests?: (updatedActualites: string) => void
}) {
  const [state, setActualites] = useState<string>(actualites)
  const setter = setterForTests ?? setActualites

  return (
    <ActualitesContext.Provider value={[state, setter]}>
      {children}
    </ActualitesContext.Provider>
  )
}

export function useActualites(): ActualitesState {
  const actualitesContext = useContext(ActualitesContext)
  if (!actualitesContext) {
    throw new Error('useActualites must be used within ActualitesProvider')
  }

  return actualitesContext
}
