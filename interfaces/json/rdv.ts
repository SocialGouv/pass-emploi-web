import { BaseJeune } from 'interfaces/jeune'
import { Rdv, TYPE_RENDEZ_VOUS, TypeRendezVous } from 'interfaces/rdv'

export interface RdvJson {
  id: string
  date: string
  duration: number
  type: TypeRendezVous
  modality: string
  jeunes: BaseJeune[]
  precision?: string
  title?: string
  comment?: string
  presenceConseiller?: boolean
  invitation?: boolean
  adresse?: string
  organisme?: string
  createur?: { id: string; nom: string; prenom: string }
}

export type RdvJeuneJson = Omit<RdvJson, 'jeunes'> & { jeune: BaseJeune }

export interface RdvFormData {
  date: string
  duration: number
  jeunesIds: string[]
  type: string
  presenceConseiller: boolean
  invitation: boolean
  precision?: string
  modality?: string
  adresse?: string
  organisme?: string
  titre?: string
  comment?: string
}

export function rdvJeuneJsonToRdv(rdvJeuneJson: RdvJeuneJson): Rdv {
  const { jeune, ...data } = rdvJeuneJson
  return jsonToRdv({ ...data, jeunes: [jeune] })
}

export function jsonToRdv(rdvJson: RdvJson): Rdv {
  const { precision, createur, title, ...data } = rdvJson
  return {
    ...data,
    titre: jsonToTitreRdv(rdvJson),
    presenceConseiller: Boolean(rdvJson.presenceConseiller),
    invitation: Boolean(rdvJson.invitation),
    comment: rdvJson.comment ?? '',
    precisionType: precision ?? '',
    adresse: rdvJson.adresse ?? '',
    organisme: rdvJson.organisme ?? '',
    createur: createur ?? null,
  }
}

function jsonToTitreRdv(json: RdvJson): string {
  const typeLabel =
    json.type.code === TYPE_RENDEZ_VOUS.Autre && json.precision
      ? json.precision
      : json.type.label
  return json.title || `${typeLabel} ${json.modality}`
}
