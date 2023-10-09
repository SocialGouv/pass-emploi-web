'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { Conseiller } from 'interfaces/conseiller'

type MaybeConseiller = Conseiller | undefined
type ConseillerState = [
  MaybeConseiller,
  (updatedConseiller: MaybeConseiller) => void,
]

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

export function useConseillerPotentiellementPasRecupere(): ConseillerState {
  const conseillerContext = useContext(ConseillerContext)
  if (!conseillerContext) {
    throw new Error(
      'useConseillerPotentiellementPasRecupere must be used within ConseillerProvider'
    )
  }
  return conseillerContext
}

export function useConseiller(): [
  Conseiller,
  (updatedConseiller: Conseiller) => void,
] {
  const [conseiller, setConseiller] = useConseillerPotentiellementPasRecupere()
  if (!conseiller) {
    throw new Error(
      'useConseiller must be used within Layout where conseiller is initialized'
    )
  }

  return [conseiller, setConseiller]
}
