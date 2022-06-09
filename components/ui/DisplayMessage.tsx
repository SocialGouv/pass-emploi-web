import React from 'react'

import FileIcon from '../../assets/icons/attach_file.svg'
import { UserType } from '../../interfaces/conseiller'
import { Message, TypeMessage } from '../../interfaces/message'
import { formatHourMinuteDate, isDateOlder } from '../../utils/date'

interface DisplayMessageProps {
  ref: (message: HTMLLIElement | null) => void
  message: Message
  conseillerNomComplet: string | undefined
  lastSeenByJeune: Date | undefined
}

export default function DisplayMessage({
  ref,
  message,
  conseillerNomComplet,
  lastSeenByJeune,
}: DisplayMessageProps) {
  function isSentByConseiller(message: Message): boolean {
    return message.sentBy === UserType.CONSEILLER.toLowerCase()
  }

  return (
    <li className='mb-5' ref={ref} data-testid={message.id}>
      <div
        className={`text-md break-words max-w-[90%] p-4 rounded-large w-max ${
          isSentByConseiller(message)
            ? 'text-right text-content_color bg-blanc mt-0 mr-0 mb-1 ml-auto'
            : 'text-left text-blanc bg-primary_darken mb-1'
        }`}
      >
        {isSentByConseiller(message) && (
          <p className='text-s-regular capitalize mb-1'>
            {conseillerNomComplet}
          </p>
        )}
        <p className='whitespace-pre-wrap'>{message.content}</p>
        {message.type === TypeMessage.MESSAGE_PJ && (
          <div className='px-3 pb-3 flex flex-row'>
            <FileIcon
              aria-hidden='true'
              focusable='false'
              className='w-6 h-6'
            />
            <span className='font-bold break-words'>
              <a href={`/api/fichiers/${message.piecesJointes![0].id}`}>
                {message.piecesJointes![0].nom}
              </a>
            </span>
          </div>
        )}
      </div>
      <p
        className={`text-xs text-grey_800 ${
          isSentByConseiller(message) ? 'text-right' : 'text-left'
        }`}
      >
        {formatHourMinuteDate(message.creationDate)}
        {isSentByConseiller(message) && (
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
