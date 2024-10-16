import React, { useEffect, useRef, useState } from 'react'

import DetailMessageListeDeDiffusion from 'components/chat/DetailMessageListeDeDiffusion'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'
import { useListeDeDiffusionSelectionnee } from 'utils/chat/listeDeDiffusionSelectionneeContext'

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
  const listeListesDiffusionRef = useRef<{
    focusRetour: () => void
    focusListe: (id: string) => void
  }>(null)
  const messagesListeRef = useRef<{
    focusRetour: () => void
    focusMessage: (id: string) => void
  }>(null)
  const messageRef = useRef<{ focusRetour: () => void }>(null)

  const [listeSelectionnee, setListeSelectionnee] =
    useListeDeDiffusionSelectionnee()
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()
  const [idMessageAFocus, setIdMessageAFocus] = useState<string | undefined>()

  function fermerMessage() {
    setIdMessageAFocus(messageSelectionne!.id)
    setMessageSelectionne(undefined)
  }

  useEffect(() => {
    if (listeSelectionnee.liste) messagesListeRef.current!.focusRetour()
    if (!listeSelectionnee.liste && listeSelectionnee.idAFocus) {
      listeListesDiffusionRef.current!.focusListe(listeSelectionnee.idAFocus)
      setListeSelectionnee({})
    }
    if (!listeSelectionnee.liste && !listeSelectionnee.idAFocus)
      listeListesDiffusionRef.current!.focusRetour()
  }, [listeSelectionnee.liste])

  useEffect(() => {
    if (messageSelectionne) messageRef.current!.focusRetour()
    if (!messageSelectionne && idMessageAFocus) {
      messagesListeRef.current!.focusMessage(idMessageAFocus)
      setIdMessageAFocus(undefined)
    }
  }, [messageSelectionne])

  return (
    <div className='h-full flex flex-col'>
      {!listeSelectionnee.liste && (
        <ListeListesDeDiffusion
          ref={listeListesDiffusionRef}
          listesDeDiffusion={listesDeDiffusion}
          onAfficherListe={(liste) => setListeSelectionnee({ liste })}
          onBack={onBack}
        />
      )}

      {listeSelectionnee.liste && !messageSelectionne && (
        <MessagesListeDeDiffusion
          ref={messagesListeRef}
          liste={listeSelectionnee.liste}
          onAfficherDetailMessage={setMessageSelectionne}
          onBack={() => {
            setListeSelectionnee({
              liste: undefined,
              idAFocus: listeSelectionnee.liste!.id,
            })
          }}
        />
      )}

      {listeSelectionnee.liste && messageSelectionne && (
        <DetailMessageListeDeDiffusion
          ref={messageRef}
          message={messageSelectionne}
          onBack={fermerMessage}
          chats={chats}
        />
      )}
    </div>
  )
}
