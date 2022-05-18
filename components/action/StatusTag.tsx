import React from 'react'

import { StatutAction } from 'interfaces/action'

interface TagProps {
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

export default function StatusTag({ status }: TagProps) {
  const { label, color, colorLighten } = mappedStatus[status]
  return (
    <span
      className={`table-cell text-xs-medium border border-solid border-${color} text-${color} px-4 py-[2px] bg-${colorLighten} rounded-x_large whitespace-nowrap`}
    >
      {label}
    </span>
  )
}
