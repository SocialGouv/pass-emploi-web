import React, { useState } from 'react'

import ExternalLink from 'components/ui/ExternalLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { UserType } from 'interfaces/conseiller'
import { Message, TypeMessage } from 'interfaces/message'
import useMatomo from 'utils/analytics/useMatomo'
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

  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(undefined)

  useMatomo(labelMatomo)

  function scrollToRef(element: HTMLLIElement | null) {
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <li className='mb-5' ref={scrollToRef} data-testid={message.id}>
      <div
        className={`text-md break-words max-w-[90%] p-4 rounded-large w-max ${
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
        {message.type === TypeMessage.MESSAGE_OFFRE && (
          <div className='p-4 rounded-medium bg-blanc mt-4'>
            <p className='text-base-medium text-content_color'>
              {message.infoOffre!.titre}
            </p>
            <div className='mt-4 w-max ml-auto text-primary_darken fill-primary_darken hover:text-primary hover:fill-primary'>
              <ExternalLink
                key={message.infoOffre!.lien}
                href={message.infoOffre!.lien}
                label='Voir l’offre'
                onClick={() => setLabelMatomo('Voir l’offre')}
              />
            </div>
          </div>
        )}
        {message.infoPiecesJointes.map(({ id, nom }) => (
          <div key={id} className='flex flex-row flex flex-row justify-end'>
            <IconComponent
              name={IconName.File}
              aria-hidden='true'
              focusable='false'
              className='w-6 h-6'
            />
            <a
              href={`/api/fichiers/${id}`}
              aria-label='Télécharger la pièce jointe'
              title='Télécharger la pièce jointe'
              className='font-bold break-words'
            >
              {nom}
            </a>
          </div>
        ))}
      </div>
      <p
        className={`text-xs text-grey_800 ${
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
