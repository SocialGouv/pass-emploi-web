import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

type ListeDeDiffusionSelectionneeState = [
  ListeDeDiffusion | undefined,
  (listeDeDiffusionSelectionnee: ListeDeDiffusion | undefined) => void
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
  valueForTests?: string
  setterForTests?: (
    listeDeDiffusionSelectionnee: ListeDeDiffusion | undefined
  ) => void
}) {
  const [
    listeDeDiffusionSelectionnee,
    setListeDeDiffusionSelectionnee,
  ]: ListeDeDiffusionSelectionneeState = useState<ListeDeDiffusion | undefined>(
    valueForTests
  )
  const setter = setterForTests ?? setListeDeDiffusionSelectionnee
  const value: ListeDeDiffusionSelectionneeState = useMemo(
    () => [listeDeDiffusionSelectionnee, setter],
    [listeDeDiffusionSelectionnee, setter]
  )
  return (
    <ListeDeDiffusionSelectionnee.Provider value={value}>
      {children}
    </ListeDeDiffusionSelectionnee.Provider>
  )
}

export function useListeDeDiffusionSelectionnee(): ListeDeDiffusionSelectionneeState {
  const listeDeDiffusionSelectionnee = useContext(ListeDeDiffusionSelectionnee)
  if (!listeDeDiffusionSelectionnee) {
    throw new Error(
      'listeDeDiffusionSelectionnee must be used within ShowListeDeDiffusionProvider'
    )
  }
  return listeDeDiffusionSelectionnee
}
