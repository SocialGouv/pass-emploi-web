import { BaseJeune } from 'interfaces/jeune'
import { durees } from 'referentiel/rdv'
import { TypeRendezVous, Rdv } from '../rdv'

export interface RdvJson {
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
  type: string
  precision: string
  modality: string
}

export function jsonToRdv(rdvData: RdvJson): Rdv {
  return {
    ...rdvData,
    duration:
      durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
      `${rdvData.duration} min`,
  }
}
