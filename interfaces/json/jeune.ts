import {
  BaseJeune,
  CategorieSituation,
  DetailJeune,
  EtatSituation,
  JeuneFromListe,
} from 'interfaces/jeune'

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
  email?: string
  urlDossier?: string
  situations?: Situation[]
}

export interface SuppressionJeuneFormData {
  motif: string
  commentaire?: string
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

export function jsonToBaseJeune(jeune: BaseJeuneJson): BaseJeune {
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
}: ItemJeuneJson): JeuneFromListe {
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
  ...jeune
}: DetailJeuneJson): DetailJeune {
  return {
    ...jeune,
    prenom: firstName,
    nom: lastName,
    situations:
      jeune.situations?.map((situation) => ({
        ...situation,
        categorie: toCategorieSituation(situation.categorie),
        etat: toEtatSituation(situation.etat),
      })) ?? [],
  }
}
