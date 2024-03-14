'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

import { AlerteParam } from 'referentiel/alerteParam'

type AlerteParams = Partial<{
  variable: string
  target: string
}>

export type Alerte = {
  key: AlerteParam
  params?: AlerteParams
}
type AlerteState = [
  Alerte | undefined,
  (key: AlerteParam | undefined, params?: AlerteParams) => void,
]

const AlerteContext = createContext<AlerteState | undefined>(undefined)

export function AlerteProvider({
  children,
  alerteForTests,
  setterForTests,
}: {
  children: ReactNode
  alerteForTests?: Alerte
  setterForTests?: (key: AlerteParam | undefined, params?: AlerteParams) => void
}) {
  const [alerte, setAlerte] = useState<Alerte | undefined>(alerteForTests)
  const defaultSetter = (key: AlerteParam | undefined, params?: AlerteParams) =>
    setAlerte(key && { key, params })
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
