import React from 'react'
import { Container, Dependances } from './container'

// FIXME Container.buildDIContainer est appelé à chaque page,
//  ça pourrait poser des problèmes de perfs quand il y aura beaucoup de dépendances.
const dependances = Container.getDIContainer().dependances

const DIContext = React.createContext<Dependances>(dependances)
export const DIProvider = (props: Partial<Dependances> & { children: React.ReactNode }) => {
  const { children, ...dependancesSurchargees } = props
  const value: Dependances = {
    ...dependances,
    ...dependancesSurchargees
  }
  return (
    <DIContext.Provider value={value}>
      {props.children}
    </DIContext.Provider>
  )
}

export default function useDIContext (): Dependances {
  return React.useContext<Dependances>(DIContext)
}