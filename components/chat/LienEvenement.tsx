import Link from 'next/link'
import React from 'react'

import { InfoEvenement } from 'interfaces/message'
import { toShortDate } from 'utils/date'

export default function LienEvenement({
  infoEvenement,
}: {
  infoEvenement: InfoEvenement
}) {
  return (
    <div className={`mt-4 p-4 rounded-base bg-white`}>
      <div className={`text-base-bold text-content_color`}>
        <dl>
          <dt className='sr-only'>Titre de l’événement :</dt>
          <dd>{infoEvenement.titre}</dd>
          <dt className='sr-only'>Date de l’événement :</dt>
          <dd>le {toShortDate(infoEvenement.date)}</dd>
        </dl>
      </div>
      <div
        className={`mt-4 w-max ml-auto text-s-regular text-primary_darken hover:text-primary`}
      >
        <Link
          href={`/mes-jeunes/edition-rdv?idRdv=${infoEvenement.id}`}
          className='underline text-content_color hover:text-primary'
        >
          Voir l’événement{' '}
          <span className='sr-only'>{infoEvenement.titre}</span>
        </Link>
      </div>
    </div>
  )
}
