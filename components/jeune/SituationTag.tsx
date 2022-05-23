import React from 'react'

import { SituationJeune } from 'interfaces/jeune'

interface TagProps {
  situation: SituationJeune
}

const mappedSituation: {
  [key in SituationJeune]: {
    label: string
    color: string
    colorLighten: string
  }
} = {
  Emploi: {
    label: 'À réaliser',
    color: 'accent_1',
    colorLighten: 'accent_1_lighten',
  },
  'Contrat en Alternance': {
    label: 'Commencée',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
}

export default function StatusTag({ status }: TagProps) {
  const { label, color, colorLighten } = mappedSituation[status]
  return (
    <span
      className={`table-cell text-xs-medium border border-solid border-${color} text-${color} px-4 py-[2px] bg-${colorLighten} rounded-x_large whitespace-nowrap`}
    >
      {label}
    </span>
  )
}
