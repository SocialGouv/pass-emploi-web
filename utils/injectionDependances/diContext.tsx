import React from 'react'
import { Container, Dependencies } from './container'

// FIXME Container.buildDIContainer est appelé à chaque page,
//  ça pourrait poser des problèmes de perfs quand il y aura beaucoup de dépendances.
const dependances = Container.getDIContainer().dependances

const DIContext = React.createContext<Dependencies>(dependances)
export const DIProvider = (
  props: Partial<Dependencies> & { children: React.ReactNode }
) => {
  const { children, ...dependancesSurchargees } = props
  const value: Dependencies = {
    ...dependances,
    ...dependancesSurchargees,
  }
  return <DIContext.Provider value={value}>{props.children}</DIContext.Provider>
}

export default function useDIContext(): Dependencies {
  return React.useContext<Dependencies>(DIContext)
}
