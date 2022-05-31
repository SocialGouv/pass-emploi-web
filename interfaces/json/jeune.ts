import { Jeune, CategorieSituation, EtatSituation } from 'interfaces/jeune'
interface Situation {
  etat: string
  categorie: string
  dateFin?: string
}

export interface JeuneJson {
  id: string
  firstName: string
  lastName: string
  creationDate: string
  lastActivity: string
  email?: string
  isActivated?: boolean
  urlDossier?: string
  conseillerPrecedent?: {
    nom: string
    prenom: string
    email?: string
  }
  situationCourante?: Situation
  situations?: Situation[]
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

export function jsonToJeune(jeune: JeuneJson): Jeune {
  return {
    ...jeune,
    situationCourante: toCategorieSituation(jeune.situationCourante?.categorie),
    situations:
      jeune.situations?.map((situation) => ({
        ...situation,
        categorie: toCategorieSituation(situation.categorie),
        etat: toEtatSituation(situation.etat),
      })) ?? [],
  }
}
