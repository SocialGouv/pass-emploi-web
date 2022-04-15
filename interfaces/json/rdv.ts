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
  adresse?: string
  organisme?: string
  createur?: { id: string }
}

export interface RdvFormData {
  date: string
  duration: number
  jeuneId: string
  type: string
  presenceConseiller: boolean
  invitation: boolean
  precision?: string
  modality?: string
  adresse?: string
  organisme?: string
  comment?: string
}

export function jsonToRdv(rdvJson: RdvJson): Rdv {
  const { precision, createur, ...data } = rdvJson
  return {
    ...data,
    presenceConseiller: Boolean(rdvJson.presenceConseiller),
    invitation: Boolean(rdvJson.invitation),
    comment: rdvJson.comment ?? '',
    precisionType: precision ?? '',
    adresse: rdvJson.adresse ?? '',
    organisme: rdvJson.organisme ?? '',
    idCreateur: createur?.id ?? null,
  }
}
