import parse from 'html-react-parser'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { MessageRechercheMatch } from 'interfaces/message'

export function LienPieceJointe({
  id,
  nom,
  className,
  highlight,
}: {
  id: string
  nom: string
  className?: string
  highlight?: MessageRechercheMatch
}) {
  function surlignerTexte(texte: string) {
    const indexDebut = highlight!.match[0]
    const indexFin = highlight!.match[1] + 1

    const debut = texte.slice(0, indexDebut)
    const highlightedText = texte.slice(indexDebut, indexFin)
    const fin = texte.slice(indexFin)

    return parse(`${debut}<mark>${highlightedText}</mark>${fin}`)
  }

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
        {highlight ? surlignerTexte(nom) : nom}
      </a>
    </div>
  )
}
