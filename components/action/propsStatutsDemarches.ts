import { StatutDemarche } from 'interfaces/json/beneficiaire'

const propsStatutsDemarches: {
  [key in StatutDemarche]: {
    label: string
    style: string
  }
} = {
  EN_COURS: {
    label: 'En cours',
    style: 'text-accent_1 bg-accent_1_lighten',
  },
  A_FAIRE: {
    label: 'À faire',
    style: 'text-primary_darken bg-accent_3_lighten',
  },
  REALISEE: {
    label: 'Terminée',
    style: 'text-success bg-success_lighten',
  },
  ANNULEE: {
    label: 'Annulée',
    style: 'text-disabled bg-grey_100',
  },
}

export default propsStatutsDemarches
