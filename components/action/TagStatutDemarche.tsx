import React from 'react'

import propsStatutsDemarches from 'components/action/propsStatutsDemarches'
import { TagStatut } from 'components/ui/Indicateurs/Tag'
import { StatutDemarche } from 'interfaces/json/beneficiaire'

export default function TagStatutDemarche({
  status,
}: {
  status: StatutDemarche
}) {
  const { label, style } = propsStatutsDemarches[status]

  return <TagStatut label={label} className={style + ' text-s-bold'} />
}
