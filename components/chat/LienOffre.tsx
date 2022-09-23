import React, { useState } from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { InfoOffre } from 'interfaces/message'
import useMatomo from 'utils/analytics/useMatomo'

export function LienOffre({
  infoOffre,
  isSentByConseiller,
}: {
  infoOffre: InfoOffre
  isSentByConseiller: boolean
}) {
  const [trackingLabel, setLabelMatomo] = useState<string | undefined>(
    undefined
  )

  useMatomo(trackingLabel)

  const label = 'Voir l’offre'

  return (
    <div
      className={`mt-4 p-4 rounded-medium ${
        isSentByConseiller ? 'bg-primary_darken' : 'bg-blanc'
      }`}
    >
      <p
        className={`text-base-bold ${
          isSentByConseiller ? 'text-blanc' : 'text-content_color'
        }`}
      >
        {infoOffre.titre}
      </p>
      <div
        className={`mt-4 w-max ml-auto ${
          isSentByConseiller ? 'text-blanc' : ''
        }`}
      >
        <ExternalLink
          href={infoOffre.lien}
          label={label}
          onClick={() => setLabelMatomo(label)}
        />
      </div>
    </div>
  )
}
