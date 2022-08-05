import React from 'react'

import {
  TYPES_TO_REDIRECT_PE,
  TYPES_TO_REDIRECT_SERVICE_CIVIQUE,
} from '../../../pages/mes-jeunes/[jeune_id]/favoris'

import { Tag } from 'components/ui/Tag'
import { Offre } from 'interfaces/favoris'
import { jsonToTypeOffre, TypeOffreJson } from 'interfaces/json/favoris'

export default function OffreRow({
  offre,
  handleRedirectionOffre,
}: {
  offre: Offre
  handleRedirectionOffre: (idOffre: string, type: string) => void
}) {
  return (
    <div
      role='row'
      className='table-row text-sm rounded-small shadow-s hover:bg-primary_lighten'
    >
      <div role='cell' className='table-cell p-3 align-middle rounded-l-small'>
        {offre.id}
      </div>
      <div role='cell' className='table-cell p-3 text-base-medium align-middle'>
        {offre.titre}
      </div>
      <div role='cell' className='table-cell p-3 align-middle'>
        {offre.organisation}
      </div>
      <div role='cell' className='table-cell p-3 align-middle rounded-r-small'>
        <Tag
          label={jsonToTypeOffre(offre.type as TypeOffreJson)}
          color='primary'
          backgroundColor='primary_lighten'
        />
      </div>
      <div role='cell' className='table-cell p-3 align-middle'>
        {[
          ...TYPES_TO_REDIRECT_PE,
          ...TYPES_TO_REDIRECT_SERVICE_CIVIQUE,
        ].includes(offre.type) && (
          <button onClick={() => handleRedirectionOffre(offre.id, offre.type)}>
            orh click
          </button>
        )}
      </div>
    </div>
  )
}
