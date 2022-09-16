import parse, { domToReact } from 'html-react-parser'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import { LienOffre } from 'components/chat/LienOffre'
import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import { UserType } from 'interfaces/conseiller'
import { Message, TypeMessage } from 'interfaces/message'
import { TIME_24_H_SEPARATOR, toFrenchFormat } from 'utils/date'

interface DisplayMessageProps {
  message: Message
  conseillerNomComplet: string | undefined
  lastSeenByJeune: DateTime | undefined
}

export default function DisplayMessage({
  message,
  conseillerNomComplet,
  lastSeenByJeune,
}: DisplayMessageProps) {
  const isSentByConseiller =
    message.sentBy === UserType.CONSEILLER.toLowerCase()
  const creationTime: string = useMemo(
    () => toFrenchFormat(message.creationDate, TIME_24_H_SEPARATOR),
    [message.creationDate]
  )
  const isSeenByJeune: boolean = useMemo(
    () => Boolean(lastSeenByJeune && lastSeenByJeune > message.creationDate),
    [lastSeenByJeune, message.creationDate]
  )

  function scrollToRef(element: HTMLLIElement | null) {
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  function confirmationRedirectionLienExterne(lien: string) {
    if (window.confirm('Vous allez quitter l’espace conseiller')) {
      window.open(lien, '_blank', 'noopener, noreferrer')
    }
  }

  function detecteLien(message: string) {
    return message.includes('http') || message.includes('https')
  }

  function formateMessageAvecLien(message: string) {
    const messageFormate = message.split(' ').map((mot) => {
      if (detecteLien(mot)) {
        return `<button id="lienExterne">
                  <span  class='text-primary_darken hover:text-primary hover:underline hover:cursor-pointer' title="Lien externe">${mot}</span>
                </button>`
      } else {
        return mot
      }
    })

    const options = {
      replace: ({ attribs, children }: any) => {
        if (!attribs) {
          return
        }

        if (attribs.id === 'lienExterne') {
          const lien = children[1] ? children[1].children[0].data : ''

          return (
            <button onClick={() => confirmationRedirectionLienExterne(lien)}>
              {domToReact(children, options)}
            </button>
          )
        }
      },
    }

    return parse(`<p>${messageFormate.join(' ')}</p>`, options)
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
        {detecteLien(message.content) ? (
          formateMessageAvecLien(message.content)
        ) : (
          <p className='whitespace-pre-wrap'>{message.content}</p>
        )}

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
        {creationTime}
        {isSentByConseiller && (
          <span>{isSeenByJeune ? ' · Envoyé' : ' · Lu'}</span>
        )}
      </p>
    </li>
  )
}
