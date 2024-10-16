import { DateTime } from 'luxon'

import { UserType } from 'interfaces/conseiller'
import { InfoFichier } from 'interfaces/fichier'
import { TypeOffre } from 'interfaces/offre'

export enum TypeMessage {
  NOUVEAU_CONSEILLER = 'NOUVEAU_CONSEILLER',
  MESSAGE = 'MESSAGE',
  MESSAGE_PJ = 'MESSAGE_PJ',
  MESSAGE_OFFRE = 'MESSAGE_OFFRE',
  MESSAGE_EVENEMENT = 'MESSAGE_EVENEMENT',
  MESSAGE_EVENEMENT_EMPLOI = 'MESSAGE_EVENEMENT_EMPLOI',
  MESSAGE_SESSION_MILO = 'MESSAGE_SESSION_MILO',
}

export interface Message {
  id: string
  content: string
  creationDate: DateTime
  sentBy: string
  iv: string | undefined
  conseillerId: string | undefined
  type: TypeMessage
  status?: string
  infoPiecesJointes?: InfoFichier[]
  infoOffre?: InfoOffre
  infoEvenement?: InfoEvenement
  infoEvenementEmploi?: InfoEvenementEmploi
  infoSessionImilo?: InfoSessionMilo
}

export interface MessageListeDiffusion {
  id: string
  content: string
  creationDate: DateTime
  iv: string
  type: TypeMessage
  idsDestinataires: string[]
  infoPiecesJointes?: InfoFichier[]
}

export interface ByDay<T extends { id: string }> {
  date: DateTime
  messages: T[]
}

export type MessageRechercheMatch = {
  match: [number, number]
  key?: 'content' | 'piecesJointes.nom'
}

export interface ChatCredentials {
  token: string
  cleChiffrement: string
}

export interface InfoOffre {
  id: string
  titre: string
  type: TypeOffre
}

export interface InfoEvenement {
  id: string
  titre: string
  date: DateTime
}

export interface InfoEvenementEmploi {
  id: string
  titre: string
  url: string
}

export interface InfoSessionMilo {
  id: string
  titre: string
}

export function isDeleted(message: Message): boolean {
  return message.status === 'deleted'
}

export function isEdited(message: Message): boolean {
  return message.status === 'edited'
}

export function fromConseiller(message: Message): boolean {
  return message.sentBy === UserType.CONSEILLER.toLowerCase()
}

export function countItems(days: ByDay<any>[]): number {
  return days.reduce((count, { messages }) => count + messages.length, 0)
}

export function getPreviousItemId<T extends { id: string }>(
  idCible: string,
  days: ByDay<T>[],
  { orNext }: { orNext?: boolean } = {}
): string | undefined {
  if (countItems(days) === 0) return

  let indexDay = 0,
    indexItem = 0,
    day = days[indexDay]
  do {
    if (day?.messages[indexItem]?.id === idCible) break

    if (indexItem < day?.messages.length - 1) indexItem++
    else {
      day = days[++indexDay]
      indexItem = 0
    }
  } while (indexDay < days.length)
  if (indexDay === days.length) return // item non trouvé

  const indexPreviousItem = indexItem - 1
  if (indexPreviousItem >= 0) return day.messages[indexPreviousItem].id // item précédent dans le même jour

  let indexPreviousDay = indexDay - 1
  while (indexPreviousDay >= 0) {
    const previousDay = days[indexPreviousDay]
    if (previousDay.messages.length) return previousDay.messages.at(-1)!.id // dernier item du 1er jour précédent avec des items
    indexPreviousDay--
  }

  if (!orNext) return // pas d’item précédent

  const indexNextItem = indexItem + 1
  if (indexNextItem < day.messages.length) return day.messages[indexNextItem].id // item suivant du même jour

  let indexNextDay = indexDay + 1
  while (indexNextDay < days.length) {
    const nextDay = days[indexNextDay]
    if (nextDay.messages.length) return nextDay.messages[0].id // premier item du 1er jour précédent avec des items
    indexNextDay++
  }
}
