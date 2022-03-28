import { BaseJeune } from 'interfaces/jeune'
import { durees } from 'referentiel/rdv'
import { Rdv } from '../rdv'

export interface RdvJson {
  id: string
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
  presenceConseiller: boolean
}

export function jsonToRdv(rdvData: RdvJson): Rdv {
  return {
    ...rdvData,
    duration:
      durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
      `${rdvData.duration} min`,
  }
}

export const TYPE_RENDEZ_VOUS = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}
