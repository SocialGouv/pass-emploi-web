import { DetailImmersion, TypeOffre } from 'interfaces/offre'

export type ImmersionItemJson = {
  id: string
  metier: string
  nomEtablissement: string
  ville: string
  secteurActivite: string
}

export type DetailImmersionJson = {
  id: string
  metier: string
  nomEtablissement: string
  secteurActivite: string
  ville: string
  adresse: string
  contact?: {
    nom: string
    prenom: string
    role: string
    telephone?: string
    email?: string
  }
}

export function jsonToDetailImmersion(
  json: DetailImmersionJson
): DetailImmersion {
  const immersion: DetailImmersion = {
    type: TypeOffre.IMMERSION,
    id: json.id,
    titre: json.metier,
    nomEtablissement: json.nomEtablissement,
    ville: json.ville,
    secteurActivite: json.secteurActivite,
    contact: { adresse: json.adresse },
  }

  const { contact } = json
  if (contact) {
    immersion.contact.nom = contact.nom
    immersion.contact.prenom = contact.prenom
    immersion.contact.role = contact.role
  }
  if (contact?.telephone) immersion.contact.telephone = contact.telephone
  if (contact?.email) immersion.contact.email = contact.email

  return immersion
}
