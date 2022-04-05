import { BaseJeune } from 'interfaces/jeune'
import { Rdv, TypeRendezVous } from '../rdv'

export interface RdvJson {
  id: string
  date: string
  duration: number
  type: TypeRendezVous
  modality: string
  jeune: BaseJeune
  precision?: string
  comment?: string
  presenceConseiller?: boolean
  invitation?: boolean
}

export interface RdvFormData {
  comment: string
  date: string
  duration: number
  jeuneId: string
  type: string
  precision?: string
  modality?: string
  adresse?: string
  organisme?: string
  presenceConseiller: boolean
  invitation: boolean
}

export function jsonToRdv(rdvData: RdvJson): Rdv {
  return {
    ...rdvData,
    presenceConseiller: Boolean(rdvData.presenceConseiller),
    invitation: Boolean(rdvData.invitation),
    comment: rdvData.comment ?? '',
    precisionType: rdvData.precision ?? '',
  }
}
