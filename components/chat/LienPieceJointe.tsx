import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export function LienPieceJointe(props: { id: string; nom: string }) {
  return (
    <div className='flex flex-row justify-end'>
      <IconComponent
        name={IconName.File}
        aria-hidden='true'
        focusable='false'
        className='w-6 h-6'
      />
      <a
        href={`/api/fichiers/${props.id}`}
        aria-label='Télécharger la pièce jointe'
        title='Télécharger la pièce jointe'
        className='font-bold break-all'
      >
        {props.nom}
      </a>
    </div>
  )
}
