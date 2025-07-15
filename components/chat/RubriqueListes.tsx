import React, { useEffect, useRef, useState } from 'react'

import DetailMessageListe from 'components/chat/DetailMessageListe'
import ListeListes from 'components/chat/ListeListes'
import MessagesListe from 'components/chat/MessagesListe'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import { MessageListe } from 'interfaces/message'
import { useListeSelectionnee } from 'utils/chat/listeSelectionneeContext'

type RubriqueListesProps = {
  listes: Liste[] | undefined
  chats: BeneficiaireEtChat[] | undefined
  onBack: () => void
}

export default function RubriqueListes({
  listes,
  chats,
  onBack,
}: RubriqueListesProps) {
  const listeListesRef = useRef<{
    focusRetour: () => void
    focusListe: (id: string) => void
  }>(null)
  const messagesListeRef = useRef<{
    focusRetour: () => void
    focusMessage: (id: string) => void
  }>(null)
  const messageRef = useRef<{ focusRetour: () => void }>(null)

  const [listeSelectionnee, setListeSelectionnee] = useListeSelectionnee()
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListe | undefined
  >()
  const [idMessageAFocus, setIdMessageAFocus] = useState<string | undefined>()

  function fermerMessage() {
    setIdMessageAFocus(messageSelectionne!.id)
    setMessageSelectionne(undefined)
  }

  useEffect(() => {
    if (listeSelectionnee.liste) messagesListeRef.current!.focusRetour()
    if (!listeSelectionnee.liste && listeSelectionnee.idAFocus) {
      listeListesRef.current!.focusListe(listeSelectionnee.idAFocus)
      setListeSelectionnee({})
    }
    if (!listeSelectionnee.liste && !listeSelectionnee.idAFocus)
      listeListesRef.current!.focusRetour()
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
        <ListeListes
          ref={listeListesRef}
          listes={listes}
          onAfficherListe={(liste) => setListeSelectionnee({ liste })}
          onBack={onBack}
        />
      )}

      {listeSelectionnee.liste && !messageSelectionne && (
        <MessagesListe
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
        <DetailMessageListe
          ref={messageRef}
          message={messageSelectionne}
          onBack={fermerMessage}
          chats={chats}
        />
      )}
    </div>
  )
}
