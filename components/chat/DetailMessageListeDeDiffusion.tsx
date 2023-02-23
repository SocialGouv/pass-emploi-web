import React, { useEffect, useState } from 'react'

import DisplayMessageListeDeDiffusion from 'components/chat/DisplayMessageListeDeDiffusion'
import HeaderChat from 'components/chat/HeaderChat'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { BaseJeune } from 'interfaces/jeune'
import { MessageListeDiffusion } from 'interfaces/message'
import { JeunesService } from 'services/jeunes.service'
import { toShortDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

export function DetailMessageListeDeDiffusion(props: {
  message: MessageListeDiffusion
  onBack: () => void
}) {
  const jeunesServices = useDependance<JeunesService>('jeunesService')
  const [destinataires, setDestinataires] = useState<BaseJeune[]>([])

  useEffect(() => {
    if (props.message.idsDestinataires.length) {
      jeunesServices
        .getIdentitesBeneficiaires(props.message.idsDestinataires)
        .then(setDestinataires)
    }
  }, [props.message.idsDestinataires])

  return (
    <>
      <HeaderChat
        titre='Détail du message'
        labelRetour={'Retour aux messages de ma liste'}
        onBack={props.onBack}
      />

      <div className='px-4'>
        <div className='text-center mb-3'>
          Le {toShortDate(props.message.creationDate)}
        </div>

        <DisplayMessageListeDeDiffusion message={props.message} />

        <span id='titre-liste-destinataires' className='sr-only'>
          Destinataires du message
        </span>

        <InformationMessage label='Seuls les bénéficiaires actuellement dans votre portefeuille sont listés ci-dessous.' />

        <ul aria-describedby='titre-liste-destinataires'>
          {destinataires.map((destinataire) => (
            <li
              key={destinataire.id}
              className='mt-2 bg-blanc rounded-base p-3'
            >
              Envoyé à{' '}
              <div className='flex items-center'>
                <IconComponent
                  name={IconName.RoundedCheck}
                  aria-hidden={true}
                  focusable={false}
                  className='w-3 h-3 fill-disabled mr-2'
                />
                {destinataire.prenom} {destinataire.nom}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
