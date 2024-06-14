import { DateTime } from 'luxon'
import React, { useState } from 'react'

import LienEvenement from 'components/chat/LienEvenement'
import LienEvenementEmploi from 'components/chat/LienEvenementEmploi'
import LienOffre from 'components/chat/LienOffre'
import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import LienSessionMilo from 'components/chat/LienSessionMilo'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import {
  isDeleted,
  isEdited,
  Message,
  MessageRechercheMatch,
  TypeMessage,
} from 'interfaces/message'
import {
  toFrenchDateTime,
  toFrenchTime,
  toLongMonthDate,
  toShortDate,
} from 'utils/date'

type Base = {
  message: Message
  conseillerNomComplet: string | undefined
  isConseillerCourant: boolean
  highlight?: MessageRechercheMatch
}

type ResultatRechercheProps = Base & {
  isEnCoursDeModification: false
  estResultatDeRecherche: true
  onAllerAuMessage: () => void
}

type MessageConseillerProps = Base & {
  lastSeenByJeune: DateTime | undefined
  onSuppression: () => Promise<void>
  onModification: () => void
  isEnCoursDeModification: boolean
}

type DisplayMessageConseillerProps =
  | ResultatRechercheProps
  | MessageConseillerProps

export default function DisplayMessageConseiller(
  props: DisplayMessageConseillerProps
) {
  const { message } = props

  const [editionEnCours, setEditionEnCours] = useState<boolean>(false)

  async function supprimerMessage() {
    setEditionEnCours(true)
    try {
      await (props as MessageConseillerProps).onSuppression()
    } finally {
      setEditionEnCours(false)
    }
  }

  return (
    <li className='mb-5' id={message.id} data-testid={message.id}>
      {editionEnCours && (
        <div className='w-fit ml-auto'>
          <SpinningLoader />
        </div>
      )}

      {!editionEnCours && (
        <>
          {isDeleted(message) && <MessageSupprime />}

          {!isDeleted(message) && (
            <>
              <MessageConseiller {...props} />

              {!isResultatRecherche(props) && (
                <FooterMessage
                  creationDate={message.creationDate}
                  lastSeenByJeune={props.lastSeenByJeune}
                  onSuppression={supprimerMessage}
                  onModification={props.onModification}
                  estModifie={isEdited(message)}
                />
              )}

              {isResultatRecherche(props) && (
                <span
                  className='flex justify-end text-xs-medium text-content'
                  aria-label={`Le ${toLongMonthDate(message.creationDate)}`}
                >
                  Le {toShortDate(message.creationDate)}
                </span>
              )}
            </>
          )}
        </>
      )}
    </li>
  )
}

function MessageSupprime() {
  return (
    <div className='text-xs-regular text-grey_800 max-w-[90%] p-4 rounded-base w-max text-left bg-blanc mt-0 mr-0 mb-1 ml-auto'>
      Vous avez supprimé ce message
    </div>
  )
}

function MessageConseiller(props: DisplayMessageConseillerProps) {
  const {
    message,
    conseillerNomComplet,
    isConseillerCourant,
    isEnCoursDeModification,
  } = props

  return (
    <div
      className={`text-base-regular break-words max-w-[90%] p-4 rounded-base w-max text-left bg-blanc mt-0 mr-0 mb-1 ml-auto ${
        isConseillerCourant ? 'text-primary_darken' : 'text-accent_2'
      } ${isEnCoursDeModification ? 'border-2 border-solid border-primary_darken' : ''}`}
    >
      <p className='text-s-bold capitalize mb-1'>
        {isConseillerCourant ? 'Vous' : conseillerNomComplet}
      </p>

      <TexteAvecLien texte={message.content} highlight={props.highlight} />

      {message.type === TypeMessage.MESSAGE_OFFRE && message.infoOffre && (
        <LienOffre infoOffre={message.infoOffre} isSentByConseiller={true} />
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
          <LienPieceJointe
            key={id}
            id={id}
            nom={nom}
            className='fill-primary'
            highlight={props.highlight}
          />
        ))}

      {isResultatRecherche(props) && (
        <button
          className='underline pt-4 text-base-medium'
          onClick={props.onAllerAuMessage}
        >
          Aller au message
          <span className='sr-only'>
            du {toLongMonthDate(message.creationDate)}
          </span>
        </button>
      )}
    </div>
  )
}

function FooterMessage({
  creationDate,
  lastSeenByJeune,
  onSuppression,
  onModification,
  estModifie,
}: {
  creationDate: DateTime
  lastSeenByJeune: DateTime | undefined
  onSuppression: () => void
  onModification: () => void
  estModifie?: boolean
}) {
  const [afficherMenuEdition, setAfficherMenuEdition] = useState<boolean>(false)

  const isSeenByJeune = Boolean(
    lastSeenByJeune && lastSeenByJeune > creationDate
  )

  function permuterMenuEdition() {
    setAfficherMenuEdition(!afficherMenuEdition)
  }

  function scrollToRef(element: HTMLElement | null) {
    if (element)
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
  }

  return (
    <div
      onClick={permuterMenuEdition}
      className='relative flex items-center gap-2 justify-end text-xs-medium text-content'
    >
      <button
        type='button'
        className={
          afficherMenuEdition
            ? 'bg-primary rounded-full fill-blanc'
            : 'fill-grey_800 hover:rounded-full hover:shadow-m'
        }
        title={`${afficherMenuEdition ? 'Cacher' : 'Voir'} les actions possibles pour votre message du ${toFrenchDateTime(creationDate)}`}
      >
        <IconComponent
          focusable={false}
          aria-hidden={true}
          className='inline w-4 h-4 m-1'
          name={IconName.More}
        />
        <span className='sr-only'>
          {afficherMenuEdition ? 'Cacher' : 'Voir'} les actions possibles pour
          votre message du {toFrenchDateTime(creationDate, { a11y: true })}
        </span>
      </button>

      {afficherMenuEdition && (
        <div
          className='absolute top-[2em] z-10 bg-blanc rounded-base p-2 shadow-m'
          ref={scrollToRef}
        >
          <button
            type='button'
            onClick={() => onModification()}
            className='p-2 flex items-center text-s-bold gap-2 hover:text-primary hover:rounded-base hover:bg-primary_lighten hover:shadow-m'
          >
            <IconComponent
              focusable={false}
              aria-hidden={true}
              className='inline w-4 h-4 fill-[currentColor]'
              name={IconName.Edit}
            />
            Modifier le message
          </button>
          <button
            type='button'
            onClick={() => onSuppression()}
            className='p-2 flex items-center text-warning text-s-bold gap-2 hover:rounded-base hover:bg-warning hover:text-blanc hover:shadow-m'
          >
            <IconComponent
              focusable={false}
              aria-hidden={true}
              className='inline w-4 h-4 fill-[currentColor]'
              name={IconName.Delete}
            />
            Supprimer le message
          </button>
        </div>
      )}

      <span>
        <span className='sr-only'>Envoyé à </span>
        <span aria-label={toFrenchTime(creationDate, { a11y: true })}>
          {toFrenchTime(creationDate)}
        </span>
        {estModifie && ' · Modifié'}
        {!estModifie && (!isSeenByJeune ? ' · Envoyé' : ' · Lu')}
      </span>
    </div>
  )
}

function isResultatRecherche(
  props: DisplayMessageConseillerProps
): props is ResultatRechercheProps {
  return Object.prototype.hasOwnProperty.call(props, 'estResultatDeRecherche')
}
