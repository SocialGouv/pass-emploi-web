import { createContext, ReactNode, useContext, useState } from 'react'

import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

export type ListeSelectionnee = Partial<{
  liste: ListeDeDiffusion
  idAFocus: string
}>
type ListeDeDiffusionSelectionneeState = [
  ListeSelectionnee,
  (listeDeDiffusionSelectionnee: ListeSelectionnee) => void,
]

const ListeDeDiffusionSelectionnee = createContext<
  ListeDeDiffusionSelectionneeState | undefined
>(undefined)

export function ListeDeDiffusionSelectionneeProvider({
  children,
  valueForTests,
  setterForTests,
}: {
  children: ReactNode
  valueForTests?: ListeSelectionnee
  setterForTests?: (listeDeDiffusionSelectionnee: ListeSelectionnee) => void
}) {
  const [
    listeDeDiffusionSelectionnee,
    setListeDeDiffusionSelectionnee,
  ]: ListeDeDiffusionSelectionneeState = useState<ListeSelectionnee>(
    valueForTests ?? {}
  )
  const setter = setterForTests ?? setListeDeDiffusionSelectionnee

  return (
    <ListeDeDiffusionSelectionnee.Provider
      value={[listeDeDiffusionSelectionnee, setter]}
    >
      {children}
    </ListeDeDiffusionSelectionnee.Provider>
  )
}

export function useListeDeDiffusionSelectionnee(): ListeDeDiffusionSelectionneeState {
  const listeDeDiffusionSelectionnee = useContext(ListeDeDiffusionSelectionnee)
  if (!listeDeDiffusionSelectionnee) {
    throw new Error(
      'useListeDeDiffusionSelectionnee must be used within ListeDeDiffusionSelectionneeProvider'
    )
  }
  return listeDeDiffusionSelectionnee
}
