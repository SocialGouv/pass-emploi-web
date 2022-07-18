import { compareDates, compareDatesDesc } from 'utils/date'

/**
 * TODO: utiliser cette interface en classe mère pour Jeune lorsque la traduction sera faite
 */

export enum EtatSituation {
  EN_COURS = 'en cours',
  PREVU = 'prévue',
  TERMINE = 'terminée',
}

export enum CategorieSituation {
  EMPLOI = 'Emploi',
  CONTRAT_EN_ALTERNANCE = 'Contrat en Alternance',
  FORMATION = 'Formation',
  IMMERSION_EN_ENTREPRISE = 'Immersion en entreprise',
  PMSMP = 'Pmsmp',
  CONTRAT_DE_VOLONTARIAT_BENEVOLAT = 'Contrat de volontariat - bénévolat',
  SCOLARITE = 'Scolarité',
  DEMANDEUR_D_EMPLOI = "Demandeur d'emploi",
  SANS_SITUATION = 'Sans situation',
}

export interface BaseJeune {
  id: string
  prenom: string
  nom: string
}

export interface JeuneFromListe extends BaseJeune {
  lastActivity: string
  isActivated: boolean
  isReaffectationTemporaire: boolean
  conseillerPrecedent?: {
    nom: string
    prenom: string
    email?: string
  }
  situationCourante: CategorieSituation
}

export interface DetailJeune extends BaseJeune {
  creationDate: string
  isActivated: boolean
  isReaffectationTemporaire: boolean
  email?: string
  urlDossier?: string
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
}

export type JeuneAvecNbActionsNonTerminees = JeuneFromListe & {
  nbActionsNonTerminees: number
}

export type JeuneAvecInfosComplementaires = JeuneAvecNbActionsNonTerminees & {
  messagesNonLus: number
}

export interface Chat {
  chatId: string
  seenByConseiller: boolean
  flaggedByConseiller: boolean
  newConseillerMessageCount: number
  lastMessageContent: string | undefined
  lastMessageSentAt: Date | undefined
  lastMessageSentBy: string | undefined
  lastConseillerReading: Date | undefined
  lastJeuneReading: Date | undefined
  lastMessageIv: string | undefined
}

export type JeuneChat = BaseJeune & { isActivated: boolean } & Chat

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

export function compareJeunesByNom(
  jeune1: BaseJeune,
  jeune2: BaseJeune
): number {
  return `${jeune1.nom}${jeune1.prenom}`.localeCompare(
    `${jeune2.nom}${jeune2.prenom}`
  )
}

export function compareJeunesByLastNameDesc(
  jeune1: BaseJeune,
  jeune2: BaseJeune
): number {
  return -compareJeunesByNom(jeune1, jeune2)
}

export function compareJeunesBySituation(
  jeune1: JeuneFromListe,
  jeune2: JeuneFromListe
): number {
  return `${jeune1.situationCourante}`.localeCompare(
    `${jeune2.situationCourante}`
  )
}

export function compareJeunesBySituationDesc(
  jeune1: JeuneFromListe,
  jeune2: JeuneFromListe
): number {
  return -compareJeunesBySituation(jeune1, jeune2)
}

export function compareJeuneChat(a: JeuneChat, b: JeuneChat) {
  return (
    comparerParMessageNonLu(a, b) ||
    comparerParConversationSuivie(a, b) ||
    comparerParDate(a, b)
  )
}

export function compareJeuneByLastActivity(
  jeune1: JeuneFromListe,
  jeune2: JeuneFromListe,
  sortStatutCompteActif: number
) {
  const date1 = jeune1.lastActivity ? new Date(jeune1.lastActivity) : undefined
  const date2 = jeune2.lastActivity ? new Date(jeune2.lastActivity) : undefined
  return compareDates(date1, date2) || sortStatutCompteActif
}

export function compareJeuneByLastActivityDesc(
  jeune1: JeuneFromListe,
  jeune2: JeuneFromListe,
  sortStatutCompteActif: number
) {
  const date1 = jeune1.lastActivity ? new Date(jeune1.lastActivity) : undefined
  const date2 = jeune2.lastActivity ? new Date(jeune2.lastActivity) : undefined
  return compareDatesDesc(date1, date2) || -sortStatutCompteActif
}

export function getNomJeuneComplet(j: BaseJeune): string {
  return `${j.nom} ${j.prenom}`
}

function comparerParMessageNonLu(a: JeuneChat, b: JeuneChat): number {
  if (a.seenByConseiller && !b.seenByConseiller) return 1
  if (!a.seenByConseiller && b.seenByConseiller) return -1
  return 0
}

function comparerParConversationSuivie(a: JeuneChat, b: JeuneChat): number {
  if (a.flaggedByConseiller && !b.flaggedByConseiller) return -1
  if (!a.flaggedByConseiller && b.flaggedByConseiller) return 1
  return 0
}

function comparerParDate(a: JeuneChat, b: JeuneChat): number {
  if (a.lastMessageSentAt && b.lastMessageSentAt) {
    return a.lastMessageSentAt <= b.lastMessageSentAt ? 1 : -1
  }
  if (a.lastMessageSentAt) {
    return -1
  }
  if (b.lastMessageSentAt) {
    return 1
  }
  return 0
}
