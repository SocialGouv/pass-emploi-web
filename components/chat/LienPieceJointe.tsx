import parse from 'html-react-parser'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InfoFichier } from 'interfaces/fichier'
import { MessageRechercheMatch } from 'interfaces/message'

export function LienPieceJointe({
  infoFichier,
  isSentByConseiller,
  highlight,
}: {
  infoFichier: InfoFichier
  isSentByConseiller: boolean
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
    <div
      className={`flex flex-row justify-end underline ${isSentByConseiller ? 'hover:text-primary' : 'hover:text-primary-lighten'}`}
    >
      <IconComponent
        name={IconName.AttachFile}
        aria-hidden={true}
        focusable={false}
        className='shrink-0 w-6 h-6 fill-current'
      />
      <a
        href={`/api/fichiers/${infoFichier.id}`}
        target='_blank'
        rel='noreferrer noopener'
        className='font-bold break-all'
      >
        <span className='sr-only'>Télécharger la pièce jointe </span>
        {highlight ? surlignerTexte(infoFichier.nom) : infoFichier.nom}
      </a>
    </div>
  )
}
