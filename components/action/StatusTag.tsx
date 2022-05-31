import React from 'react'

import { Tag } from 'components/ui/Tag'
import { StatutAction } from 'interfaces/action'

interface StatutTagProps {
  status: StatutAction
}

const mappedStatus: {
  [key in StatutAction]: {
    label: string
    color: string
    backgroundColor: string
  }
} = {
  ARealiser: {
    label: 'À réaliser',
    color: 'accent_1',
    backgroundColor: 'accent_1_lighten',
  },
  Commencee: {
    label: 'Commencée',
    color: 'accent_3',
    backgroundColor: 'accent_3_lighten',
  },
  Terminee: {
    label: 'Terminée',
    color: 'accent_2',
    backgroundColor: 'accent_2_lighten',
  },
  Annulee: {
    label: 'Annulée',
    color: 'warning',
    backgroundColor: 'warning_lighten',
  },
}

export default function StatusTag({ status }: StatutTagProps) {
  const { label, color, backgroundColor } = mappedStatus[status]
  return <Tag label={label} color={color} backgroundColor={backgroundColor} />
}
