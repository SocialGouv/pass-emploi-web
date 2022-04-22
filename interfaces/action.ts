import { compareDatesDesc } from 'utils/date'

export interface ActionJeune {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  creator: string
  creatorType: string
  status: StatutAction
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

export type ActionsParStatut = { [key in StatutAction]: ActionJeune[] }
export type NombreActionsParStatut = { [key in StatutAction]: number }

export function compareActionsDatesDesc(
  action1: ActionJeune,
  action2: ActionJeune
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
