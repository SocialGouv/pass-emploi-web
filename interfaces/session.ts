import { SessionJson } from 'interfaces/json/session'

export type Session = {
  session: {
    id: string
    nom: string
    dateHeureDebut: string
    dateHeureFin: string
    dateMaxInscription?: string
    animateur?: string
    lieu: string
    nbPlacesDisponibles?: number
    commentaire?: string
  }
  offre: {
    id: string
    titre: string
    theme: string
    type: {
      code: string
      label: string
    }
    description?: string
    partenaire?: string
  }
}

export function jsonToSession(json: SessionJson): Session {
  const session: Session = {
    session: {
      id: json.session.id,
      nom: json.session.nom,
      dateHeureDebut: json.session.dateHeureDebut,
      dateHeureFin: json.session.dateHeureFin,
      lieu: json.session.lieu,
    },
    offre: {
      id: json.offre.id,
      titre: json.offre.nom,
      theme: json.offre.theme,
      type: {
        code: json.offre.type.code,
        label: json.offre.type.label,
      },
    },
  }

  if (json.offre.description) session.offre.description = json.offre.description
  if (json.offre.nomPartenaire)
    session.offre.partenaire = json.offre.nomPartenaire

  if (json.session.dateMaxInscription)
    session.session.dateMaxInscription = json.session.dateMaxInscription
  if (json.session.animateur) session.session.animateur = json.session.animateur
  if (json.session.nbPlacesDisponibles)
    session.session.nbPlacesDisponibles = json.session.nbPlacesDisponibles
  if (json.session.commentaire)
    session.session.commentaire = json.session.commentaire

  return session
}
