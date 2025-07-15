import { createContext, ReactNode, useContext, useState } from 'react'

import { Liste } from 'interfaces/liste'

export type ListeSelectionnee = Partial<{
  liste: Liste
  idAFocus: string
}>
type ListeSelectionneeState = [
  ListeSelectionnee,
  (listeSelectionnee: ListeSelectionnee) => void,
]

const ListeSelectionnee = createContext<ListeSelectionneeState | undefined>(
  undefined
)

export function ListeSelectionneeProvider({
  children,
  valueForTests,
  setterForTests,
}: {
  children: ReactNode
  valueForTests?: ListeSelectionnee
  setterForTests?: (listeSelectionnee: ListeSelectionnee) => void
}) {
  const [listeSelectionnee, setListeSelectionnee]: ListeSelectionneeState =
    useState<ListeSelectionnee>(valueForTests ?? {})
  const setter = setterForTests ?? setListeSelectionnee

  return (
    <ListeSelectionnee.Provider value={[listeSelectionnee, setter]}>
      {children}
    </ListeSelectionnee.Provider>
  )
}

export function useListeSelectionnee(): ListeSelectionneeState {
  const listeSelectionnee = useContext(ListeSelectionnee)
  if (!listeSelectionnee) {
    throw new Error(
      'useListeSelectionnee must be used within ListeSelectionneeProvider'
    )
  }
  return listeSelectionnee
}
