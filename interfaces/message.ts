import { InfoFichier } from 'interfaces/fichier'

export enum TypeMessage {
  NOUVEAU_CONSEILLER = 'NOUVEAU_CONSEILLER',
  MESSAGE = 'MESSAGE',
  MESSAGE_PJ = 'MESSAGE_PJ',
}

export interface Message {
  id: string
  content: string
  creationDate: Date
  sentBy: string
  iv: string | undefined
  conseillerId: string | undefined
  type: TypeMessage
  infoPiecesJointes: InfoFichier[]
}

export interface MessagesOfADay {
  date: Date
  messages: Message[]
}

export interface ChatCredentials {
  token: string
  cleChiffrement: string
}
