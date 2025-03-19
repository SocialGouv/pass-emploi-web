import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InfoAction } from 'interfaces/message'

export default function LienAction({
  infoAction,
  idBeneficiaire,
}: {
  infoAction: InfoAction
  idBeneficiaire: string
}) {
  return (
    <div className='mt-4 p-4 rounded-base bg-primary-darken'>
      <p className='text-base-bold text-white'>{infoAction.titre}</p>

      <Link
        href={`/mes-jeunes/${idBeneficiaire}/actions/${infoAction.id}`}
        target='_blank'
        rel='noreferrer noopener'
        className='block mt-4 w-fit ml-auto text-s-regular underline text-white hover:text-primary-lighten'
      >
        Voir l’action
        <span className='sr-only'> {infoAction.titre} (nouvelle fenêtre)</span>
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
