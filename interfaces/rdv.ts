import { BaseJeune } from 'interfaces/jeune'

export interface TypeRendezVous {
  code: string
  label: string
}

export interface RdvListItem {
  id: string
  beneficiaires: string
  type: string
  modality: string
  date: string
  duration: number
  idCreateur: string | null
}

export interface Rdv {
  id: string
  jeunes: BaseJeune[]
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

export interface RdvAVenirItem {}

export interface JourRdvAVenirItem extends RdvAVenirItem {
  label: string
}

export interface RdvItem extends RdvAVenirItem {
  rdvListItem: RdvListItem
}

export function rdvToListItem(rdv: Rdv): RdvListItem {
  return {
    id: rdv.id,
    beneficiaires: getBeneficiaires(rdv.jeunes),
    type: rdv.type.label,
    modality: rdv.modality,
    date: rdv.date,
    duration: rdv.duration,
    idCreateur: rdv.createur?.id ?? null,
  }
}

export function getBeneficiaires(jeunes: BaseJeune[]) {
  if (jeunes.length > 1) return 'Bénéficiaires multiples'
  if (jeunes.length === 1) return jeunes[0].prenom + ' ' + jeunes[0].nom
  return ''
}

export const TYPE_RENDEZ_VOUS = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}
