import React from 'react'

import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import { MessageListeDiffusion, TypeMessage } from 'interfaces/message'
import { TIME_24_H_SEPARATOR, toFrenchFormat } from 'utils/date'

interface DisplayMessageListeDeDiffusionProps {
  message: MessageListeDiffusion
}

export default function DisplayMessageListeDeDiffusion({
  message,
}: DisplayMessageListeDeDiffusionProps) {
  const creationTime: string = toFrenchFormat(
    message.creationDate,
    TIME_24_H_SEPARATOR
  )

  function scrollToRef(element: HTMLLIElement | null) {
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <li className='mb-4 px-4' ref={scrollToRef}>
      <div className='text-base-regular break-words p-4 rounded-large text-content_color bg-blanc mb-1'>
        <TexteAvecLien texte={message.content} lighten={false} />

        {message.type === TypeMessage.MESSAGE_PJ &&
          message.infoPiecesJointes &&
          message.infoPiecesJointes.map(({ id, nom }) => (
            <LienPieceJointe key={id} id={id} nom={nom} />
          ))}
      </div>
      <p className='text-xs-medium text-content text-right'>
        <span className='sr-only'>Envoyé le </span>
        {creationTime}
      </p>
    </li>
  )
}
