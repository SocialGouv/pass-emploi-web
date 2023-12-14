import React from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import { TagStatut } from 'components/ui/Indicateurs/Tag'
import { StatutAction } from 'interfaces/action'

interface TagStatutActionProps {
  status: StatutAction
  actionEstEnRetard: boolean
}

export default function TagStatutAction({
  status,
  actionEstEnRetard,
}: TagStatutActionProps) {
  const { label, color, altColor: backgroundColor } = determineAttributs()

  function determineAttributs() {
    if (actionEstEnRetard)
      return {
        label: 'En retard',
        color: 'warning',
        altColor: 'warning_lighten',
      }
    return propsStatutsActions[status]
  }

  return (
    <TagStatut
      label={label}
      color={color}
      backgroundColor={backgroundColor}
      className='text-s-bold'
    />
  )
}
