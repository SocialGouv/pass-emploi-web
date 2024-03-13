import { DateTime } from 'luxon'

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

export interface ByDay<T> {
  date: DateTime
  messages: T[]
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
