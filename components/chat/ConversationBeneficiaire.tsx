import React, { useState } from 'react'

import { Conversation } from 'components/chat/Conversation'
import { RechercheMessage } from 'components/chat/RechercheMessage'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { Message } from 'interfaces/message'

type ConversationBeneficiaireProps = {
  conseillers: ConseillerHistorique[]
  jeuneChat: JeuneChat
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
    <div className='h-full flex flex-col min-h-0 bg-grey_100 overflow-auto'>
      {!afficherRecherche && (
        <Conversation
          beneficiaireNomComplet={beneficiaireNomComplet}
          getConseillerNomComplet={getConseillerNomComplet}
          jeuneChat={jeuneChat}
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
