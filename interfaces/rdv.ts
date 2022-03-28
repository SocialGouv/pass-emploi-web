import { BaseJeune } from 'interfaces/jeune'

export interface TypeRendezVous {
  code: string
  label: string
}

export type Rdv = {
  id: string
  comment: string
  date: string
  duration: string
  modality: string
  jeune: BaseJeune
}
