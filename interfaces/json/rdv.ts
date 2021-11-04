export type RdvJson = {
  id: string
  title: string
  subtitle: string
  comment: string
  date: string
  duration: string,
  jeuneId: string
  modality: string
}

export interface RdvFormData {
  id: string
  title: string
  subtitle: string
  comment: string
  date: string
  duration: number,
  jeuneId: string
  modality: string
}