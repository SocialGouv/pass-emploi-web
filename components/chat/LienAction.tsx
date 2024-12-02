import Link from 'next/link'
import React from 'react'

import { InfoAction } from 'interfaces/message'

export default function LienAction({
  infoAction,
  idBeneficiaire,
}: {
  infoAction: InfoAction
  idBeneficiaire: string
}) {
  return (
    <div className='mt-4 p-4 rounded-base bg-primary_darken'>
      <p className='text-base-bold text-white'>{infoAction.titre}</p>

      <Link
        href={`/mes-jeunes/${idBeneficiaire}/actions/${infoAction.id}`}
        className='mt-4 w-max ml-auto text-s-regular underline text-white hover:text-primary_lighten'
      >
        Voir l’action<span className='sr-only'> {infoAction.titre}</span>
      </Link>
    </div>
  )
}
