import { StatutAction } from 'interfaces/action'

const propsStatutsActions: {
  [key in StatutAction]: {
    label: string
    style: string
  }
} = {
  Annulee: {
    label: 'Annulée',
    style: 'text-disabled bg-grey-100',
  },
  AFaire: {
    label: 'À faire',
    style: 'text-primary-darken bg-accent-3-lighten',
  },
  Terminee: {
    label: 'Terminée',
    style: 'text-primary-darken bg-accent-3-lighten',
  },
  TermineeAQualifier: {
    label: 'Terminée - À qualifier',
    style: 'text-primary-darken bg-accent-3-lighten',
  },
  TermineeQualifiee: {
    label: 'Qualifiée',
    style: 'text-success bg-success-lighten',
  },
}

export default propsStatutsActions
