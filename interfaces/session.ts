export type Session = {
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
    titre: string
    theme: string
    type: string
    description?: string
    partenaire?: string
  }
  inscriptions: Array<{
    idJeune: string
    nom: string
    prenom: string
    statut: string
  }>
}

export const StatutBeneficiaire = {
  INSCRIT: 'INSCRIT',
  DESINSCRIT: 'DESINSCRIT',
  REFUS_JEUNE: 'REFUS_JEUNE',
  REFUS_TIERS: 'REFUS_TIERS',
}
