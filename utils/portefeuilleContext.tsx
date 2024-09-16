'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { BaseBeneficiaire } from 'interfaces/beneficiaire'

type PortefeuilleState = [
  BaseBeneficiaire[],
  (updatedBeneficiaires: BaseBeneficiaire[]) => void,
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
  portefeuille: BaseBeneficiaire[]
  setterForTests?: (updatedBeneficiaires: BaseBeneficiaire[]) => void
}) {
  const [state, setPortefeuille] = useState<BaseBeneficiaire[]>(portefeuille)
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
