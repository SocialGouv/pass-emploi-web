import React from 'react'

import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { MessageListeDiffusion, TypeMessage } from 'interfaces/message'
import { toShortDate, toFrenchTime } from 'utils/date'

interface DisplayMessageListeDeDiffusionProps {
  message: MessageListeDiffusion
  onAfficherDetailMessage?: () => void
  messagerieFullScreen?: boolean
}

export default function DisplayMessageListeDeDiffusion({
  message,
  onAfficherDetailMessage,
  messagerieFullScreen,
}: DisplayMessageListeDeDiffusionProps) {
  const creationTime = toFrenchTime(message.creationDate)
  const a11yTime = toFrenchTime(message.creationDate, { a11y: true })

  return (
    <>
      <div
        className={`text-base-regular break-words p-4 rounded-base text-content_color ${
          messagerieFullScreen ? 'bg-grey_100' : 'bg-white'
        } mb-1`}
      >
        <TexteAvecLien texte={message.content} />

        {message.type === TypeMessage.MESSAGE_PJ &&
          message.infoPiecesJointes &&
          message.infoPiecesJointes.map(({ id, nom }) => (
            <LienPieceJointe
              key={id}
              id={id}
              nom={nom}
              className='fill-primary'
            />
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

      <p className='text-xs-medium text-content text-right mb-1'>
        <span aria-label={'Envoyé à ' + a11yTime}>Envoyé à {creationTime}</span>
      </p>
    </>
  )
}
