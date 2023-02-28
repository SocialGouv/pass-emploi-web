import React from 'react'

import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { MessageListeDiffusion, TypeMessage } from 'interfaces/message'
import {
  TIME_24_A11Y_SEPARATOR,
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
  toShortDate,
} from 'utils/date'

interface DisplayMessageListeDeDiffusionProps {
  message: MessageListeDiffusion
  onAfficherDetailMessage?: () => void
}

export default function DisplayMessageListeDeDiffusion({
  message,
  onAfficherDetailMessage,
}: DisplayMessageListeDeDiffusionProps) {
  const creationTime = toFrenchFormat(message.creationDate, TIME_24_H_SEPARATOR)
  const a11yTime = toFrenchFormat(message.creationDate, TIME_24_A11Y_SEPARATOR)

  return (
    <>
      <div className='text-base-regular break-words p-4 rounded-base text-content_color bg-blanc mb-1'>
        <TexteAvecLien texte={message.content} lighten={false} />

        {message.type === TypeMessage.MESSAGE_PJ &&
          message.infoPiecesJointes &&
          message.infoPiecesJointes.map(({ id, nom }) => (
            <LienPieceJointe key={id} id={id} nom={nom} />
          ))}

        {onAfficherDetailMessage && (
          <button
            onClick={onAfficherDetailMessage}
            className='flex ml-auto text-s-medium items-center hover:text-primary'
          >
            Voir les destinataires{' '}
            <span className='sr-only'>
              du message du {toShortDate(message.creationDate)} à {a11yTime}
            </span>
            <IconComponent
              name={IconName.ChevronRight}
              aria-hidden={true}
              focusable={false}
              className='w-5 h-5 ml-2 fill-[currentColor]'
            />
          </button>
        )}
      </div>

      <p className='text-xs-medium text-content text-right'>
        <span aria-label={'Envoyé à ' + a11yTime}>Envoyé à {creationTime}</span>
      </p>
    </>
  )
}
