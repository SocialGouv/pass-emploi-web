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

  const [suppressionEnCours, setSuppressionEnCours] = useState<boolean>(false)

  async function supprimerMessage() {
    setSuppressionEnCours(true)
    try {
      await (props as MessageConseillerProps).onSuppression()
    } finally {
      setSuppressionEnCours(false)
    }
  }

  return (
    <li className='mb-5' id={'message-' + message.id} data-testid={message.id}>
      {suppressionEnCours && (
        <div className='w-fit ml-auto'>
          <SpinningLoader alert={true} />
        </div>
      )}

      {!suppressionEnCours && (
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
                <p
                  className='flex justify-end text-xs-medium text-content'
                  aria-label={`Le ${toLongMonthDate(message.creationDate)}`}
                >
                  Le {toShortDate(message.creationDate)}
                </p>
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
    <div className='text-xs-regular text-grey_800 max-w-[90%] p-4 rounded-base w-max text-left bg-white mt-0 mr-0 mb-1 ml-auto'>
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
      className={`text-base-regular break-words max-w-[90%] p-4 rounded-base w-max text-left bg-white mt-0 mr-0 mb-1 ml-auto ${
        isConseillerCourant ? 'text-primary_darken' : 'text-accent_2'
      } ${isEnCoursDeModification ? 'border-2 border-solid border-primary_darken' : ''}`}
    >
      <p className='text-s-bold capitalize mb-1'>
        {isConseillerCourant ? 'Vous' : conseillerNomComplet}
      </p>

      <TexteAvecLien
        texte={message.content}
        highlight={
          props.highlight?.key === 'content' ? props.highlight : undefined
        }
      />

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
            highlight={
              props.highlight?.key === 'piecesJointes.nom'
                ? props.highlight
                : undefined
            }
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

  function supprimerMessage() {
    setAfficherMenuEdition(false)
    onSuppression()
  }

  function modifierMessage() {
    setAfficherMenuEdition(false)
    onModification()
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
    <div className='relative'>
      <button
        type='button'
        onClick={permuterMenuEdition}
        title={`${afficherMenuEdition ? 'Cacher' : 'Voir'} les actions possibles pour votre message du ${toFrenchDateTime(creationDate)}`}
        aria-label={`
          ${afficherMenuEdition ? 'Cacher' : 'Voir'} les actions possibles pour
          votre message du ${toFrenchDateTime(creationDate, { a11y: true })}
        `}
        className='flex items-center gap-2 ml-auto text-xs-medium text-content'
      >
        <div
          className={
            afficherMenuEdition
              ? 'bg-primary rounded-full fill-white'
              : 'fill-grey_800 hover:rounded-full hover:shadow-m'
          }
        >
          <IconComponent
            focusable={false}
            aria-hidden={true}
            className='inline w-4 h-4 m-1'
            name={IconName.More}
          />
        </div>

        <p>
          <span className='sr-only'>Envoyé à </span>
          <span aria-label={toFrenchTime(creationDate, { a11y: true })}>
            {toFrenchTime(creationDate)}
          </span>
          {estModifie && ' · Modifié'}
          {!estModifie && (!isSeenByJeune ? ' · Envoyé' : ' · Lu')}
        </p>
      </button>

      {afficherMenuEdition && (
        <div
          className='absolute top-[2em] right-0 z-10 bg-white rounded-base p-2 shadow-m'
          ref={scrollToRef}
        >
          <button
            type='button'
            onClick={modifierMessage}
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
            onClick={supprimerMessage}
            className='p-2 flex items-center text-warning text-s-bold gap-2 hover:rounded-base hover:bg-warning hover:text-white hover:shadow-m'
          >
            <IconComponent
              focusable={false}
              aria-hidden={true}
              className='inline w-4 h-4 fill-[currentColor]'
              name={IconName.Delete}
            />
            Supprimer le message{' '}
            <span className='sr-only'>
              du {toFrenchDateTime(creationDate, { a11y: true })}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function isResultatRecherche(
  props: DisplayMessageConseillerProps
): props is ResultatRechercheProps {
  return Object.prototype.hasOwnProperty.call(props, 'estResultatDeRecherche')
}
