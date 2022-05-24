import { Jeune } from 'interfaces/jeune'

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
  situationCourante?: {
    etat: string
    categorie: string
    dateFin?: string
  }
}

export function jsonToJeune(jeune: JeuneJson): Jeune {
  return {
    ...jeune,
    situationCourante: jeune.situationCourante
      ? jeune.situationCourante.categorie
      : 'Sans situation',
  }
}
