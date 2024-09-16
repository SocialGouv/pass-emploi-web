'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { Conseiller } from 'interfaces/conseiller'

type ConseillerState = [Conseiller, (updatedConseiller: Conseiller) => void]

const ConseillerContext = createContext<ConseillerState | undefined>(undefined)

export function ConseillerProvider({
  children,
  conseiller,
}: {
  children: ReactNode
  conseiller: Conseiller
}) {
  const state = useState<Conseiller>(conseiller)
  return (
    <ConseillerContext.Provider value={state}>
      {children}
    </ConseillerContext.Provider>
  )
}

export function useConseiller(): ConseillerState {
  const conseillerContext = useContext(ConseillerContext)
  if (!conseillerContext) {
    throw new Error('useConseiller must be used within ConseillerProvider')
  }
  return conseillerContext
}
