import { createContext, ReactNode, useContext, useState } from 'react'

import { Conseiller } from 'interfaces/conseiller'

type MaybeConseiller = Conseiller | undefined
type ConseillerState = [MaybeConseiller, (credentials: MaybeConseiller) => void]

const ConseillerContext = createContext<ConseillerState | undefined>(undefined)

export function ConseillerProvider({
  children,
  conseillerForTests,
}: {
  children: ReactNode
  conseillerForTests?: Conseiller
}) {
  const state = useState<MaybeConseiller>(conseillerForTests)
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

export function useForcedConseiller(): [
  Conseiller,
  (credentials: Conseiller) => void
] {
  const conseillerContext = useContext(ConseillerContext)
  if (!conseillerContext) {
    throw new Error('useConseiller must be used within ConseillerProvider')
  }

  const [conseiller, setConseiller] = conseillerContext
  if (!conseiller) {
    throw new Error(
      'useForcedConseiller must be used within Layout where conseiller is initialized'
    )
  }

  return [conseiller, setConseiller]
}
