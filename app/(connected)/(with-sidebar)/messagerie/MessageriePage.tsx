'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useEffect, useRef, useState } from 'react'

import ImageConversation from 'assets/images/conversation.svg'
import ConversationBeneficiaire from 'components/chat/ConversationBeneficiaire'
import DetailMessageListe from 'components/chat/DetailMessageListe'
import MessagesListe from 'components/chat/MessagesListe'
import { ConseillerHistorique } from 'interfaces/beneficiaire'
import { MessageListe } from 'interfaces/message'
import { getConseillersDuJeuneClientSide } from 'services/beneficiaires.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useChats } from 'utils/chat/chatsContext'
import { useCurrentConversation } from 'utils/chat/currentConversationContext'
import { useListeSelectionnee } from 'utils/chat/listeSelectionneeContext'
import { useShowRubriqueListe } from 'utils/chat/showRubriqueListeContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

function MessageriePage() {
  const [portefeuille] = usePortefeuille()
  const chats = useChats()
  const [currentConversation, setCurrentConversation] = useCurrentConversation()

  const messagesListeRef = useRef<{
    focusRetour: () => void
    focusMessage: (id: string) => void
  }>(null)
  const detailMessageRef = useRef<{
    focusRetour: () => void
  }>(null)

  const [showRubriqueListes] = useShowRubriqueListe()
  const [listeSelectionnee, setListeSelectionnee] = useListeSelectionnee()

  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListe | undefined
  >()
  const [idMessageAFocus, setIdMessageAFocus] = useState<string | undefined>()

  useEffect(() => {
    if (
      currentConversation &&
      !listeSelectionnee.liste &&
      !showRubriqueListes
    ) {
      getConseillersDuJeuneClientSide(currentConversation.id).then(
        (conseillersJeunes) => setConseillers(conseillersJeunes)
      )
    }
  }, [currentConversation, chats])

  useEffect(() => {
    if (listeSelectionnee.liste) messagesListeRef.current!.focusRetour()
  }, [listeSelectionnee.liste])

  useEffect(() => {
    if (messageSelectionne) detailMessageRef.current!.focusRetour()
    if (!messageSelectionne && idMessageAFocus) {
      messagesListeRef.current!.focusMessage(idMessageAFocus)
      setIdMessageAFocus(undefined)
    }
  }, [messageSelectionne])

  useMatomo('Messagerie', portefeuille.length > 0)

  return (
    <>
      {!showRubriqueListes && (
        <>
          {!currentConversation && (
            <div className='flex flex-col justify-center items-center h-full'>
              <ImageConversation focusable={false} aria-hidden={true} />
              <p className='mt-4 text-base-medium w-2/3 text-center'>
                Bienvenue dans votre espace de messagerie.
              </p>
            </div>
          )}

          {currentConversation && (
            <div className='px-6 bg-grey-100 h-full min-h-0'>
              <ConversationBeneficiaire
                onBack={() => {
                  document
                    .getElementById('chat-' + currentConversation.id)
                    ?.focus()
                  setCurrentConversation(undefined)
                }}
                beneficiaireChat={currentConversation}
                conseillers={conseillers}
              />
            </div>
          )}
        </>
      )}

      {showRubriqueListes && (
        <>
          {!listeSelectionnee.liste && (
            <div className='flex flex-col justify-center items-center h-full'>
              <ImageConversation focusable={false} aria-hidden={true} />
              <p className='mt-4 text-base-medium w-2/3 text-center'>
                Veuillez sélectionner une liste.
              </p>
            </div>
          )}

          {listeSelectionnee.liste && (
            <div className='h-full min-h-0 px-6 flex flex-col overflow-y-auto'>
              {!messageSelectionne && (
                <MessagesListe
                  ref={messagesListeRef}
                  liste={listeSelectionnee.liste}
                  onAfficherDetailMessage={setMessageSelectionne}
                  onBack={() =>
                    setListeSelectionnee({
                      liste: undefined,
                      idAFocus: listeSelectionnee.liste!.id,
                    })
                  }
                  messagerieFullScreen={true}
                />
              )}

              {messageSelectionne && (
                <DetailMessageListe
                  ref={detailMessageRef}
                  message={messageSelectionne}
                  onBack={() => {
                    setIdMessageAFocus(messageSelectionne.id)
                    setMessageSelectionne(undefined)
                  }}
                  chats={chats}
                  messagerieFullScreen={true}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default withTransaction(MessageriePage.name, 'page')(MessageriePage)
