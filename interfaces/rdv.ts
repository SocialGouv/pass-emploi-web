import { BaseJeune } from 'interfaces/jeune'

export interface TypeRendezVous {
  code: string
  label: string
}

export interface RdvListItem {
  id: string
  jeune: BaseJeune
  type: string
  modality: string
  date: string
  duration: number
  hasComment: boolean
  idCreateur: string | null
}

export interface Rdv {
  id: string
  jeune: BaseJeune
  type: TypeRendezVous
  precisionType: string
  modality: string
  date: string
  duration: number
  adresse: string
  organisme: string
  presenceConseiller: boolean
  invitation: boolean
  comment: string
  createur: { id: string; nom: string; prenom: string } | null
}

export function rdvToListItem(rdv: Rdv): RdvListItem {
  return {
    id: rdv.id,
    jeune: rdv.jeune,
    type: rdv.type.label,
    modality: rdv.modality,
    date: rdv.date,
    duration: rdv.duration,
    hasComment: Boolean(rdv.comment),
    idCreateur: rdv.createur?.id ?? null,
  }
}

export const TYPE_RENDEZ_VOUS = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}
