import React, { useMemo } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Tag } from 'components/ui/Tag'
import { Offre } from 'interfaces/favoris'
import { jsonToTypeOffre, TypeOffreJson } from 'interfaces/json/favoris'
import {
  TYPES_TO_REDIRECT_PE,
  TYPES_TO_REDIRECT_SERVICE_CIVIQUE,
} from 'pages/mes-jeunes/[jeune_id]/favoris'

export default function OffreRow({
  offre,
  handleRedirectionOffre,
}: {
  offre: Offre
  handleRedirectionOffre: (idOffre: string, type: string) => void
}) {
  const hasLink: boolean = useMemo(
    () =>
      [...TYPES_TO_REDIRECT_PE, ...TYPES_TO_REDIRECT_SERVICE_CIVIQUE].includes(
        offre.type
      ),
    [offre]
  )

  function redirectIfHasLink() {
    if (hasLink) handleRedirectionOffre(offre.id, offre.type)
  }

  return (
    <tr
      aria-label={hasLink ? "Ouvrir l'offre" : undefined}
      onClick={redirectIfHasLink}
      className={`text-base-regular rounded-small shadow-s ${
        hasLink ? 'hover:bg-primary_lighten cursor-pointer' : ''
      }`}
    >
      <td className='p-3 align-middle rounded-l-small'>{offre.id}</td>
      <td className='p-3 text-base-medium align-middle'>{offre.titre}</td>
      <td className='p-3 align-middle'>{offre.organisation}</td>
      <td className='p-3 align-middle rounded-r-small'>
        <Tag
          label={jsonToTypeOffre(offre.type as TypeOffreJson)}
          color='primary'
          backgroundColor='primary_lighten'
        />
      </td>
      <td aria-hidden={true} className='p-3 align-middle'>
        {hasLink && (
          <IconComponent
            name={IconName.Launch}
            aria-hidden={true}
            focusable={false}
            className='h-4 w-4 fill-content_color'
          />
        )}
      </td>
    </tr>
  )
}
