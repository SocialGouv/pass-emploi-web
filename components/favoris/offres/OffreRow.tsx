import Link from 'next/link'
import React from 'react'

import { Tag } from 'components/ui/Indicateurs/Tag'
import { Offre } from 'interfaces/favoris'

export default function OffreRow({ offre }: { offre: Offre }) {
  const titre = 'Ouvrir l’offre ' + offre.titre

  return (
    <Link href={`/offres/${offre.urlParam}/${offre.id}`}>
      <a
        role='row'
        aria-label={titre}
        title={titre}
        className='table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten cursor-pointer'
      >
        <div
          role='cell'
          className='table-cell p-3 align-middle rounded-l-small'
        >
          {offre.id}
        </div>
        <div role='cell' className='table-cell p-3 text-base-bold align-middle'>
          {offre.titre}
        </div>
        <div role='cell' className='table-cell p-3 align-middle'>
          {offre.organisation}
        </div>
        <div
          role='cell'
          className='table-cell p-3 align-middle rounded-r-small'
        >
          <Tag
            label={offre.type}
            color='primary'
            backgroundColor='primary_lighten'
          />
        </div>
      </a>
    </Link>
  )
}
