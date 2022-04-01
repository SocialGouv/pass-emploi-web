import { Jeune } from 'interfaces/jeune'
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

type CurrentJeune = Jeune | undefined
type CurrentJeuneState = [CurrentJeune, (currentJeune: CurrentJeune) => void]

const CurrentJeuneContext = createContext<CurrentJeuneState | undefined>(
  undefined
)

export function CurrentJeuneProvider({
  children,
  jeune,
  setJeune,
}: {
  children: ReactNode
  jeune?: Jeune
  setJeune?: (currentJeune: CurrentJeune) => void
}) {
  const [currentJeune, setCurrentJeune]: CurrentJeuneState =
    useState<CurrentJeune>(jeune)
  const setter = setJeune ?? setCurrentJeune
  const value: CurrentJeuneState = useMemo(
    () => [currentJeune, setter],
    [currentJeune, setter]
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
