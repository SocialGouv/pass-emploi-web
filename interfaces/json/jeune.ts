import {
  BaseBeneficiaire,
  CategorieSituation,
  DetailBeneficiaire,
  EtatSituation,
  IndicateursSemaine,
  BeneficiaireEtablissement,
  BeneficiaireFromListe,
  MetadonneesFavoris,
} from 'interfaces/beneficiaire'

interface Situation {
  etat: string
  categorie: string
  dateFin?: string
}

export interface BaseJeuneJson {
  id: string
  firstName: string
  lastName: string
}

export interface ItemJeuneJson extends BaseJeuneJson {
  lastActivity: string
  isActivated: boolean
  isReaffectationTemporaire: boolean
  situationCourante?: Situation
}

export interface DetailJeuneJson extends BaseJeuneJson {
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

export type JeuneEtablissementJson = {
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

export interface SuppressionJeuneFormData {
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
      return CategorieSituation.IMMERSION_EN_ENTREPRISE
    case 'Pmsmp':
      return CategorieSituation.PMSMP
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

export function jsonToBaseJeune(jeune: BaseJeuneJson): BaseBeneficiaire {
  return {
    id: jeune.id,
    prenom: jeune.firstName,
    nom: jeune.lastName,
  }
}

export function jsonToItemJeune({
  firstName,
  lastName,
  ...jeune
}: ItemJeuneJson): BeneficiaireFromListe {
  return {
    ...jeune,
    prenom: firstName,
    nom: lastName,
    situationCourante: toCategorieSituation(jeune.situationCourante?.categorie),
  }
}

export function jsonToDetailJeune({
  firstName,
  lastName,
  conseiller,
  ...jeune
}: DetailJeuneJson): DetailBeneficiaire {
  return {
    ...jeune,
    estAArchiver: Boolean(jeune.estAArchiver),
    prenom: firstName,
    nom: lastName,
    idConseiller: conseiller.id,
    situations:
      jeune.situations?.map((situation) => ({
        ...situation,
        categorie: toCategorieSituation(situation.categorie),
        etat: toEtatSituation(situation.etat),
      })) ?? [],
    idPartenaire: jeune.idPartenaire ?? '',
  }
}

export function jsonToJeuneEtablissement({
  jeune,
  ...json
}: JeuneEtablissementJson): BeneficiaireEtablissement {
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

export interface JeunePoleEmploiFormData {
  prenom: string
  nom: string
  email: string
}

export interface JeuneMiloFormData {
  idDossier: string
  nom: string
  prenom: string
  email?: string
}
