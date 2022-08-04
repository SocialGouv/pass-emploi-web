import React from 'react'

import { Tag } from 'components/ui/Tag'
import { Offre } from 'interfaces/favoris'

export default function OffreRow({ offre }: { offre: Offre }) {
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
          label={offre.type}
          color='primary'
          backgroundColor='primary_lighten'
        />
      </div>
    </div>
  )
}
