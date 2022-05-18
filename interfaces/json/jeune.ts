import { Jeune } from 'interfaces/jeune'

export interface JeuneDuConseillerJson {
  id: string
  firstName: string
  lastName: string
  creationDate: string
  lastActivity: string
  email?: string
  isActivated?: boolean
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

export function toJeuneDuConseiller(jeune: JeuneDuConseillerJson): Jeune {
  return {
    ...jeune,
    situation: jeune.situationCourante
      ? jeune.situationCourante.categorie
      : 'Sans situation',
  }
}
