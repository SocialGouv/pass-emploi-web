import Link from 'next/link'
import React from 'react'

import { InfoEvenementEmploi } from 'interfaces/message'

export default function LienEvenementEmploi({
  infoEvenementEmploi,
}: {
  infoEvenementEmploi: InfoEvenementEmploi
}) {
  return (
    <div className={`mt-4 p-4 rounded-base bg-blanc`}>
      <div className={`text-base-bold text-content_color`}>
        <dl>
          <dt className='sr-only'>Titre de l’événement :</dt>
          <dd>{infoEvenementEmploi.titre}</dd>
        </dl>
      </div>
      <div
        className={`mt-4 w-max ml-auto text-s-regular text-primary_darken hover:text-primary`}
      >
        <Link
          href={infoEvenementEmploi.url}
          className='underline text-[inherit]'
        >
          Voir l’événement emploi
        </Link>
      </div>
    </div>
  )
}
