import React, { useState } from 'react'

import { DetailMessageListeDeDiffusion } from 'components/chat/DetailMessageListeDeDiffusion'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { BeneficiaireChat } from 'interfaces/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'

type RubriqueListesDeDiffusionProps = {
  listesDeDiffusion: ListeDeDiffusion[] | undefined
  chats: BeneficiaireChat[] | undefined
  onBack: () => void
}

export default function RubriqueListesDeDiffusion({
  listesDeDiffusion,
  chats,
  onBack,
}: RubriqueListesDeDiffusionProps) {
  const [listeSelectionnee, setListeSelectionnee] = useState<
    ListeDeDiffusion | undefined
  >()
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()

  return (
    <div className='h-full flex flex-col'>
      {!listeSelectionnee && (
        <ListeListesDeDiffusion
          listesDeDiffusion={listesDeDiffusion}
          onAfficherListe={setListeSelectionnee}
          onBack={onBack}
        />
      )}

      {listeSelectionnee && !messageSelectionne && (
        <MessagesListeDeDiffusion
          liste={listeSelectionnee}
          onAfficherDetailMessage={setMessageSelectionne}
          onBack={() => setListeSelectionnee(undefined)}
        />
      )}

      {listeSelectionnee && messageSelectionne && (
        <DetailMessageListeDeDiffusion
          message={messageSelectionne}
          onBack={() => setMessageSelectionne(undefined)}
          chats={chats}
        />
      )}
    </div>
  )
}
