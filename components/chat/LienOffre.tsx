import Link from 'next/link'
import React from 'react'

import { InfoOffre } from 'interfaces/message'
import { TypeOffre } from 'interfaces/offre'

export default function LienOffre({
  infoOffre,
  isSentByConseiller,
}: {
  infoOffre: InfoOffre
  isSentByConseiller: boolean
}) {
  return (
    <div
      className={`mt-4 p-4 rounded-base ${
        isSentByConseiller ? 'bg-primary_darken' : 'bg-white'
      }`}
    >
      <p
        className={`text-base-bold ${
          isSentByConseiller ? 'text-white' : 'text-content_color'
        }`}
      >
        {infoOffre.titre}
      </p>

      <Link
        href={`/offres/${typeToUrlParam(infoOffre.type)}/${infoOffre.id}`}
        className={`mt-4 w-max ml-auto text-s-regular ${
          isSentByConseiller
            ? 'text-white underline hover:text-primary_lighten'
            : 'text-primary_darken hover:text-primary'
        }`}
      >
        Voir l’offre<span className='sr-only'> {infoOffre.titre}</span>
      </Link>
    </div>
  )
}

function typeToUrlParam(typeOffre: TypeOffre): string {
  switch (typeOffre) {
    case TypeOffre.ALTERNANCE:
      return 'alternance'
    case TypeOffre.EMPLOI:
      return 'emploi'
    case TypeOffre.SERVICE_CIVIQUE:
      return 'service-civique'
    case TypeOffre.IMMERSION:
      return 'immersion'
  }
}
