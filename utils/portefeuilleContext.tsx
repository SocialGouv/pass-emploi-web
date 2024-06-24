'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { BaseBeneficiaire } from 'interfaces/beneficiaire'

type MaybePortefeuille = BaseBeneficiaire[] | undefined
type PortefeuilleState = [
  MaybePortefeuille,
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
  portefeuille?: MaybePortefeuille
  setterForTests?: (updatedBeneficiaires: BaseBeneficiaire[]) => void
}) {
  const [state, setPortefeuille] = useState<MaybePortefeuille>(portefeuille)
  const setter = setterForTests ?? setPortefeuille

  return (
    <PortefeuilleContext.Provider value={[state, setter]}>
      {children}
    </PortefeuilleContext.Provider>
  )
}

export function usePortefeuillePotentiellementPasRecupere(): PortefeuilleState {
  const portefeuilleContext = useContext(PortefeuilleContext)
  if (!portefeuilleContext) {
    throw new Error(
      'usePortefeuillePotentiellementPasRecupere must be used within PortefeuilleProvider'
    )
  }
  return portefeuilleContext
}

export function usePortefeuille(): [
  BaseBeneficiaire[],
  (updatedBeneficiaires: BaseBeneficiaire[]) => void,
] {
  const [portefeuille, setPortefeuille] =
    usePortefeuillePotentiellementPasRecupere()
  if (!portefeuille) {
    throw new Error(
      'usePortefeuille must be used within Layout where portefeuille is initialized'
    )
  }

  return [portefeuille, setPortefeuille]
}
