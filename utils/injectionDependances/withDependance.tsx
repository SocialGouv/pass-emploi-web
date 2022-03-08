import React from 'react'
import { Container, Dependencies } from './container'

export default function withDependance<
  TypeDependance extends Dependencies[keyof Dependencies]
>(nom: keyof Dependencies): TypeDependance {
  const container = Container.getDIContainer()
  const dependance: TypeDependance = container.dependances[
    nom
  ] as TypeDependance
  if (dependance !== undefined) {
    return dependance
  }
  throw Error(`Dépendance ${nom} non instanciée`)
}
