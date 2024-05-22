import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

export function LienPieceJointe({
  id,
  nom,
  className,
}: {
  id: string
  nom: string
  className?: string
}) {
  return (
    <div className='flex flex-row justify-end underline'>
      <IconComponent
        name={IconName.AttachFile}
        aria-hidden={true}
        focusable={false}
        className={`w-6 h-6 ${className ?? ''}`}
      />
      <a
        href={`/api/fichiers/${id}`}
        target='_blank'
        rel='noreferrer noopener'
        aria-label={`Télécharger la pièce jointe ${nom}`}
        className='font-bold break-all'
      >
        <span className='sr-only'>Télécharger la pièce jointe </span>
        {nom}
      </a>
    </div>
  )
}
