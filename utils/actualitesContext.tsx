'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { RenderedWPPageType } from 'utils/AppContextProviders'

type ActualitesState = [
  RenderedWPPageType,
  (updatedActualites: RenderedWPPageType) => void,
]

const ActualitesContext = createContext<ActualitesState | undefined>(undefined)

export function ActualitesProvider({
  children,
  actualites,
  setterForTests,
}: {
  children: ReactNode
  actualites: RenderedWPPageType
  setterForTests?: (updatedActualites: RenderedWPPageType) => void
}) {
  const [state, setActualites] = useState<RenderedWPPageType>(actualites)
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
