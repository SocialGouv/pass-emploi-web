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
  const texteASurligner = highlight && highlight.key === 'piecesJointes.nom'
  function surlignerTexte(texte: string) {
    const coordDebut = highlight!.match[0]
    const coordFin = highlight!.match[1] + 1

    const debut = texte.slice(0, coordDebut)
    const highlightedText = texte.slice(coordDebut, coordFin)
    const fin = texte.slice(coordFin)

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
        {texteASurligner ? surlignerTexte(nom) : nom}
      </a>
    </div>
  )
}
