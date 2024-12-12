'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { Portefeuille } from 'interfaces/beneficiaire'

type PortefeuilleState = [
  Portefeuille,
  (updatedBeneficiaires: Portefeuille) => void,
]

const PortefeuilleContext = createContext<PortefeuilleState | undefined>(
  undefined
)

export function PortefeuilleProvider({
  children,
  portefeuille,
  setterForTests,
}: {
  children: ReactNode
  portefeuille: Portefeuille
  setterForTests?: (updatedBeneficiaires: Portefeuille) => void
}) {
  const [state, setPortefeuille] = useState<Portefeuille>(portefeuille)
  const setter = setterForTests ?? setPortefeuille

  return (
    <PortefeuilleContext.Provider value={[state, setter]}>
      {children}
    </PortefeuilleContext.Provider>
  )
}

export function usePortefeuille(): PortefeuilleState {
  const portefeuilleContext = useContext(PortefeuilleContext)
  if (!portefeuilleContext) {
    throw new Error('usePortefeuille must be used within PortefeuilleProvider')
  }

  return portefeuilleContext
}
