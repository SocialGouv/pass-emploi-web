import { Timestamp } from 'firebase/firestore'

export type Jeune = {
  id: string
  firstName: string
  lastName: string
  creationDate: string
  email?: string
  chatId?: string
  isActivated?: boolean
}

export interface JeuneChat extends Jeune {
  seenByConseiller: boolean
  newConseillerMessageCount: number
  lastMessageContent: string | undefined
  lastMessageSentAt: Timestamp | undefined
  lastMessageSentBy: string | undefined
  lastConseillerReading: Timestamp | undefined
  lastJeuneReading: Timestamp | undefined
  lastMessageIv: string | undefined
}

export interface DossierMilo {
  id: string
  prenom: string
  nom: string
  dateDeNaissance: string
  codePostal: string
  email?: string
}

export interface JeunePoleEmploiFormData {
  prenom: string
  nom: string
  email: string
}
