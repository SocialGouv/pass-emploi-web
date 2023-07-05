export type DetailsSession = {
  session: {
    id: string
    nom: string
    dateHeureDebut: string
    dateHeureFin: string
    dateMaxInscription?: string
    lieu: string
    estVisible: boolean
    animateur?: string
    commentaire?: string
  }
  offre: {
    titre: string
    theme: string
    type: string
    description?: string
    partenaire?: string
  }
}
