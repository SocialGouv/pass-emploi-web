export type Jeune = {
  id: string
  firstName: string
  lastName: string
  creationDate: string
  email?: string
  isActivated?: boolean
}

export interface Chat {
  seenByConseiller: boolean
  newConseillerMessageCount: number
  lastMessageContent: string | undefined
  lastMessageSentAt: Date | undefined
  lastMessageSentBy: string | undefined
  lastConseillerReading: Date | undefined
  lastJeuneReading: Date | undefined
  lastMessageIv: string | undefined
}

export interface JeuneChat extends Jeune, Chat {
  chatId: string
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
