import React, { useState } from 'react'

import { Conversation } from 'components/chat/Conversation'
import { RechercheMessage } from 'components/chat/RechercheMessage'
import { ConseillerHistorique, BeneficiaireChat } from 'interfaces/beneficiaire'
import { Message } from 'interfaces/message'

type ConversationBeneficiaireProps = {
  conseillers: ConseillerHistorique[]
  jeuneChat: BeneficiaireChat
  onBack: () => void
}

export default function ConversationBeneficiaire({
  jeuneChat,
  conseillers,
  onBack,
}: ConversationBeneficiaireProps) {
  const [afficherRecherche, setAfficherRecherche] = useState<boolean>(false)

  const beneficiaireNomComplet = `${jeuneChat.prenom} ${jeuneChat.nom}`

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
          beneficiaireChat={jeuneChat}
          onBack={onBack}
          toggleAfficherRecherche={() => setAfficherRecherche(true)}
        />
      )}

      {afficherRecherche && (
        <RechercheMessage
          beneficiaireNomComplet={beneficiaireNomComplet}
          getConseillerNomComplet={getConseillerNomComplet}
          jeuneChat={jeuneChat}
          toggleAfficherRecherche={() => setAfficherRecherche(false)}
        />
      )}
    </div>
  )
}
