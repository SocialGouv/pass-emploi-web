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
    autoinscription: boolean
    animateur?: string
    commentaire?: string
    statut: string
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
export type InformationBeneficiaireSession = {
  idJeune: string
  statut: string
  commentaire?: string
  nom?: string
  prenom?: string
}

export const StatutBeneficiaire = {
  PRESENT: 'PRESENT',
  INSCRIT: 'INSCRIT',
  DESINSCRIT: 'DESINSCRIT',
  REFUS_JEUNE: 'REFUS_JEUNE',
  REFUS_TIERS: 'REFUS_TIERS',
}

export function estAClore(session: Session) {
  return session.session.statut === 'AClore'
}

export function estClose(session: Session) {
  return session.session.statut === 'Close'
}
