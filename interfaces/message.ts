import { DateTime } from 'luxon'

import { InfoFichier } from 'interfaces/fichier'
import { TypeOffre } from 'interfaces/offre'

export enum TypeMessage {
  NOUVEAU_CONSEILLER = 'NOUVEAU_CONSEILLER',
  MESSAGE = 'MESSAGE',
  MESSAGE_PJ = 'MESSAGE_PJ',
  MESSAGE_OFFRE = 'MESSAGE_OFFRE',
  MESSAGE_EVENEMENT = 'MESSAGE_EVENEMENT',
}

export interface Message {
  id: string
  content: string
  creationDate: DateTime
  sentBy: string
  iv: string | undefined
  conseillerId: string | undefined
  type: TypeMessage
  infoPiecesJointes?: InfoFichier[]
  infoOffre?: InfoOffre
  infoEvenement?: InfoEvenement
}

export interface MessagesOfADay {
  date: DateTime
  messages: Message[]
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
