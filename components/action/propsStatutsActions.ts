import { StatutAction } from 'interfaces/action'

const propsStatutsActions: {
  [key in StatutAction]: {
    label: string
    style: string
  }
} = {
  Annulee: {
    label: 'Annulée',
    style: 'text-disabled bg-grey_100',
  },
  AFaire: {
    label: 'À faire',
    style: 'text-primary_darken bg-accent_3_lighten',
  },
  Terminee: {
    label: 'Terminée',
    style: 'text-primary_darken bg-accent_3_lighten',
  },
  TermineeAQualifier: {
    label: 'Terminée - À qualifier',
    style: 'text-primary_darken bg-accent_3_lighten',
  },
  TermineeQualifiee: {
    label: 'Qualifiée',
    style: 'text-success bg-success_lighten',
  },
}

export default propsStatutsActions
