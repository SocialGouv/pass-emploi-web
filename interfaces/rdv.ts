import { BaseJeune } from 'interfaces/jeune'

export enum TypeRendezVous {
  ACTIVITE_EXTERIEURES = 'ACTIVITES_EXTERIEURES',
  ATELIER = 'ATELIER',
  ENTRETIEN_INDIVIDUEL_CONSEILLER = 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
  ENTRETIEN_PARTENAIRE = 'ENTRETIEN_PARTENAIRE',
  INFORMATION_COLLECTIVE = 'INFORMATION_COLLECTIVE',
  VISITE = 'VISITE',
  PRESTATION = 'PRESTATION',
  AUTRE = 'AUTRE',
}

export const mapStringToTypeRdv = (type: string): TypeRendezVous => {
  switch (type) {
    case 'Activités extérieures':
      return TypeRendezVous.ACTIVITE_EXTERIEURES
    case 'Atelier':
      return TypeRendezVous.ATELIER
    case 'Entretien individuel conseiller':
      return TypeRendezVous.ENTRETIEN_INDIVIDUEL_CONSEILLER
    case 'Entretien par un partenaire':
      return TypeRendezVous.ENTRETIEN_PARTENAIRE
    case 'Information collective':
      return TypeRendezVous.INFORMATION_COLLECTIVE
    case 'Visite':
      return TypeRendezVous.VISITE
    case 'Autre':
      return TypeRendezVous.AUTRE
    default:
      return TypeRendezVous.ENTRETIEN_INDIVIDUEL_CONSEILLER
  }
}

export type Rdv = {
  id: string
  subtitle: string
  comment: string
  date: string
  duration: string
  type?: TypeRendezVous
  modality: string
  jeune: BaseJeune
}

export type RdvJeune = {
  id: string
  comment: string
  date: string
  duration: string
  type?: TypeRendezVous
  modality: string
  jeune: BaseJeune
}
