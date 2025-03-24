import { StatutDemarche } from 'interfaces/json/beneficiaire'

const propsStatutsDemarches: {
  [key in StatutDemarche]: {
    label: string
    style: string
  }
} = {
  EN_COURS: {
    label: 'En cours',
    style: 'text-accent-1 bg-accent-1-lighten',
  },
  A_FAIRE: {
    label: 'À faire',
    style: 'text-primary-darken bg-accent-3-lighten',
  },
  REALISEE: {
    label: 'Terminée',
    style: 'text-success bg-success-lighten',
  },
  ANNULEE: {
    label: 'Annulée',
    style: 'text-disabled bg-grey-100',
  },
}

export default propsStatutsDemarches
