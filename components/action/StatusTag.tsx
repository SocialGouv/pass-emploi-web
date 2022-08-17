import React from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { StatutAction } from 'interfaces/action'

interface StatutTagProps {
  status: StatutAction
}

export default function StatusTag({ status }: StatutTagProps) {
  const {
    label,
    color,
    altColor: backgroundColor,
  } = propsStatutsActions[status]
  return <Tag label={label} color={color} backgroundColor={backgroundColor} />
}
