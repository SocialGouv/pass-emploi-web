import React from 'react'

import LienEvenement from 'components/chat/LienEvenement'
import LienEvenementEmploi from 'components/chat/LienEvenementEmploi'
import LienOffre from 'components/chat/LienOffre'
import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import LienSessionMilo from 'components/chat/LienSessionMilo'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import SpinningLoader from 'components/ui/SpinningLoader'
import { InfoFichier } from 'interfaces/fichier'
import {
  isDeleted,
  isEdited,
  Message,
  MessageRechercheMatch,
  TypeMessage,
} from 'interfaces/message'
import { estAvenirPro } from 'interfaces/structure'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchTime, toLongMonthDate, toShortDate } from 'utils/date'

type MessageBeneficiaireProps = {
  message: Message
  beneficiaireNomComplet: string
  highlight?: MessageRechercheMatch
}

type ResultatRechercheProps = MessageBeneficiaireProps & {
  estResultatDeRecherche: true
  onAllerAuMessage: () => void
}

type DisplayMessageBeneficiaireProps =
  | MessageBeneficiaireProps
  | ResultatRechercheProps

export default function DisplayMessageBeneficiaire(
  props: DisplayMessageBeneficiaireProps
) {
  const { message, beneficiaireNomComplet } = props
  const [conseiller] = useConseiller()
  const estConseillerAvenirPro = estAvenirPro(conseiller.structure)

  return (
    <li className='mb-5' id={'message-' + message.id} data-testid={message.id}>
      {isDeleted(message) && (
        <div className='text-xs-regular break-words max-w-[90%] p-4 rounded-base w-max text-left text-white bg-primary-darken mb-1'>
          Message supprimé
        </div>
      )}

      {!isDeleted(message) && (
        <>
          <div className='text-base-regular break-words max-w-[90%] p-4 rounded-base w-max text-left text-white bg-primary-darken mb-1'>
            <span className='sr-only'>{beneficiaireNomComplet} :</span>

            {message.type === TypeMessage.MESSAGE_PJ &&
              message.infoPiecesJointes &&
              message.infoPiecesJointes.map((pj, key) => {
                return (
                  <MessagePJ
                    key={key}
                    infoFichier={pj}
                    highlight={props.highlight}
                    estConseillerAvenirPro={estConseillerAvenirPro}
                  />
                )
              })}

            {message.type !== TypeMessage.MESSAGE_PJ && (
              <p className='whitespace-pre-wrap'>
                <TexteAvecLien
                  texte={message.content}
                  lighten={true}
                  highlight={
                    props.highlight?.key === 'content'
                      ? props.highlight
                      : undefined
                  }
                />
              </p>
            )}

            {message.type === TypeMessage.MESSAGE_OFFRE &&
              message.infoOffre && (
                <LienOffre
                  infoOffre={message.infoOffre}
                  isSentByConseiller={false}
                />
              )}

            {(message.type === TypeMessage.MESSAGE_SESSION_MILO ||
              message.type === TypeMessage.AUTO_INSCRIPTION) &&
              message.infoSessionMilo && (
                <LienSessionMilo infoSessionMilo={message.infoSessionMilo} />
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
          <div className='text-xs-medium text-content text-left'>
            {!isResultatRecherche(props) && (
              <p>
                <span className='sr-only'>Envoyé à </span>
                <span
                  aria-label={toFrenchTime(message.creationDate, {
                    a11y: true,
                  })}
                >
                  {toFrenchTime(message.creationDate)}
                </span>
                {isEdited(message) && ' · Modifié'}
              </p>
            )}

            {isResultatRecherche(props) && (
              <p aria-label={`Le ${toLongMonthDate(message.creationDate)}`}>
                Le {toShortDate(message.creationDate)}
              </p>
            )}
          </div>
        </>
      )}
    </li>
  )
}

function MessagePJ({
  infoFichier,
  highlight,
  estConseillerAvenirPro,
}: {
  infoFichier: InfoFichier
  highlight?: MessageRechercheMatch
  estConseillerAvenirPro: boolean
}) {
  const wordingPJTransmiseParBeneficiaire = `Votre bénéficiaire vous a transmis une nouvelle pièce jointe. Celle-ci sera conservée 4 mois. ${
    estConseillerAvenirPro
      ? ''
      : 'Enregistrez la dans i-milo pour la conserver de manière sécurisée.'
  }`

  switch (infoFichier.statut) {
    case 'valide':
      return (
        <>
          <p className='whitespace-pre-wrap'>
            {wordingPJTransmiseParBeneficiaire}
          </p>
          <LienPieceJointe
            infoFichier={infoFichier}
            isSentByConseiller={false}
            highlight={
              highlight?.key === 'piecesJointes.nom' ? highlight : undefined
            }
          />
        </>
      )
    case 'non_valide':
      return (
        <p className='whitespace-pre-wrap'>
          La pièce-jointe envoyée par votre bénéficiaire a été bloquée par
          l’antivirus
          <span className='block text-xs-regular'>{infoFichier.nom}</span>
        </p>
      )
    case 'analyse_a_faire':
    case 'analyse_en_cours':
      return (
        <>
          <p className='whitespace-pre-wrap'>
            {wordingPJTransmiseParBeneficiaire}
          </p>
          <div className='flex flex-row justify-end items-center break-all'>
            <SpinningLoader className='w-4! h-4! mr-2 fill-primary-lighten' />
            {infoFichier.nom}
          </div>
        </>
      )
    case 'expiree':
      return (
        <p className='text-xs-regular'>
          {infoFichier.nom} (Pièce jointe expirée)
        </p>
      )
    case 'erreur_analyse':
      return (
        <p className='whitespace-pre-wrap'>
          Erreur lors de l’analyse de la pièce jointe envoyée par votre
          bénéficiaire. Vous pouvez lui demander de la renvoyer.
          <span className='block text-xs-regular'>{infoFichier.nom}</span>
        </p>
      )
    default:
      return (
        <div className='flex flex-row justify-end items-center break-all'>
          <SpinningLoader className='w-4! h-4! mr-2 fill-primary-lighten' />
          {infoFichier.nom}
        </div>
      )
  }
}

function isResultatRecherche(
  props: DisplayMessageBeneficiaireProps
): props is ResultatRechercheProps {
  return Object.prototype.hasOwnProperty.call(props, 'estResultatDeRecherche')
}
