import React from 'react'

import propsStatutsDemarches from 'components/action/propsStatutsDemarches'
import { TagStatut } from 'components/ui/Indicateurs/Tag'
import { StatutDemarche } from 'interfaces/json/beneficiaire'

export default function TagStatutDemarche({
  status,
}: {
  status: StatutDemarche
}) {
  const {
    label,
    color,
    altColor: backgroundColor,
  } = propsStatutsDemarches[status]

  return (
    <TagStatut
      label={label}
      color={color}
      backgroundColor={backgroundColor}
      className='text-s-bold'
    />
  )
}
