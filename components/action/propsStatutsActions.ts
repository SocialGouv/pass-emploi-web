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
  EnCours: {
    label: 'En cours',
    color: 'accent_1',
    altColor: 'accent_1_lighten',
  },
  Terminee: {
    label: 'Terminée - à qualifier',
    color: 'primary',
    altColor: 'accent_3_lighten',
  },
  Qualifiee: {
    label: 'Qualifiée',
    color: 'success',
    altColor: 'success_lighten',
  },
}

export default propsStatutsActions
