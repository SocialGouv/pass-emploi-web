import {
  BaseBeneficiaire,
  CategorieSituation,
  DetailBeneficiaire,
  EtatSituation,
  IndicateursSemaine,
  BeneficiaireEtablissement,
  BeneficiaireFromListe,
  MetadonneesFavoris,
  Demarche,
} from 'interfaces/beneficiaire'

export enum StatutDemarche {
  EN_COURS = 'EN_COURS',
  A_FAIRE = 'A_FAIRE',
  REALISEE = 'REALISEE',
  ANNULEE = 'ANNULEE',
}

interface Situation {
  etat: string
  categorie: string
  dateFin?: string
}

export interface BaseBeneficiaireJson {
  id: string
  firstName: string
  lastName: string
}

export interface ItemBeneficiaireJson extends BaseBeneficiaireJson {
  lastActivity: string
  isActivated: boolean
  isReaffectationTemporaire: boolean
  situationCourante?: Situation
  dateFinCEJ?: string
}

export interface DetailBeneficiaireJson extends BaseBeneficiaireJson {
  creationDate: string
  isActivated: boolean
  isReaffectationTemporaire: boolean
  conseiller: { id: string }
  email?: string
  urlDossier?: string
  dateFinCEJ?: string
  situations?: Situation[]
  idPartenaire?: string
  estAArchiver?: boolean
}

export type BeneficiaireEtablissementJson = {
  jeune: BaseBeneficiaire
  referent: { id: string; nom: string; prenom: string }
  situation?: string
  dateDerniereActivite?: string
}

export interface MetadonneesFavorisJson {
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

export interface SuppressionBeneficiaireFormData {
  motif: string
  commentaire?: string
}

export type IndicateursSemaineJson = {
  actions: {
    creees: number
    enRetard: number
    terminees: number
    aEcheance: number
  }
  rendezVous: {
    planifies: number
  }
  offres: {
    consultees: number
    partagees: number
  }
  favoris: {
    offresSauvegardees: number
    recherchesSauvegardees: number
  }
}

export type DemarcheJson = {
  id: string
  statut: StatutDemarche
  dateFin: string
  dateCreation: string
  label: string
  titre: string
}

export function jsonToDemarche(demarche: DemarcheJson): Demarche {
  return {
    id: demarche.id,
    statut: demarche.statut,
    dateCreation: demarche.dateCreation,
    dateFin: demarche.dateFin,
    label: demarche.label,
    titre: demarche.titre,
  }
}

function toEtatSituation(etat: string): EtatSituation | undefined {
  switch (etat) {
    case 'EN_COURS':
      return EtatSituation.EN_COURS
    case 'PREVU':
      return EtatSituation.PREVU
    case 'terminée':
      return EtatSituation.TERMINE
    default:
      return undefined
  }
}

function toCategorieSituation(categorie?: string): CategorieSituation {
  switch (categorie) {
    case 'Emploi':
      return CategorieSituation.EMPLOI
    case 'Contrat en Alternance':
      return CategorieSituation.CONTRAT_EN_ALTERNANCE
    case 'Formation':
      return CategorieSituation.FORMATION
    case 'Immersion en entreprise':
    case 'Pmsmp':
      return CategorieSituation.IMMERSION_EN_ENTREPRISE
    case 'Contrat de volontariat - bénévolat':
      return CategorieSituation.CONTRAT_DE_VOLONTARIAT_BENEVOLAT
    case 'Scolarité':
      return CategorieSituation.SCOLARITE
    case "Demandeur d'emploi":
      return CategorieSituation.DEMANDEUR_D_EMPLOI
    default:
      return CategorieSituation.SANS_SITUATION
  }
}

export function jsonToBaseBeneficiaire(
  beneficiaire: BaseBeneficiaireJson
): BaseBeneficiaire {
  return {
    id: beneficiaire.id,
    prenom: beneficiaire.firstName,
    nom: beneficiaire.lastName,
  }
}

export function jsonToItemBeneficiaire({
  firstName,
  lastName,
  ...beneficiaire
}: ItemBeneficiaireJson): BeneficiaireFromListe {
  return {
    ...beneficiaire,
    prenom: firstName,
    nom: lastName,
    situationCourante: toCategorieSituation(
      beneficiaire.situationCourante?.categorie
    ),
  }
}

export function jsonToDetailBeneficiaire({
  firstName,
  lastName,
  conseiller,
  ...beneficiaire
}: DetailBeneficiaireJson): DetailBeneficiaire {
  return {
    ...beneficiaire,
    estAArchiver: Boolean(beneficiaire.estAArchiver),
    prenom: firstName,
    nom: lastName,
    idConseiller: conseiller.id,
    situations:
      beneficiaire.situations?.map((situation) => ({
        ...situation,
        categorie: toCategorieSituation(situation.categorie),
        etat: toEtatSituation(situation.etat),
      })) ?? [],
    idPartenaire: beneficiaire.idPartenaire ?? '',
  }
}

export function jsonToBeneficiaireEtablissement({
  jeune,
  ...json
}: BeneficiaireEtablissementJson): BeneficiaireEtablissement {
  return {
    ...json,
    base: jeune,
    situation: toCategorieSituation(json.situation),
  }
}

export function jsonToMetadonneesFavoris({
  favoris,
}: {
  favoris: MetadonneesFavorisJson
}): MetadonneesFavoris {
  const { autoriseLePartage, offres, recherches } = favoris
  return {
    autoriseLePartage: autoriseLePartage ?? null,
    offres: {
      total: offres.total,
      nombreOffresEmploi: offres.nombreOffresEmploi,
      nombreOffresAlternance: offres.nombreOffresAlternance,
      nombreOffresImmersion: offres.nombreOffresImmersion,
      nombreOffresServiceCivique: offres.nombreOffresServiceCivique,
    },
    recherches: {
      total: recherches.total,
      nombreRecherchesOffresAlternance:
        recherches.nombreRecherchesOffresAlternance,
      nombreRecherchesOffresEmploi: recherches.nombreRecherchesOffresEmploi,
      nombreRecherchesOffresImmersion:
        recherches.nombreRecherchesOffresImmersion,
      nombreRecherchesOffresServiceCivique:
        recherches.nombreRecherchesOffresServiceCivique,
    },
  }
}

export function jsonToIndicateursSemaine(
  indicateursJson: IndicateursSemaineJson
): IndicateursSemaine {
  return {
    actions: {
      creees: indicateursJson.actions.creees,
      enRetard: indicateursJson.actions.enRetard,
      terminees: indicateursJson.actions.terminees,
      aEcheance: indicateursJson.actions.aEcheance,
    },
    rendezVous: indicateursJson.rendezVous.planifies,
    offres: {
      partagees: indicateursJson.offres.partagees,
      consultees: indicateursJson.offres.consultees,
    },
    favoris: {
      offresSauvegardees: indicateursJson.favoris.offresSauvegardees,
      recherchesSauvegardees: indicateursJson.favoris.recherchesSauvegardees,
    },
  }
}

export interface BeneficiaireFranceTravailFormData {
  prenom: string
  nom: string
  email: string
}

export interface BeneficiaireMiloFormData {
  idDossier: string
  nom: string
  prenom: string
  email?: string
}
