import { BaseJeune } from 'interfaces/jeune'

export interface TypeRendezVous {
  code: string
  label: string
}

export interface Rdv {
  id: string
  jeune: BaseJeune
  type: TypeRendezVous
  precisionType: string
  modality: string
  date: string
  duration: number
  adresse: string
  organisme: string
  presenceConseiller: boolean
  invitation: boolean
  comment: string
}

export const TYPE_RENDEZ_VOUS = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}
