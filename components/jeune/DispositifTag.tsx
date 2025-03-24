import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'

type DispositifTagProps = {
  dispositif: string
  onWhite?: boolean
}

export default function DispositifTag(props: DispositifTagProps) {
  return <TagMetier label={props.dispositif} className={getStyle(props)} />
}

function getStyle({ dispositif, onWhite }: DispositifTagProps): string {
  switch (dispositif) {
    case 'PACEA':
      return 'text-success bg-success-lighten'
    case 'CEJ':
    default:
      return 'text-primary ' + (onWhite ? 'bg-white' : 'bg-primary-lighten')
  }
}
