import { DateTime } from 'luxon'
import React from 'react'

import LienEvenement from 'components/chat/LienEvenement'
import LienEvenementEmploi from 'components/chat/LienEvenementEmploi'
import LienOffre from 'components/chat/LienOffre'
import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import LienSessionMilo from 'components/chat/LienSessionMilo'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import { UserType } from 'interfaces/conseiller'
import { Message, TypeMessage } from 'interfaces/message'
import { TIME_24_H_SEPARATOR, toFrenchFormat } from 'utils/date'

interface DisplayMessageProps {
  message: Message
  conseillerNomComplet: string | undefined
  lastSeenByJeune: DateTime | undefined
  isConseillerCourant: boolean
}

export default function DisplayMessage({
  message,
  conseillerNomComplet,
  isConseillerCourant,
  lastSeenByJeune,
}: DisplayMessageProps) {
  const isSentByConseiller =
    message.sentBy === UserType.CONSEILLER.toLowerCase()
  const creationTime = toFrenchFormat(message.creationDate, TIME_24_H_SEPARATOR)
  const isSeenByJeune = Boolean(
    lastSeenByJeune && lastSeenByJeune > message.creationDate
  )

  const messageStyleBeneficiaire = 'text-blanc bg-primary_darken mb-1'

  const messageStyleConseiller = `bg-blanc mt-0 mr-0 mb-1 ml-auto ${
    isConseillerCourant ? 'text-primary_darken' : 'text-accent_2'
  }`

  return (
    <li className='mb-5' id={message.id} data-testid={message.id}>
      <div
        className={`text-base-regular break-words max-w-[90%] p-4 rounded-base w-max text-left ${
          isSentByConseiller ? messageStyleConseiller : messageStyleBeneficiaire
        }`}
      >
        {isSentByConseiller && (
          <p className='text-s-bold capitalize mb-1'>
            {isConseillerCourant ? 'Vous' : conseillerNomComplet}
          </p>
        )}

        <TexteAvecLien texte={message.content} lighten={!isSentByConseiller} />

        {message.type === TypeMessage.MESSAGE_OFFRE && message.infoOffre && (
          <LienOffre
            infoOffre={message.infoOffre}
            isSentByConseiller={isSentByConseiller}
          />
        )}

        {message.type === TypeMessage.MESSAGE_SESSION_MILO &&
          message.infoSessionImilo && (
            <LienSessionMilo infoSessionMilo={message.infoSessionImilo} />
          )}

        {message.type === TypeMessage.MESSAGE_EVENEMENT &&
          message.infoEvenement && (
            <LienEvenement infoEvenement={message.infoEvenement} />
          )}

        {message.type === TypeMessage.MESSAGE_EVENEMENT_EMPLOI &&
          message.infoEvenementEmploi && (
            <LienEvenementEmploi
              infoEvenementEmploi={message.infoEvenementEmploi}
            />
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
