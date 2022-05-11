import React from 'react'

import { Dependencies } from './container'

const DIContext = React.createContext<Partial<Dependencies>>({})

export const DIProvider = ({
  children,
  dependances,
}: {
  dependances: Partial<Dependencies>
  children: React.ReactNode
}) => {
  return <DIContext.Provider value={dependances}>{children}</DIContext.Provider>
}

export function useDependance<
  TypeDependance extends Dependencies[keyof Dependencies]
>(nom: keyof Dependencies): TypeDependance {
  const dependances = React.useContext<Partial<Dependencies>>(DIContext)
  const dependance: TypeDependance = dependances[nom] as TypeDependance
  if (dependance !== undefined) {
    return dependance
  }
  throw Error(`Dépendance ${nom} non instanciée`)
}
