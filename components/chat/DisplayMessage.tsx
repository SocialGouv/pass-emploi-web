import parse, { domToReact } from 'html-react-parser'
import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import LienEvenement from 'components/chat/LienEvenement'
import LienOffre from 'components/chat/LienOffre'
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
        return `<a id="lienExterne">
          <span  class='text-blanc underline hover:text-primary_lighten hover:cursor-pointer'>${mot}</span>  
          <span class='ml-1'>    
           <svg aria-hidden='true' focusable='false' viewBox="0 0 12 12" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10.6667H2C1.63333 10.6667 1.33333 10.3667 1.33333 10V2C1.33333 1.63333 1.63333 1.33333 2 1.33333H5.33333C5.7 1.33333 6 1.03333 6 0.666667C6 0.3 5.7 0 5.33333 0H1.33333C0.593333 0 0 0.6 0 1.33333V10.6667C0 11.4 0.6 12 1.33333 12H10.6667C11.4 12 12 11.4 12 10.6667V6.66667C12 6.3 11.7 6 11.3333 6C10.9667 6 10.6667 6.3 10.6667 6.66667V10C10.6667 10.3667 10.3667 10.6667 10 10.6667ZM7.33333 0.666667C7.33333 1.03333 7.63333 1.33333 8 1.33333H9.72667L3.64 7.42C3.38 7.68 3.38 8.1 3.64 8.36C3.9 8.62 4.32 8.62 4.58 8.36L10.6667 2.27333V4C10.6667 4.36667 10.9667 4.66667 11.3333 4.66667C11.7 4.66667 12 4.36667 12 4V0H8C7.63333 0 7.33333 0.3 7.33333 0.666667Z" fill="#fff"/>
          </svg>
          </span>
        </a>`
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
            <a
              href={lien}
              target='_blank'
              rel='noreferrer noopener'
              aria-label={`${lien} (nouvelle fenêtre)`}
              className='flex items-center'
              onClick={() => confirmationRedirectionLienExterne(lien)}
            >
              {domToReact(children, options)}
            </a>
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
          <LienOffre
            infoOffre={message.infoOffre}
            isSentByConseiller={isSentByConseiller}
          />
        )}
        {message.type === TypeMessage.MESSAGE_EVENEMENT &&
          message.infoEvenement && (
            <LienEvenement infoEvenement={message.infoEvenement} />
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
          <span>{!isSeenByJeune ? ' · Envoyé' : ' · Lu'}</span>
        )}
      </p>
    </li>
  )
}
