import React from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import { TagStatut } from 'components/ui/Indicateurs/Tag'
import { StatutAction } from 'interfaces/action'

interface TagStatutActionProps {
  status: StatutAction
}

export default function TagStatutAction({ status }: TagStatutActionProps) {
  const {
    label,
    color,
    altColor: backgroundColor,
  } = propsStatutsActions[status]
  return (
    <TagStatut label={label} color={color} backgroundColor={backgroundColor} />
  )
}
