import { Jeune, SituationJeune } from 'interfaces/jeune'

const enum EtatSituation {
  EN_COURS = 'EN_COURS',
  PREVU = 'PREVU',
  TERMINE = 'TERMINE',
}
interface Situation {
  etat: EtatSituation
  categorie: SituationJeune
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

export function jsonToJeune(jeune: JeuneJson): Jeune {
  return {
    ...jeune,
    situationCourante: jeune.situationCourante?.categorie ?? 'Sans situation',
    situations:
      jeune.situations?.map((situation) => ({
        ...situation,
        etat: mapEtatSituation[situation.etat],
      })) ?? [],
  }
}

export const mapEtatSituation: Record<EtatSituation, string> = {
  EN_COURS: 'en cours',
  PREVU: 'prévue',
  TERMINE: 'terminée',
}
