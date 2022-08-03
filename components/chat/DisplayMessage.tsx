import React from 'react'

import { LienOffre } from 'components/chat/LienOffre'
import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import { UserType } from 'interfaces/conseiller'
import { Message, TypeMessage } from 'interfaces/message'
import { formatHourMinuteDate, isDateOlder } from 'utils/date'

interface DisplayMessageProps {
  message: Message
  conseillerNomComplet: string | undefined
  lastSeenByJeune: Date | undefined
}

export default function DisplayMessage({
  message,
  conseillerNomComplet,
  lastSeenByJeune,
}: DisplayMessageProps) {
  const isSentByConseiller =
    message.sentBy === UserType.CONSEILLER.toLowerCase()

  function scrollToRef(element: HTMLLIElement | null) {
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <li className='mb-5' ref={scrollToRef} data-testid={message.id}>
      <div
        className={`text-base-regular break-words max-w-[90%] p-4 rounded-large w-max ${
          isSentByConseiller
            ? 'text-right text-content_color bg-blanc mt-0 mr-0 mb-1 ml-auto'
            : 'text-left text-blanc bg-primary_darken mb-1'
        }`}
      >
        {isSentByConseiller && (
          <p className='text-s-regular capitalize mb-1'>
            {conseillerNomComplet}
          </p>
        )}
        <p className='whitespace-pre-wrap'>{message.content}</p>
        {message.type === TypeMessage.MESSAGE_OFFRE && message.infoOffre && (
          <LienOffre infoOffre={message.infoOffre} />
        )}
        {message.type === TypeMessage.MESSAGE_PJ &&
          message.infoPiecesJointes &&
          message.infoPiecesJointes.map(({ id, nom }) => (
            <LienPieceJointe key={id} id={id} nom={nom} />
          ))}
      </div>
      <p
        className={`text-xs-medium text-grey_800 ${
          isSentByConseiller ? 'text-right' : 'text-left'
        }`}
      >
        {formatHourMinuteDate(message.creationDate)}
        {isSentByConseiller && (
          <span>
            {!lastSeenByJeune ||
            isDateOlder(lastSeenByJeune, message.creationDate)
              ? ' · Envoyé'
              : ' · Lu'}
          </span>
        )}
      </p>
    </li>
  )
}
