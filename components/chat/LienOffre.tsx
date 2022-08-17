import React, { useState } from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { InfoOffre } from 'interfaces/message'
import useMatomo from 'utils/analytics/useMatomo'

export function LienOffre(props: { infoOffre: InfoOffre }) {
  const [trackingLabel, setLabelMatomo] = useState<string | undefined>(
    undefined
  )

  useMatomo(trackingLabel)

  const label = 'Voir l’offre'

  return (
    <div className='p-4 rounded-medium bg-blanc mt-4'>
      <p className='text-base-bold text-content_color'>
        {props.infoOffre!.titre}
      </p>
      <div className='mt-4 w-max ml-auto'>
        <ExternalLink
          href={props.infoOffre!.lien}
          label={label}
          onClick={() => setLabelMatomo(label)}
        />
      </div>
    </div>
  )
}
