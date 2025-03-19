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
  const { label, style } = determineAttributs()

  function determineAttributs() {
    if (actionEstEnRetard)
      return {
        label: 'En retard',
        style: 'text-warning bg-warning-lighten',
      }

    return propsStatutsActions[status]
  }

  return <TagStatut label={label} className={style + ' text-s-bold'} />
}
