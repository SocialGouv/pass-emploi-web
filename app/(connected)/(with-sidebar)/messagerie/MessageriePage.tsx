'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useEffect, useRef, useState } from 'react'

import ConversationImage from 'assets/images/conversation.svg'
import ConversationBeneficiaire from 'components/chat/ConversationBeneficiaire'
import DetailMessageListeDeDiffusion from 'components/chat/DetailMessageListeDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { ConseillerHistorique } from 'interfaces/beneficiaire'
import { MessageListeDiffusion } from 'interfaces/message'
import { getConseillersDuJeuneClientSide } from 'services/beneficiaires.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useChats } from 'utils/chat/chatsContext'
import { useCurrentConversation } from 'utils/chat/currentConversationContext'
import { useListeDeDiffusionSelectionnee } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { useShowRubriqueListeDeDiffusion } from 'utils/chat/showRubriqueListeDeDiffusionContext'
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

  const [showRubriqueListesDeDiffusion] = useShowRubriqueListeDeDiffusion()
  const [listeSelectionnee, setListeSelectionnee] =
    useListeDeDiffusionSelectionnee()

  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()
  const [idMessageAFocus, setIdMessageAFocus] = useState<string | undefined>()

  useEffect(() => {
    if (
      currentConversation &&
      !listeSelectionnee.liste &&
      !showRubriqueListesDeDiffusion
    ) {
      getConseillersDuJeuneClientSide(currentConversation.conversation.id).then(
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
      {!showRubriqueListesDeDiffusion && (
        <>
          {!currentConversation && (
            <div className='flex flex-col justify-center items-center h-full'>
              <ConversationImage focusable={false} aria-hidden={true} />
              <p className='mt-4 text-base-medium w-2/3 text-center'>
                Bienvenue dans votre espace de messagerie.
              </p>
            </div>
          )}

          {currentConversation && (
            <div className='px-6 bg-grey_100 h-full min-h-0'>
              <ConversationBeneficiaire
                onBack={() => {
                  document
                    .getElementById(
                      'chat-' + currentConversation.conversation.id
                    )
                    ?.focus()
                  setCurrentConversation(undefined)
                }}
                beneficiaireChat={currentConversation.conversation}
                shouldFocusOnFirstRender={true}
                conseillers={conseillers}
              />
            </div>
          )}
        </>
      )}

      {showRubriqueListesDeDiffusion && (
        <>
          {!listeSelectionnee.liste && (
            <div className='flex flex-col justify-center items-center h-full'>
              <ConversationImage focusable={false} aria-hidden={true} />
              <p className='mt-4 text-base-medium w-2/3 text-center'>
                Veuillez sélectionner une liste de diffusion.
              </p>
            </div>
          )}

          {listeSelectionnee.liste && (
            <div className='h-full min-h-0 px-6 flex flex-col overflow-y-auto'>
              {!messageSelectionne && (
                <MessagesListeDeDiffusion
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
                <DetailMessageListeDeDiffusion
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
