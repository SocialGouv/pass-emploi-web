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
    label: 'À faire',
    color: 'primary_darken',
    altColor: 'accent_3_lighten',
  },
  Terminee: {
    label: 'Terminée',
    color: 'primary_darken',
    altColor: 'accent_3_lighten',
  },
  TermineeAQualifier: {
    label: 'Terminée - À qualifier',
    color: 'primary_darken',
    altColor: 'accent_3_lighten',
  },
  TermineeQualifiee: {
    label: 'Qualifiée',
    color: 'success',
    altColor: 'success_lighten',
  },
}

export default propsStatutsActions
