import Link from 'next/link'
import React from 'react'

import { InfoOffre } from 'interfaces/message'

export default function LienOffre({
  infoOffre,
  isSentByConseiller,
}: {
  infoOffre: InfoOffre
  isSentByConseiller: boolean
}) {
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
        className={`mt-4 w-max ml-auto text-s-regular ${
          isSentByConseiller
            ? 'text-blanc hover:text-primary_lighten'
            : 'text-primary_darken hover:text-primary'
        }`}
      >
        <Link href={'/offres/' + infoOffre.id}>
          <a className='underline text-[inherit]'>Voir l’offre</a>
        </Link>
      </div>
    </div>
  )
}
