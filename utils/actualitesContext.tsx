'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { Actualites } from 'interfaces/actualites'
import { Conseiller } from 'interfaces/conseiller'
import { getActualites } from 'services/actualites.service'

const ActualitesContext = createContext<Actualites | undefined>(undefined)

export function ActualitesProvider({
  conseiller,
  children,
  actualitesForTests,
}: {
  conseiller: Conseiller
  children: ReactNode
  actualitesForTests?: Actualites
}) {
  const [actualites, setActualites] = useState<Actualites | undefined>(
    actualitesForTests
  )

  useEffect(() => {
    if (actualites === undefined)
      getActualites(conseiller.structure).then(setActualites)
  }, [actualites])

  return (
    <ActualitesContext.Provider value={actualites}>
      {children}
    </ActualitesContext.Provider>
  )
}

export function useActualites(): Actualites | undefined {
  return useContext(ActualitesContext)
}
