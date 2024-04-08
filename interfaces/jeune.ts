import { DateTime } from 'luxon'

import { compareDates, compareDatesDesc } from 'utils/date'

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
  isActivated: boolean
  isReaffectationTemporaire: boolean
  lastActivity?: string
  conseillerPrecedent?: {
    nom: string
    prenom: string
    email?: string
  }
  situationCourante: CategorieSituation
  structureMilo?: { id: string }
}

export interface DetailJeune extends BaseJeune {
  creationDate: string
  isActivated: boolean
  isReaffectationTemporaire: boolean
  idConseiller: string
  email?: string
  urlDossier?: string
  dateFinCEJ?: string
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
  idPartenaire?: string
  structureMilo?: { id: string }
  estAArchiver?: boolean
}

export interface MetadonneesFavoris {
  autoriseLePartage: boolean
  offres: {
    total: number
    nombreOffresEmploi: number
    nombreOffresAlternance: number
    nombreOffresImmersion: number
    nombreOffresServiceCivique: number
  }
  recherches: {
    total: number
    nombreRecherchesOffresEmploi: number
    nombreRecherchesOffresAlternance: number
    nombreRecherchesOffresImmersion: number
    nombreRecherchesOffresServiceCivique: number
  }
}

export type JeuneAvecNbActionsNonTerminees = JeuneFromListe & {
  nbActionsNonTerminees: number
}

export type JeuneAvecInfosComplementaires = JeuneAvecNbActionsNonTerminees & {
  messagesNonLus: number
}

export type JeuneEtablissement = {
  base: BaseJeune
  referent: { id: string; nom: string; prenom: string }
  situation?: CategorieSituation
  dateDerniereActivite?: string
}

export interface Chat {
  chatId: string
  seenByConseiller: boolean
  flaggedByConseiller: boolean
  newConseillerMessageCount: number
  lastMessageContent: string | undefined
  lastMessageSentAt: DateTime | undefined
  lastMessageSentBy: string | undefined
  lastConseillerReading: DateTime | undefined
  lastJeuneReading: DateTime | undefined
  lastMessageIv: string | undefined
}

export type JeuneChat = BaseJeune & Chat

export interface DossierMilo {
  id: string
  prenom: string
  nom: string
  dateDeNaissance: string
  codePostal: string
  email?: string
}

export interface ConseillerHistorique {
  id: string
  nom: string
  prenom: string
  depuis: string
}

export type IndicateursSemaine = {
  actions: {
    creees: number
    enRetard: number
    terminees: number
    aEcheance: number
  }
  rendezVous: number
  offres: {
    consultees: number
    partagees: number
  }
  favoris: {
    offresSauvegardees: number
    recherchesSauvegardees: number
  }
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
  const date1 = jeune1.lastActivity
    ? DateTime.fromISO(jeune1.lastActivity)
    : undefined
  const date2 = jeune2.lastActivity
    ? DateTime.fromISO(jeune2.lastActivity)
    : undefined
  return compareDates(date1, date2) || sortStatutCompteActif
}

export function compareJeuneByLastActivityDesc(
  jeune1: JeuneFromListe,
  jeune2: JeuneFromListe,
  sortStatutCompteActif: number
) {
  const date1 = jeune1.lastActivity
    ? DateTime.fromISO(jeune1.lastActivity)
    : undefined
  const date2 = jeune2.lastActivity
    ? DateTime.fromISO(jeune2.lastActivity)
    : undefined
  return compareDatesDesc(date1, date2) || -sortStatutCompteActif
}

export function getNomJeuneComplet(
  j: Pick<BaseJeune, 'nom' | 'prenom'>
): string {
  return `${j.nom} ${j.prenom}`
}

export function compareParId(idA: string, idB: string): number {
  return idA.localeCompare(idB)
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
