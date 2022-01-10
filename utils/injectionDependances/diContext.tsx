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

export default function useDIContext(): Partial<Dependencies> {
  return React.useContext<Partial<Dependencies>>(DIContext)
}
