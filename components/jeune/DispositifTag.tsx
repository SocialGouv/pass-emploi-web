import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'

interface TagProps {
  dispositif: string
}

function getStyle(dispositif: string): {
  color: string
  backgroundColor: string
} {
  switch (dispositif) {
    case 'PACEA':
      return {
        color: 'success',
        backgroundColor: 'success_lighten',
      }
    case 'CEJ':
    default:
      return {
        color: 'primary',
        backgroundColor: 'primary_lighten',
      }
  }
}

export default function DispositifTag({ dispositif }: TagProps) {
  const { color, backgroundColor } = getStyle(dispositif)
  return (
    <TagMetier
      label={dispositif}
      color={color}
      backgroundColor={backgroundColor}
    />
  )
}
