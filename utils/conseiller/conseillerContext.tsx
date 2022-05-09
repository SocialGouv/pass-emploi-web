import { createContext, ReactNode, useContext, useState } from 'react'

import { Conseiller } from '../../interfaces/conseiller'

type MaybeConseiller = Conseiller | undefined
type ConseillerState = [MaybeConseiller, (credentials: MaybeConseiller) => void]

const ConseillerContext = createContext<ConseillerState | undefined>(undefined)

export function ConseillerProvider({
  children,
  conseiller,
}: {
  children: ReactNode
  conseiller?: Conseiller
}) {
  const state = useState<MaybeConseiller>(conseiller)
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
