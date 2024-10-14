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
    <div className={`mt-4 p-4 rounded-base bg-white`}>
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
          className='underline text-primary hover:text-primary_darken flex items-center'
        >
          Voir l’événement emploi{' '}
          <span className='sr-only'>
            {infoEvenementEmploi.titre} (nouvelle fenêtre)
          </span>
          <IconComponent
            name={IconName.OpenInNew}
            className='w-4 h-4 ml-1 fill-current'
            focusable={false}
            aria-hidden={true}
          />
        </Link>
      </div>
    </div>
  )
}
