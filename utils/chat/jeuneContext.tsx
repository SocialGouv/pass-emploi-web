import { Jeune } from 'interfaces/jeune'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

type CurrentJeune = Jeune | undefined
const JeuneContext = createContext<
  [CurrentJeune, Dispatch<SetStateAction<CurrentJeune>>]
>([undefined, () => {}])

export function JeuneProvider({
  children,
  jeune,
}: {
  children: ReactNode
  jeune?: Jeune
}) {
  return (
    <JeuneContext.Provider value={useState<CurrentJeune>(jeune)}>
      {children}
    </JeuneContext.Provider>
  )
}

export function useCurrentJeune() {
  return useContext(JeuneContext)
}
