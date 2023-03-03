import { DateTime } from 'luxon'
import React from 'react'

import LienEvenement from 'components/chat/LienEvenement'
import LienOffre from 'components/chat/LienOffre'
import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import { Conseiller, UserType } from 'interfaces/conseiller'
import { Message, TypeMessage } from 'interfaces/message'
import { TIME_24_H_SEPARATOR, toFrenchFormat } from 'utils/date'

interface DisplayMessageProps {
  message: Message
  conseillerNomComplet: string | undefined
  beneficiaireNomComplet: string | undefined
  lastSeenByJeune: DateTime | undefined
  conseiller: Conseiller
}

export default function DisplayMessage({
  message,
  conseillerNomComplet,
  beneficiaireNomComplet,
  lastSeenByJeune,
  conseiller,
}: DisplayMessageProps) {
  const isSentByConseiller =
    message.sentBy === UserType.CONSEILLER.toLowerCase()
  const creationTime = toFrenchFormat(message.creationDate, TIME_24_H_SEPARATOR)
  const isSeenByJeune = Boolean(
    lastSeenByJeune && lastSeenByJeune > message.creationDate
  )

  const messageStyleBeneficiaire = 'text-blanc bg-primary_darken mb-1'

  function messageStyleConseiller(nomConseillerAComparer: string) {
    return isSameConseiller(nomConseillerAComparer)
      ? 'text-content_color bg-blanc mt-0 mr-0 mb-1 ml-auto'
      : 'text-accent_2 bg-blanc mt-0 mr-0 mb-1 ml-auto'
  }

  function isSameConseiller(nomConseillerAComparer: string) {
    const nomComplet = `${conseiller.firstName.toLowerCase()} ${conseiller.lastName.toLowerCase()}`
    return nomConseillerAComparer === nomComplet
  }

  return (
    <li className='mb-5' id={message.id} data-testid={message.id}>
      <div
        className={`text-base-regular break-words max-w-[90%] p-4 rounded-base w-max text-left ${
          conseillerNomComplet && isSentByConseiller
            ? messageStyleConseiller(conseillerNomComplet)
            : messageStyleBeneficiaire
        }`}
      >
        {isSentByConseiller && (
          <p className='text-s-bold capitalize mb-1'>
            {conseillerNomComplet}{' '}
            <span className='normal-case'>
              {conseillerNomComplet && isSameConseiller(conseillerNomComplet)
                ? ' (vous)'
                : ''}
            </span>
          </p>
        )}

        {!isSentByConseiller && (
          <p className='text-s-bold capitalize mb-1'>
            {beneficiaireNomComplet}
          </p>
        )}

        <TexteAvecLien texte={message.content} lighten={!isSentByConseiller} />

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
        className={`text-xs-medium text-content ${
          isSentByConseiller ? 'text-right' : 'text-left'
        }`}
      >
        <span className='sr-only'>Envoyé le </span>
        {creationTime}
        {isSentByConseiller && (
          <span>{!isSeenByJeune ? ' · Envoyé' : ' · Lu'}</span>
        )}
      </p>
    </li>
  )
}
