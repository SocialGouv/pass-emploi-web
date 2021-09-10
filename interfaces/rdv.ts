import { Jeune } from 'interfaces';

export type Rdv = {
  id: string
  title: string
  subtitle: string
  comment: string
  date: string
  duration: string
  jeune: Jeune
  modality: string
}
