export type DetailsSessionJson = {
  session: {
    id: string
    nom: string
    dateHeureDebut: string
    dateHeureFin: string
    dateMaxInscription?: string
    lieu: string
    nbPlacesDisponibles?: number
    estVisible: boolean
    animateur?: string
    commentaire?: string
  }
  offre: {
    id: string
    nom: string
    theme: string
    type: {
      code: string
      label: string
    }
    description?: string
    nomPartenaire?: string
  }
}
