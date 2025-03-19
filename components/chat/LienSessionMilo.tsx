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
      <div className='text-base-bold text-content-color'>
        <dl>
          <dt className='sr-only'>Titre de la session :</dt>
          <dd>{infoSessionMilo.titre}</dd>
        </dl>
      </div>

      <Link
        href={`/agenda/sessions/${infoSessionMilo.id}`}
        target='_blank'
        rel='noreferrer noopener'
        className='block w-fit ml-auto mt-4 underline text-s-regular text-primary hover:text-primary-darken'
      >
        Voir les détails de la session
        <span className='sr-only'>
          {infoSessionMilo.titre} (nouvelle fenêtre)
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
