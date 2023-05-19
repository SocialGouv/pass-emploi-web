import { createContext, ReactNode, useContext, useState } from 'react'

type CurrentJeuneState = [
  string | undefined,
  (currentJeuneId: string | undefined) => void
]

const CurrentJeuneContext = createContext<CurrentJeuneState | undefined>(
  undefined
)

export function CurrentJeuneProvider({
  children,
  idForTests,
  setterForTests,
}: {
  children: ReactNode
  idForTests?: string
  setterForTests?: (idCurrentJeune: string | undefined) => void
}) {
  const [idCurrentJeune, setIdCurrentJeune]: CurrentJeuneState = useState<
    string | undefined
  >(idForTests)
  const setter = setterForTests ?? setIdCurrentJeune

  return (
    <CurrentJeuneContext.Provider value={[idCurrentJeune, setter]}>
      {children}
    </CurrentJeuneContext.Provider>
  )
}

export function useCurrentJeune(): CurrentJeuneState {
  const currentJeuneContext = useContext(CurrentJeuneContext)
  if (!currentJeuneContext) {
    throw new Error('useCurrentJeune must be used within CurrentJeuneProvider')
  }
  return currentJeuneContext
}
