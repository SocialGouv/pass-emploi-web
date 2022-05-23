import React from 'react'

import { Tag } from '../ui/Tag'

import { StatutAction } from 'interfaces/action'

interface StatutTagProps {
  status: StatutAction
}

const mappedStatus: {
  [key in StatutAction]: { label: string; color: string; colorLighten: string }
} = {
  ARealiser: {
    label: 'À réaliser',
    color: 'accent_1',
    colorLighten: 'accent_1_lighten',
  },
  Commencee: {
    label: 'Commencée',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
  Terminee: {
    label: 'Terminée',
    color: 'accent_2',
    colorLighten: 'accent_2_lighten',
  },
  Annulee: {
    label: 'Annulée',
    color: 'warning',
    colorLighten: 'warning_lighten',
  },
}

export default function StatusTag({ status }: StatutTagProps) {
  const { label, color, colorLighten } = mappedStatus[status]
  return <Tag label={label} color={color} colorLighten={colorLighten} />
}
