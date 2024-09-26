import { StatutDemarche } from 'interfaces/json/beneficiaire'

const propsStatutsDemarches: {
  [key in StatutDemarche]: {
    label: string
    color: string
    altColor: string
  }
} = {
  EN_COURS: {
    label: 'En cours',
    color: 'accent_1',
    altColor: 'accent_1_lighten',
  },
  A_FAIRE: {
    label: 'À faire',
    color: 'primary_darken',
    altColor: 'accent_3_lighten',
  },
  REALISEE: {
    label: 'Terminée',
    color: 'success',
    altColor: 'success_lighten',
  },
  ANNULEE: {
    label: 'Annulée',
    color: 'disabled',
    altColor: 'grey_100',
  },
}

export default propsStatutsDemarches
