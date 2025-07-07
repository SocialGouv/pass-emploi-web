import { DateTime } from 'luxon'

import { StatutDemarche } from 'interfaces/json/beneficiaire'

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

export type Portefeuille = BeneficiaireWithActivity[]

export type IdentiteBeneficiaire = {
  id: string
  prenom: string
  nom: string
}

export type BeneficiaireWithActivity = IdentiteBeneficiaire & {
  creationDate: string
  estAArchiver: boolean
  lastActivity?: string
  dateFinCEJ?: string
}

type BaseBeneficiaire = BeneficiaireWithActivity & {
  isReaffectationTemporaire: boolean
  situationCourante: CategorieSituation
  dispositif: string
  structureMilo?: { id: string }
}

export type BeneficiaireFromListe = BaseBeneficiaire & {
  conseillerPrecedent?: {
    nom: string
    prenom: string
    email?: string
  }
}

export type DetailBeneficiaire = BaseBeneficiaire & {
  idConseiller: string
  email?: string
  urlDossier?: string
  idPartenaire?: string
  peutVoirLeComptageDesHeures?: boolean
}

export type MetadonneesFavoris = {
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
  base: IdentiteBeneficiaire
  referent: { id: string; nom: string; prenom: string }
  situation?: CategorieSituation
  dateDerniereActivite?: string
}

export type Chat = {
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

export type BeneficiaireEtChat = IdentiteBeneficiaire & Chat

export type DossierMilo = {
  id: string
  prenom: string
  nom: string
  dateDeNaissance: string
  codePostal: string
  email?: string
}

export type ConseillerHistorique = {
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
  }
  rendezVous: number
  offres: {
    sauvegardees: number
    postulees: number
  }
  heures?: {
    declarees: number
    validees: number
  }
}

export type Demarche = {
  id: string
  statut: StatutDemarche
  dateCreation: string
  dateFin: string
  label: string
  titre: string
  sousTitre?: string
}

export type CompteurHeuresPortefeuille = {
  comptages: Array<{
    idBeneficiaire: string
    nbHeuresDeclarees: number
  }>
  dateDerniereMiseAJour: string
}

export type CompteurHeuresFicheBeneficiaire = {
  nbHeuresDeclarees: number
  nbHeuresValidees: number
  dateDerniereMiseAJour: string
}

export function estCEJ({ dispositif }: { dispositif: string }): boolean {
  return dispositif === 'CEJ'
}

export function compareBeneficiairesByNom(
  beneficiaire1: IdentiteBeneficiaire,
  beneficiaire2: IdentiteBeneficiaire
): number {
  return `${beneficiaire1.nom}${beneficiaire1.prenom}`.localeCompare(
    `${beneficiaire2.nom}${beneficiaire2.prenom}`
  )
}

export function compareBeneficiairesBySituation(
  beneficiaire1: BeneficiaireFromListe,
  beneficiaire2: BeneficiaireFromListe
): number {
  return `${beneficiaire1.situationCourante}`.localeCompare(
    `${beneficiaire2.situationCourante}`
  )
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

export function getNomBeneficiaireComplet(
  b: Pick<IdentiteBeneficiaire, 'nom' | 'prenom'>
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

export function extractBaseBeneficiaire(
  base: IdentiteBeneficiaire
): IdentiteBeneficiaire {
  return { id: base.id, nom: base.nom, prenom: base.prenom }
}

export function extractBeneficiaireWithActivity(
  beneficiaire: BeneficiaireWithActivity
): BeneficiaireWithActivity {
  return {
    ...extractBaseBeneficiaire(beneficiaire),
    creationDate: beneficiaire.creationDate,
    lastActivity: beneficiaire.lastActivity,
    dateFinCEJ: beneficiaire.dateFinCEJ,
    estAArchiver: beneficiaire.estAArchiver,
  }
}
