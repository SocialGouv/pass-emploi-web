import {
  BeneficiaireEtablissement,
  BeneficiaireFromListe,
  CategorieSituation,
  CompteurHeuresPortefeuille,
  Demarche,
  DetailBeneficiaire,
  IdentiteBeneficiaire,
  IndicateursSemaine,
  MetadonneesFavoris,
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
  creationDate: string
  isReaffectationTemporaire: boolean
  estAArchiver: boolean
  dispositif: string
  lastActivity?: string
  situationCourante?: Situation
  dateFinCEJ?: string
  structureMilo?: { id: string }
}

export interface DetailBeneficiaireJson extends BaseBeneficiaireJson {
  creationDate: string
  isReaffectationTemporaire: boolean
  conseiller: { id: string }
  dispositif: string
  lastActivity?: string
  email?: string
  urlDossier?: string
  dateFinCEJ?: string
  situations?: Situation[]
  idPartenaire?: string
  estAArchiver?: boolean
}

export type BeneficiaireEtablissementJson = {
  jeune: IdentiteBeneficiaire
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
  dateFinAccompagnement: string
  commentaire?: string
}

export type IndicateursSemaineJson = {
  actions: {
    creees: number
    enRetard: number
    terminees: number
  }
  rendezVous: {
    planifies: number
  }
  offres: {
    sauvegardees: number
    postulees: number
  }
}

type CompteurHeuresDecalareesBeneficiaireUnique = {
  idJeune: string
  nbHeuresDeclarees: number
}

export type CompteursHeuresDeclareesPortefeuilleJson = {
  comptages: CompteurHeuresDecalareesBeneficiaireUnique[]
  dateDerniereMiseAJour: string
}

export type DemarcheJson = {
  id: string
  statut: StatutDemarche
  dateFin: string
  dateCreation: string
  label: string
  titre: string
  attributs: Array<{ cle: string; valeur: string }>
  sousTitre?: string
}

export function jsonToDemarche(json: DemarcheJson): Demarche {
  const description = json.attributs.find(
    ({ cle }) => cle === 'description'
  )?.valeur

  return {
    id: json.id,
    statut: json.statut,
    dateCreation: json.dateCreation,
    dateFin: json.dateFin,
    label: json.label,
    titre: description ?? json.titre,
    sousTitre: json.sousTitre,
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
): IdentiteBeneficiaire {
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
    situationCourante: toCategorieSituation(
      beneficiaire.situations?.at(0)?.categorie
    ),
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
    },
    rendezVous: indicateursJson.rendezVous.planifies,
    offres: {
      sauvegardees: indicateursJson.offres.sauvegardees,
      postulees: indicateursJson.offres.postulees,
    },
  }
}

export function jsonToComptageHeuresPortefeuille(
  comptageJson: CompteurHeuresDecalareesBeneficiaireUnique
): CompteurHeuresPortefeuille {
  return {
    idBeneficiaire: comptageJson.idJeune,
    nbHeuresDeclarees: comptageJson.nbHeuresDeclarees,
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
  dispositif: 'CEJ' | 'PACEA'
  email?: string
}
