import { BaseJeune } from 'interfaces/jeune'

export interface TypeRendezVous {
  code: string
  label: string
}

export type Rdv = {
  id: string
  subtitle: string
  comment: string
  date: string
  duration: string
  modality: string
  jeune: BaseJeune
  type: TypeRendezVous
}

export const TYPE_RENDEZ_VOUS = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}
