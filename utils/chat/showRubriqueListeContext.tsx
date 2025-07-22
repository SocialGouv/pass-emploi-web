import { createContext, ReactNode, useContext, useState } from 'react'

type ShowRubriqueListeState = [
  boolean | undefined,
  (showRubriqueListe: boolean | undefined) => void,
]

const ShowRubriqueListe = createContext<ShowRubriqueListeState | undefined>(
  undefined
)

export function ShowRubriqueListeProvider({
  children,
  valueForTests,
  setterForTests,
}: {
  children: ReactNode
  valueForTests?: boolean | undefined
  setterForTests?: (showRubriqueListe: boolean | undefined) => void
}) {
  const [showRubriqueListe, setShowRubriqueListe]: ShowRubriqueListeState =
    useState<boolean | undefined>(valueForTests)
  const setter = setterForTests ?? setShowRubriqueListe

  return (
    <ShowRubriqueListe.Provider value={[showRubriqueListe, setter]}>
      {children}
    </ShowRubriqueListe.Provider>
  )
}

export function useShowRubriqueListe(): ShowRubriqueListeState {
  const showRubriqueListe = useContext(ShowRubriqueListe)
  if (!showRubriqueListe) {
    throw new Error('showRubriqueListe must be used within ShowListeProvider')
  }
  return showRubriqueListe
}
