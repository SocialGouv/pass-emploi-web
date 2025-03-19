import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
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
        isSentByConseiller
          ? 'text-white bg-primary-darken'
          : 'text-content-color bg-white'
      }`}
    >
      <p className='text-base-bold'>{infoOffre.titre}</p>

      <Link
        href={`/offres/${typeToUrlParam(infoOffre.type)}/${infoOffre.id}`}
        target='_blank'
        rel='noreferrer noopener'
        className={`block mt-4 w-fit ml-auto text-s-regular underline ${
          isSentByConseiller
            ? 'hover:text-primary-lighten'
            : 'text-primary hover:text-primary-darken'
        }`}
      >
        Voir l’offre
        <span className='sr-only'> {infoOffre.titre} (nouvelle fenêtre)</span>
        <IconComponent
          name={IconName.OpenInNew}
          className='inline shrink-0 w-4 h-4 ml-1 fill-current'
          focusable={false}
          aria-hidden={true}
        />
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
