import { BaseJeune } from 'interfaces/jeune'

export type RdvJson = {
  id: string
  subtitle: string
  comment: string
  date: string
  duration: string
  jeuneId: string
  modality: string
  jeune: BaseJeune
}

export interface RdvFormData {
  comment: string
  date: string
  duration: number
  jeuneId: string
  modality: string
}
