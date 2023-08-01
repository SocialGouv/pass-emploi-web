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
    <div className='mt-4 p-4 rounded-base bg-blanc'>
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
          className='underline text-[inherit] flex items-center'
          aria-label={`${infoSessionMilo.titre} (nouvelle fenêtre)`}
        >
          Voir les détails de la session
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
