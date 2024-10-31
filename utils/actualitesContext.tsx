'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { Actualites } from 'interfaces/actualites'
import { getActualites } from 'services/actualites.service'

const ActualitesContext = createContext<Actualites | null | undefined>(
  undefined
)

export function ActualitesProvider({
  children,
  actualitesForTests,
}: {
  children: ReactNode
  actualitesForTests?: Actualites | null
}) {
  const [actualites, setActualites] = useState<Actualites | null | undefined>(
    actualitesForTests
  )

  useEffect(() => {
    if (actualites === undefined) getActualites().then(setActualites)
    return () => setActualites(undefined)
  }, [actualites])

  return (
    <ActualitesContext.Provider value={actualites}>
      {children}
    </ActualitesContext.Provider>
  )
}

export function useActualites(): Actualites | null {
  const actualites = useContext(ActualitesContext)
  if (actualites === undefined) {
    throw new Error('useActualites must be used within ActualitesProvider')
  }

  return actualites
}
