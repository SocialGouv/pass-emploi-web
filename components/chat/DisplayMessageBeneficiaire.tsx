import React from 'react'

import LienEvenement from 'components/chat/LienEvenement'
import LienEvenementEmploi from 'components/chat/LienEvenementEmploi'
import LienOffre from 'components/chat/LienOffre'
import { LienPieceJointe } from 'components/chat/LienPieceJointe'
import LienSessionMilo from 'components/chat/LienSessionMilo'
import TexteAvecLien from 'components/chat/TexteAvecLien'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { isDeleted, isEdited, Message, TypeMessage } from 'interfaces/message'
import { toFrenchTime, toShortDate } from 'utils/date'

interface DisplayMessageBeneficiaireProps {
  message: Message
  beneficiaireNomComplet: string
  estResultatDeRecherche?: boolean
}

export default function DisplayMessageBeneficiaire({
  message,
  beneficiaireNomComplet,
  estResultatDeRecherche,
}: DisplayMessageBeneficiaireProps) {
  return (
    <li className='mb-5' id={message.id} data-testid={message.id}>
      {isDeleted(message) && (
        <div className='text-xs-regular break-words max-w-[90%] p-4 rounded-base w-max text-left text-blanc bg-primary_darken mb-1'>
          Message supprimé
        </div>
      )}

      {!isDeleted(message) && (
        <>
          <div className='text-base-regular break-words max-w-[90%] p-4 rounded-base w-max text-left text-blanc bg-primary_darken mb-1'>
            <span className='sr-only'>{beneficiaireNomComplet} :</span>

            {message.type === TypeMessage.MESSAGE_PJ &&
              message.infoPiecesJointes &&
              message.infoPiecesJointes.map((pj, key) => {
                return <MessagePJ key={key} {...pj} />
              })}

            {message.type !== TypeMessage.MESSAGE_PJ && (
              <TexteAvecLien texte={message.content} lighten={true} />
            )}

            {message.type === TypeMessage.MESSAGE_OFFRE &&
              message.infoOffre && (
                <LienOffre
                  infoOffre={message.infoOffre}
                  isSentByConseiller={false}
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
          </div>
          <div className='text-xs-medium text-content text-left'>
            {!estResultatDeRecherche && (
              <>
                <span className='sr-only'>Envoyé à </span>
                <span
                  aria-label={toFrenchTime(message.creationDate, {
                    a11y: true,
                  })}
                >
                  {toFrenchTime(message.creationDate)}
                </span>
                {isEdited(message) && ' · Modifié'}
              </>
            )}
            {estResultatDeRecherche && (
              <span>Le {toShortDate(message.creationDate)}</span>
            )}
          </div>
        </>
      )}
    </li>
  )
}

function MessagePJ({
  id,
  nom,
  statut,
}: {
  id: string
  nom: string
  statut?: string
}) {
  switch (statut) {
    case 'valide':
      return (
        <>
          <p className='whitespace-pre-wrap'>
            Votre bénéficiaire vous a transmis une nouvelle pièce jointe.
            Celle-ci sera conservée 4 mois. Enregistrez la dans i-milo pour la
            conserver de manière sécurisée.
          </p>
          <LienPieceJointe key={id} id={id} nom={nom} className='fill-blanc' />
        </>
      )
    case 'non_valide':
      return (
        <p className='whitespace-pre-wrap'>
          La pièce-jointe envoyée par votre bénéficiaire a été bloquée par
          l’antivirus
        </p>
      )
    case 'analyse_a_faire':
    case 'analyse_en_cours':
      return (
        <>
          <p className='whitespace-pre-wrap'>
            Votre bénéficiaire vous a transmis une nouvelle pièce jointe.
            Celle-ci sera conservée 4 mois. Enregistrez la dans i-milo pour la
            conserver de manière sécurisée.
          </p>
          <div className='flex flex-row justify-end items-center break-all'>
            <SpinningLoader className='w-4 h-4 mr-2 fill-primary_lighten' />
            {nom}
          </div>
        </>
      )
    case 'expiree':
      return <p className='text-xs-regular'>Pièce jointe expirée</p>
    default:
      return <SpinningLoader className='w-6 h-6 mr-2 fill-primary_lighten' />
  }
}
