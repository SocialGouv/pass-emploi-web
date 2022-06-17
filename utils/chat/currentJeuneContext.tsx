import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

type CurrentJeuneState = [
  string | undefined,
  (currentJeuneId: string | undefined) => void
]

const CurrentJeuneContext = createContext<CurrentJeuneState | undefined>(
  undefined
)

export function CurrentJeuneProvider({
  children,
  idJeune,
  setIdJeune,
}: {
  children: ReactNode
  idJeune?: string
  setIdJeune?: (idCurrentJeune: string | undefined) => void
}) {
  const [idCurrentJeune, setIdCurrentJeune]: CurrentJeuneState = useState<
    string | undefined
  >(idJeune)
  const setter = setIdJeune ?? setIdCurrentJeune
  const value: CurrentJeuneState = useMemo(
    () => [idCurrentJeune, setter],
    [idCurrentJeune, setter]
  )
  return (
    <CurrentJeuneContext.Provider value={value}>
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
