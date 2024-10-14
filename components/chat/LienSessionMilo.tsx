import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InfoSessionMilo } from 'interfaces/message'

export default function LienSessionMilo({
  infoSessionMilo,
}: {
  infoSessionMilo: InfoSessionMilo
}) {
  return (
    <div className='mt-4 p-4 rounded-base bg-white'>
      <div className='text-base-bold text-content_color'>
        <dl>
          <dt className='sr-only'>Titre de la session :</dt>
          <dd>{infoSessionMilo.titre}</dd>
        </dl>
      </div>
      <div className='mt-4 w-max ml-auto text-s-regular text-primary_darken hover:text-primary'>
        <Link
          href={`/agenda/sessions/${infoSessionMilo.id}`}
          target='_blank'
          rel='noreferrer noopener'
          className='underline text-primary hover:primary_darken flex items-center'
        >
          Voir les détails de la session{' '}
          <span className='sr-only'>
            {infoSessionMilo.titre} (nouvelle fenêtre)
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
