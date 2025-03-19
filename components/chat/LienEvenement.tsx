import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InfoEvenement } from 'interfaces/message'
import { toShortDate } from 'utils/date'

export default function LienEvenement({
  infoEvenement,
}: {
  infoEvenement: InfoEvenement
}) {
  return (
    <div className={`mt-4 p-4 rounded-base bg-white`}>
      <div className={`text-base-bold text-content-color`}>
        <dl>
          <dt className='sr-only'>Titre de l’événement :</dt>
          <dd>{infoEvenement.titre}</dd>
          <dt className='sr-only'>Date de l’événement :</dt>
          <dd>le {toShortDate(infoEvenement.date)}</dd>
        </dl>
      </div>

      <Link
        href={`/mes-jeunes/edition-rdv?idRdv=${infoEvenement.id}`}
        target='_blank'
        rel='noreferrer noopener'
        className='block mt-4 w-fit ml-auto text-s-regular underline text-primary hover:text-primary-darken'
      >
        Voir l’événement
        <span className='sr-only'>
          {' '}
          {infoEvenement.titre} (nouvelle fenêtre)
        </span>
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
