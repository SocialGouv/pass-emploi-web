import { DateTime } from 'luxon'

import { StatutDemarche } from 'interfaces/json/beneficiaire'
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
  IMMERSION_EN_ENTREPRISE = 'Immersion',
  PMSMP = 'Pmsmp',
  CONTRAT_DE_VOLONTARIAT_BENEVOLAT = 'Contrat de volontariat - bénévolat',
  SCOLARITE = 'Scolarité',
  DEMANDEUR_D_EMPLOI = "Demandeur d'emploi",
  SANS_SITUATION = 'Sans situation',
}

export interface BaseBeneficiaire {
  id: string
  prenom: string
  nom: string
}

export interface BeneficiaireFromListe extends BaseBeneficiaire {
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
  dateFinCEJ?: string
}

export interface DetailBeneficiaire extends BaseBeneficiaire {
  creationDate: string
  isActivated: boolean
  isReaffectationTemporaire: boolean
  idConseiller: string
  situations: Array<{
    categorie: CategorieSituation
    etat?: EtatSituation
    dateFin?: string
  }>
  estAArchiver: boolean
  email?: string
  urlDossier?: string
  dateFinCEJ?: string
  idPartenaire?: string
  structureMilo?: { id: string }
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

export type BeneficiaireAvecCompteursActionsRdvs = BeneficiaireFromListe & {
  actionsCreees: number
  rdvs: number
}

export type BeneficiaireAvecInfosComplementaires =
  BeneficiaireAvecCompteursActionsRdvs & {
    messagesNonLus: number
  }

export type BeneficiaireEtablissement = {
  base: BaseBeneficiaire
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

export type BeneficiaireEtChat = BaseBeneficiaire & Chat

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

export type Demarche = {
  id: string
  statut: StatutDemarche
  dateCreation: string
  dateFin: string
  label: string
  titre: string
}

export function compareBeneficiairesByNom(
  beneficiaire1: BaseBeneficiaire,
  beneficiaire2: BaseBeneficiaire
): number {
  return `${beneficiaire1.nom}${beneficiaire1.prenom}`.localeCompare(
    `${beneficiaire2.nom}${beneficiaire2.prenom}`
  )
}

export function compareBeneficiairesByLastNameDesc(
  beneficiaire1: BaseBeneficiaire,
  beneficiaire2: BaseBeneficiaire
): number {
  return -compareBeneficiairesByNom(beneficiaire1, beneficiaire2)
}

export function compareBeneficiairesBySituation(
  beneficiaire1: BeneficiaireFromListe,
  beneficiaire2: BeneficiaireFromListe
): number {
  return `${beneficiaire1.situationCourante}`.localeCompare(
    `${beneficiaire2.situationCourante}`
  )
}

export function compareBeneficiairesBySituationDesc(
  beneficiaire1: BeneficiaireFromListe,
  beneficiaire2: BeneficiaireFromListe
): number {
  return -compareBeneficiairesBySituation(beneficiaire1, beneficiaire2)
}

export function compareBeneficiaireChat(
  a: BeneficiaireEtChat,
  b: BeneficiaireEtChat
) {
  return (
    comparerParMessageNonLu(a, b) ||
    comparerParConversationSuivie(a, b) ||
    comparerParDate(a, b)
  )
}

export function compareBeneficiairesByLastActivity(
  beneficiaire1: BeneficiaireFromListe,
  beneficiaire2: BeneficiaireFromListe,
  sortStatutCompteActif: number
) {
  const date1 = beneficiaire1.lastActivity
    ? DateTime.fromISO(beneficiaire1.lastActivity)
    : undefined
  const date2 = beneficiaire2.lastActivity
    ? DateTime.fromISO(beneficiaire2.lastActivity)
    : undefined
  return compareDates(date1, date2) || sortStatutCompteActif
}

export function compareBeneficiairesByLastActivityDesc(
  beneficiaire1: BeneficiaireFromListe,
  beneficiaire2: BeneficiaireFromListe,
  sortStatutCompteActif: number
) {
  const date1 = beneficiaire1.lastActivity
    ? DateTime.fromISO(beneficiaire1.lastActivity)
    : undefined
  const date2 = beneficiaire2.lastActivity
    ? DateTime.fromISO(beneficiaire2.lastActivity)
    : undefined
  return compareDatesDesc(date1, date2) || -sortStatutCompteActif
}

export function getNomBeneficiaireComplet(
  b: Pick<BaseBeneficiaire, 'nom' | 'prenom'>
): string {
  return `${b.nom} ${b.prenom}`
}

export function compareParId(idA: string, idB: string): number {
  return idA.localeCompare(idB)
}

function comparerParMessageNonLu(
  a: BeneficiaireEtChat,
  b: BeneficiaireEtChat
): number {
  if (a.seenByConseiller && !b.seenByConseiller) return 1
  if (!a.seenByConseiller && b.seenByConseiller) return -1
  return 0
}

function comparerParConversationSuivie(
  a: BeneficiaireEtChat,
  b: BeneficiaireEtChat
): number {
  if (a.flaggedByConseiller && !b.flaggedByConseiller) return -1
  if (!a.flaggedByConseiller && b.flaggedByConseiller) return 1
  return 0
}

function comparerParDate(a: BeneficiaireEtChat, b: BeneficiaireEtChat): number {
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
