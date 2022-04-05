import { BaseJeune } from 'interfaces/jeune'

export interface TypeRendezVous {
  code: string
  label: string
}

export interface Rdv {
  id: string
  jeune: BaseJeune
  date: string
  duration: number
  modality: string
  type: TypeRendezVous
  presenceConseiller: boolean
  invitation: boolean
  precisionType: string
  comment: string
}

export const TYPE_RENDEZ_VOUS = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}
