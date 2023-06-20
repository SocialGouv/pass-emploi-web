import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
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
          <dt className='sr-only'>Titre de l’événement emploi :</dt>
          <dd>{infoEvenementEmploi.titre}</dd>
        </dl>
      </div>
      <div
        className={`mt-4 w-max ml-auto text-s-regular text-primary_darken hover:text-primary`}
      >
        <Link
          href={infoEvenementEmploi.url}
          target='_blank'
          rel='noreferrer noopener'
          className='underline text-[inherit] flex items-center'
          aria-label={`${infoEvenementEmploi.titre} (nouvelle fenêtre)`}
        >
          Voir l’événement emploi
          <IconComponent
            name={IconName.OpenInNew}
            className='w-4 h-4 ml-1 fill-[currentColor]'
            focusable={false}
            aria-hidden={true}
          />
        </Link>
      </div>
    </div>
  )
}
