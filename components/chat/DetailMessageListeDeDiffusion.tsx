import React, { useEffect, useState } from 'react'

import DisplayMessageListeDeDiffusion from 'components/chat/DisplayMessageListeDeDiffusion'
import HeaderChat from 'components/chat/HeaderChat'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { BaseJeune, JeuneChat } from 'interfaces/jeune'
import { MessageListeDiffusion } from 'interfaces/message'
import { JeunesService } from 'services/jeunes.service'
import { toShortDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

export function DetailMessageListeDeDiffusion({
  message,
  chats,
  onBack,
  messagerieFullScreen,
}: {
  message: MessageListeDiffusion
  chats: JeuneChat[] | undefined
  onBack: () => void
  messagerieFullScreen?: boolean
}) {
  const jeunesServices = useDependance<JeunesService>('jeunesService')
  const [destinataires, setDestinataires] = useState<JeuneChat[]>()

  function aLuLeMessage(destinataire: JeuneChat) {
    return (
      destinataire.lastJeuneReading &&
      destinataire.lastJeuneReading > message.creationDate
    )
  }

  useEffect(() => {
    function getChatsDestinataires(jeunes: BaseJeune[]): JeuneChat[] {
      return chats!.filter((jeuneChat) =>
        jeunes.some((jeune) => jeune.id === jeuneChat.id)
      )
    }

    if (message.idsDestinataires.length && chats?.length) {
      jeunesServices
        .getIdentitesBeneficiaires(message.idsDestinataires)
        .then((jeunes) => setDestinataires(getChatsDestinataires(jeunes)))
    }
  }, [chats, message.idsDestinataires])

  return (
    <>
      {!messagerieFullScreen && (
        <HeaderChat
          titre='Détail du message'
          labelRetour={'Retour aux messages de ma liste'}
          onBack={onBack}
        />
      )}

      <div className='px-4'>
        <div className='text-center mb-3'>
          Le {toShortDate(message.creationDate)}
        </div>

        <DisplayMessageListeDeDiffusion
          message={message}
          messagerieFullScreen={messagerieFullScreen}
        />

        <span id='titre-liste-destinataires' className='sr-only'>
          Destinataires du message
        </span>

        <InformationMessage label='Seuls les bénéficiaires actuellement dans votre portefeuille sont listés ci-dessous.' />

        {!destinataires && <SpinningLoader />}

        {destinataires && (
          <ul aria-describedby='titre-liste-destinataires'>
            {destinataires.map((destinataire) => (
              <li
                key={destinataire.id}
                className='mt-2 bg-blanc rounded-base p-3'
              >
                {aLuLeMessage(destinataire) ? 'Lu par ' : 'Non lu par '}
                <div className='flex items-center'>
                  <IconComponent
                    name={
                      aLuLeMessage(destinataire)
                        ? IconName.CheckCircleFill
                        : IconName.CheckCircleOutline
                    }
                    aria-hidden={true}
                    focusable={false}
                    className={`w-3 h-3 ${
                      aLuLeMessage(destinataire)
                        ? 'fill-primary'
                        : 'fill-disabled'
                    } mr-2`}
                  />
                  {destinataire.prenom} {destinataire.nom}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
