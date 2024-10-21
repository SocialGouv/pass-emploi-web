import React, { useEffect, useRef, useState } from 'react'

import { DetailMessageListeDeDiffusion } from 'components/chat/DetailMessageListeDeDiffusion'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'

type RubriqueListesDeDiffusionProps = {
  listesDeDiffusion: ListeDeDiffusion[] | undefined
  chats: BeneficiaireEtChat[] | undefined
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
  const [idListeAFocus, setIdListeAFocus] = useState<string | undefined>()
  const listesDiffusionRef = useRef<{
    focusListe: (id: string) => void
  } | null>(null)

  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()
  const [idMessageAFocus, setIdMessageAFocus] = useState<string | undefined>()
  const messagesListeRef = useRef<{
    focusMessage: (id: string) => void
  } | null>(null)

  function fermerListe() {
    setIdListeAFocus(listeSelectionnee!.id)
    setListeSelectionnee(undefined)
  }

  function fermerMessage() {
    setIdMessageAFocus(messageSelectionne!.id)
    setMessageSelectionne(undefined)
  }

  useEffect(() => {
    if (idListeAFocus) {
      listesDiffusionRef.current!.focusListe(idListeAFocus)
      setIdListeAFocus(undefined)
    }
  }, [idListeAFocus])

  useEffect(() => {
    if (idMessageAFocus) {
      messagesListeRef.current!.focusMessage(idMessageAFocus)
      setIdMessageAFocus(undefined)
    }
  }, [idMessageAFocus])

  return (
    <div className='h-full flex flex-col'>
      {!listeSelectionnee && (
        <ListeListesDeDiffusion
          ref={listesDiffusionRef}
          listesDeDiffusion={listesDeDiffusion}
          onAfficherListe={setListeSelectionnee}
          onBack={onBack}
        />
      )}

      {listeSelectionnee && !messageSelectionne && (
        <MessagesListeDeDiffusion
          ref={messagesListeRef}
          liste={listeSelectionnee}
          onAfficherDetailMessage={setMessageSelectionne}
          onBack={fermerListe}
        />
      )}

      {listeSelectionnee && messageSelectionne && (
        <DetailMessageListeDeDiffusion
          message={messageSelectionne}
          onBack={fermerMessage}
          chats={chats}
        />
      )}
    </div>
  )
}
