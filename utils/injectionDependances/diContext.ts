import React from 'react'
import { Container } from './container'

// FIXME buildDIContext est appelé à chaque page,
//  ça pourrait poser des problèmes de perfs quand il y aura beaucoup de dépendances.
export const DIContext = React.createContext<Container>(Container.buildDIContainer())
export default function useDIContext (): Container {
  return React.useContext<Container>(DIContext)
}