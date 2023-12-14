'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { AlerteParam } from 'referentiel/alerteParam'

export type Alerte = {
  key: AlerteParam
  target?: string
}
type AlerteState = [
  Alerte | undefined,
  (key: AlerteParam | undefined, target?: string) => void,
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

  return (
    <AlerteContext.Provider value={[alerte, setter]}>
      {children}
    </AlerteContext.Provider>
  )
}

export function useAlerte(): AlerteState {
  const alerteContext = useContext(AlerteContext)
  if (!alerteContext) {
    throw new Error('useAlerte must be used within AlerteProvider')
  }
  return alerteContext
}
