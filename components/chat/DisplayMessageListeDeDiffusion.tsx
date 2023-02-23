import React from 'react'

import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import { MessageListeDiffusion, TypeMessage } from 'interfaces/message'
import {
  TIME_24_A11Y_SEPARATOR,
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
  toShortDate,
} from 'utils/date'

interface DisplayMessageListeDeDiffusionProps {
  message: MessageListeDiffusion
  onAfficherDetailMessage: () => void
}

export default function DisplayMessageListeDeDiffusion({
  message,
  onAfficherDetailMessage,
}: DisplayMessageListeDeDiffusionProps) {
  const creationTime = toFrenchFormat(message.creationDate, TIME_24_H_SEPARATOR)
  const a11yTime = toFrenchFormat(message.creationDate, TIME_24_A11Y_SEPARATOR)

  function scrollToRef(element: HTMLLIElement | null) {
    if (element) element.scrollIntoView()
  }

  return (
    <li className='mb-4 px-4' ref={scrollToRef}>
      <div className='text-base-regular break-words p-4 rounded-base text-content_color bg-blanc mb-1'>
        <TexteAvecLien texte={message.content} lighten={false} />

        {message.type === TypeMessage.MESSAGE_PJ &&
          message.infoPiecesJointes &&
          message.infoPiecesJointes.map(({ id, nom }) => (
            <LienPieceJointe key={id} id={id} nom={nom} />
          ))}

        <button onClick={onAfficherDetailMessage}>
          Voir le détail du message{' '}
          <span className='sr-only'>
            du {toShortDate(message.creationDate)} à {a11yTime}
          </span>
        </button>
      </div>
      <p className='text-xs-medium text-content text-right'>
        <span className='sr-only'>Envoyé à </span>
        {creationTime}
      </p>
    </li>
  )
}
