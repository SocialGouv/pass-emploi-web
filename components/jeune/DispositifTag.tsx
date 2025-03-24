import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'

type TagProps = {
  dispositif: string
}

export default function DispositifTag({ dispositif }: TagProps) {
  return <TagMetier label={dispositif} className={getStyle(dispositif)} />
}

function getStyle(dispositif: string): string {
  switch (dispositif) {
    case 'PACEA':
      return 'text-success bg-success-lighten'
    case 'CEJ':
    default:
      return 'text-primary bg-primary-lighten'
  }
}
