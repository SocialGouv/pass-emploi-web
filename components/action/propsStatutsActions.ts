import { StatutAction } from 'interfaces/action'

const propsStatutsActions: {
  [key in StatutAction]: {
    label: string
    color: string
    altColor: string
  }
} = {
  Annulee: {
    label: 'Annulée',
    color: 'disabled',
    altColor: 'grey_100',
  },
  AFaire: {
    label: 'À Faire',
    color: 'primary_darken',
    altColor: 'accent_3_lighten',
  },
  Terminee: {
    label: 'Terminée - À qualifier',
    color: 'primary_darken',
    altColor: 'accent_3_lighten',
  },
  Qualifiee: {
    label: 'Qualifiée',
    color: 'success',
    altColor: 'success_lighten',
  },
}

export default propsStatutsActions
