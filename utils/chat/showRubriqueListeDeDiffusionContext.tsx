import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

type ShowRubriqueListeDeDiffusionState = [
  boolean | undefined,
  (showRubriqueListeDeDiffusion: boolean | undefined) => void
]

const ShowRubriqueListeDeDiffusion = createContext<
  ShowRubriqueListeDeDiffusionState | undefined
>(undefined)

export function ShowRubriqueListeDeDiffusionProvider({
  children,
  valueForTests,
  setterForTests,
}: {
  children: ReactNode
  valueForTests?: boolean | undefined
  setterForTests?: (showRubriqueListeDeDiffusion: boolean | undefined) => void
}) {
  const [
    showRubriqueListeDeDiffusion,
    setShowRubriqueListeDeDiffusion,
  ]: ShowRubriqueListeDeDiffusionState = useState<boolean | undefined>(
    valueForTests
  )
  const setter = setterForTests ?? setShowRubriqueListeDeDiffusion
  const value: ShowRubriqueListeDeDiffusionState = useMemo(
    () => [showRubriqueListeDeDiffusion, setter],
    [showRubriqueListeDeDiffusion, setter]
  )
  return (
    <ShowRubriqueListeDeDiffusion.Provider value={value}>
      {children}
    </ShowRubriqueListeDeDiffusion.Provider>
  )
}

export function useShowRubriqueListeDeDiffusion(): ShowRubriqueListeDeDiffusionState {
  const showRubriqueListeDeDiffusion = useContext(ShowRubriqueListeDeDiffusion)
  if (!showRubriqueListeDeDiffusion) {
    throw new Error(
      'showRubriqueListeDeDiffusion must be used within ShowListeDeDiffusionProvider'
    )
  }
  return showRubriqueListeDeDiffusion
}
