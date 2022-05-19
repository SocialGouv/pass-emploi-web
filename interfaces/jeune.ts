import { compareDates, compareDatesDesc } from 'utils/date'

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
  situation: string
}

export type JeuneAvecNbActionsNonTerminees = Jeune & {
  nbActionsNonTerminees: number
}

export type JeuneAvecInfosComplementaires = JeuneAvecNbActionsNonTerminees & {
  messagesNonLus: number
}

export interface Chat {
  chatId: string
  seenByConseiller: boolean
  newConseillerMessageCount: number
  lastMessageContent: string | undefined
  lastMessageSentAt: Date | undefined
  lastMessageSentBy: string | undefined
  lastConseillerReading: Date | undefined
  lastJeuneReading: Date | undefined
  lastMessageIv: string | undefined
}

export type JeuneChat = Jeune & Chat

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

export interface ConseillerHistorique {
  id: string
  email: string
  nom: string
  prenom: string
  depuis: string
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

export function compareJeunesBySituation(jeune1: Jeune, jeune2: Jeune): number {
  return `${jeune1.situation}`.localeCompare(`${jeune2.situation}`)
}
export function compareJeunesBySituationDesc(
  jeune1: Jeune,
  jeune2: Jeune
): number {
  return -compareJeunesBySituation(jeune1, jeune2)
}

export function compareJeuneChat(a: JeuneChat, b: JeuneChat) {
  if (a.seenByConseiller !== b.seenByConseiller)
    return a.seenByConseiller ? 1 : -1
  return compareJeunesByFirstname(a, b)
}

export function compareJeuneByLastActivity(
  jeune1: Jeune,
  jeune2: Jeune,
  sortStatutCompteActif: number
) {
  const date1 = jeune1.lastActivity ? new Date(jeune1.lastActivity) : undefined
  const date2 = jeune2.lastActivity ? new Date(jeune2.lastActivity) : undefined
  return compareDates(date1, date2) || sortStatutCompteActif
}

export function compareJeuneByLastActivityDesc(
  jeune1: Jeune,
  jeune2: Jeune,
  sortStatutCompteActif: number
) {
  const date1 = jeune1.lastActivity ? new Date(jeune1.lastActivity) : undefined
  const date2 = jeune2.lastActivity ? new Date(jeune2.lastActivity) : undefined
  return compareDatesDesc(date1, date2) || -sortStatutCompteActif
}

export function getJeuneFullname(j: Jeune): string {
  return `${j.lastName} ${j.firstName}`
}
