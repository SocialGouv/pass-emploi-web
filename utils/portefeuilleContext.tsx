import { createContext, ReactNode, useContext, useState } from 'react'

import { BaseJeune } from 'interfaces/jeune'

type MaybePortefeuille = BaseJeune[] | undefined
type PortefeuilleState = [
  MaybePortefeuille,
  (updatedBeneficiaires: BaseJeune[]) => void
]

const PortefeuilleContext = createContext<PortefeuilleState | undefined>(
  undefined
)

export function PortefeuilleProvider({
  children,
  beneficiairesForTests,
  setterForTests,
}: {
  children: ReactNode
  beneficiairesForTests?: MaybePortefeuille
  setterForTests?: (updatedBeneficiaires: BaseJeune[]) => void
}) {
  const [portefeuille, setPortefeuille] = useState<MaybePortefeuille>(
    beneficiairesForTests
  )
  const setter = setterForTests ?? setPortefeuille

  return (
    <PortefeuilleContext.Provider value={[portefeuille, setter]}>
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
  BaseJeune[],
  (updatedBeneficiaires: BaseJeune[]) => void
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
