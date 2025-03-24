import React, { useState } from 'react'

import { Conversation } from 'components/chat/Conversation'
import { RechercheMessage } from 'components/chat/RechercheMessage'
import {
  BeneficiaireEtChat,
  ConseillerHistorique,
} from 'interfaces/beneficiaire'
import { Message } from 'interfaces/message'

type ConversationBeneficiaireProps = {
  conseillers: ConseillerHistorique[]
  beneficiaireChat: BeneficiaireEtChat
  onBack: () => void
}

export default function ConversationBeneficiaire({
  beneficiaireChat,
  conseillers,
  onBack,
}: ConversationBeneficiaireProps) {
  const [afficherRecherche, setAfficherRecherche] = useState<boolean>(false)

  const beneficiaireNomComplet = `${beneficiaireChat.prenom} ${beneficiaireChat.nom}`

  function getConseillerNomComplet(message: Message) {
    const conseillerTrouve = conseillers.find(
      (c) => c.id === message.conseillerId
    )
    if (conseillerTrouve) {
      return `${conseillerTrouve?.prenom.toLowerCase()} ${conseillerTrouve?.nom.toLowerCase()}`
    }
  }

  return (
    <div className='h-full flex flex-col min-h-0'>
      {!afficherRecherche && (
        <Conversation
          beneficiaireNomComplet={beneficiaireNomComplet}
          getConseillerNomComplet={getConseillerNomComplet}
          beneficiaireChat={beneficiaireChat}
          onBack={onBack}
          toggleAfficherRecherche={() => setAfficherRecherche(true)}
        />
      )}

      {afficherRecherche && (
        <RechercheMessage
          beneficiaireNomComplet={beneficiaireNomComplet}
          getConseillerNomComplet={getConseillerNomComplet}
          beneficiaireEtChat={beneficiaireChat}
          toggleAfficherRecherche={() => setAfficherRecherche(false)}
        />
      )}
    </div>
  )
}
