import { BaseJeune } from 'interfaces/jeune'

export type Rdv = {
  id: string
  subtitle: string
  comment: string
  date: string
  duration: string
  modality: string
  jeune: BaseJeune
}

export type RdvJeune = {
  id: string
  comment: string
  date: string
  duration: string
  modality: string
  jeune: BaseJeune
}
