/**
 * TODO: utiliser cette interface en classe mère pour Jeune lorsque la traduction sera faite
 */
export interface BaseJeune {
  id: string
  prenom: string
  nom: string
}

export type Jeune = {
  id: string
  firstName: string
  lastName: string
  creationDate: string
  lastActivity: string
  email?: string
  isActivated?: boolean
  conseillerPrecedent?: {
    nom: string
    prenom: string
    email?: string
  }
}

export type JeunesAvecMessagesNonLus = (Jeune & { messagesNonLus: number })[]

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

export function compareJeunesByLastName(jeune1: Jeune, jeune2: Jeune): number {
  return `${jeune1.lastName}${jeune1.firstName}`.localeCompare(
    `${jeune2.lastName}${jeune2.firstName}`
  )
}

export function compareJeunesByLastNameDesc(
  jeune1: Jeune,
  jeune2: Jeune
): number {
  return -compareJeunesByLastName(jeune1, jeune2)
}

export function compareJeunesByFirstname(jeune1: Jeune, jeune2: Jeune): number {
  return `${jeune1.firstName}${jeune1.lastName}`.localeCompare(
    `${jeune2.firstName}${jeune2.lastName}`
  )
}

export function compareJeuneChat(a: JeuneChat, b: JeuneChat) {
  if (a.seenByConseiller !== b.seenByConseiller)
    return a.seenByConseiller ? 1 : -1
  return compareJeunesByFirstname(a, b)
}

export function getJeuneFullname(j: Jeune): string {
  return `${j.lastName} ${j.firstName}`
}
