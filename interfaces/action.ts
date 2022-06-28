import { compareDatesDesc } from 'utils/date'

export interface Action {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  creator: string
  creatorType: string
  status: StatutAction
}

export interface MetadonneesActions {
  nombreTotal: number
}

export interface TotalActions {
  idJeune: string
  nbActionsNonTerminees: number
}

export enum StatutAction {
  ARealiser = 'ARealiser',
  Commencee = 'Commencee',
  Terminee = 'Terminee',
  Annulee = 'Annulee',
}

export function compareActionsDatesDesc(
  action1: Action,
  action2: Action
): number {
  const compare = compareDatesDesc(
    new Date(action1.creationDate),
    new Date(action2.creationDate)
  )
  return (
    compare ||
    compareDatesDesc(new Date(action1.lastUpdate), new Date(action2.lastUpdate))
  )
}
