import React, { useEffect, useState } from 'react'

import HeaderChat from 'components/chat/HeaderChat'
import { BaseJeune } from 'interfaces/jeune'
import { MessageListeDiffusion } from 'interfaces/message'
import { JeunesService } from 'services/jeunes.service'
import { TIME_24_H_SEPARATOR, toFrenchFormat, toShortDate } from 'utils/date'
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

      <span>Le {toShortDate(props.message.creationDate)}</span>
      <div>{props.message.content}</div>
      <span>
        Envoyé à{' '}
        {toFrenchFormat(props.message.creationDate, TIME_24_H_SEPARATOR)}
      </span>
      <span id='titre-liste-destinataires'>Destinataires du message</span>
      <ul aria-describedby='titre-liste-destinataires'>
        {destinataires.map((destinataire) => (
          <li key={destinataire.id}>
            {destinataire.prenom} {destinataire.nom}
          </li>
        ))}
      </ul>
    </>
  )
}
