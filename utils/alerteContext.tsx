import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

import { AlerteParam } from 'referentiel/alerteParam'

export type Alerte = {
  key: AlerteParam
  target?: string
}
type AlerteState = [
  Alerte | undefined,
  (key: AlerteParam | undefined, target?: string) => void
]

const AlerteContext = createContext<AlerteState | undefined>(undefined)

export function AlerteProvider({
  children,
  alerteForTests,
  setterForTests,
}: {
  children: ReactNode
  alerteForTests?: Alerte
  setterForTests?: (key: AlerteParam | undefined, target?: string) => void
}) {
  const [alerte, setAlerte] = useState<Alerte | undefined>(alerteForTests)
  const defaultSetter = (key: AlerteParam | undefined, target?: string) =>
    setAlerte(key && { key, target })
  const setter = setterForTests ?? defaultSetter
  const value: AlerteState = useMemo(() => [alerte, setter], [alerte, setter])
  return (
    <AlerteContext.Provider value={value}>{children}</AlerteContext.Provider>
  )
}

export function useAlerte(): AlerteState {
  const alerteContext = useContext(AlerteContext)
  if (!alerteContext) {
    throw new Error('useAlerte must be used within AlerteProvider')
  }
  return alerteContext
}
