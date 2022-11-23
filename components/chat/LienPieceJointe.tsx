import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export function LienPieceJointe({ id, nom }: { id: string; nom: string }) {
  return (
    <div className='flex flex-row justify-end'>
      <IconComponent
        name={IconName.File}
        aria-hidden='true'
        focusable='false'
        className='w-6 h-6'
      />
      <a
        href={`/api/fichiers/${id}`}
        aria-label={`Télécharger la pièce jointe ${nom}`}
        title={`Télécharger la pièce jointe ${nom}`}
        className='font-bold break-all'
      >
        {nom}
      </a>
    </div>
  )
}
