'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useEffect, useState } from 'react'

import ConversationImage from 'assets/images/conversation.svg'
import Conversation from 'components/chat/Conversation'
import { DetailMessageListeDeDiffusion } from 'components/chat/DetailMessageListeDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { MessageListeDiffusion } from 'interfaces/message'
import { getConseillersDuJeuneClientSide } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useChats } from 'utils/chat/chatsContext'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useListeDeDiffusionSelectionnee } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { useShowRubriqueListeDeDiffusion } from 'utils/chat/showRubriqueListeDeDiffusionContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

function MessageriePage() {
  const [portefeuille] = usePortefeuille()
  const [idCurrentJeune, setIdCurrentJeune] = useCurrentJeune()
  const chats = useChats()
  const [showRubriqueListesDeDiffusion] = useShowRubriqueListeDeDiffusion()
  const [listeSelectionnee, setListeSelectionnee] =
    useListeDeDiffusionSelectionnee()

  const [currentChat, setCurrentChat] = useState<JeuneChat | undefined>()
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  useEffect(() => {
    if (idCurrentJeune) {
      getConseillersDuJeuneClientSide(idCurrentJeune).then(
        (conseillersJeunes) => setConseillers(conseillersJeunes)
      )

      if (chats) {
        setCurrentChat(chats.find((chat) => chat.id === idCurrentJeune))
      }
    } else {
      setCurrentChat(undefined)
    }
  }, [idCurrentJeune, chats])

  useMatomo('Messagerie', aDesBeneficiaires)

  return (
    <>
      {!showRubriqueListesDeDiffusion && (
        <>
          {!currentChat && (
            <div className='flex flex-col justify-center items-center h-full'>
              <ConversationImage focusable={false} aria-hidden={true} />
              <p className='mt-4 text-base-medium w-2/3 text-center'>
                Bienvenue dans votre espace de messagerie.
              </p>
            </div>
          )}

          {currentChat && (
            <div className='px-6 bg-grey_100 h-full min-h-0'>
              <Conversation
                onBack={() => setIdCurrentJeune(undefined)}
                jeuneChat={currentChat}
                conseillers={conseillers}
              />
            </div>
          )}
        </>
      )}

      {showRubriqueListesDeDiffusion && (
        <>
          {!listeSelectionnee && (
            <div className='flex flex-col justify-center items-center h-full'>
              <ConversationImage focusable={false} aria-hidden={true} />
              <p className='mt-4 text-base-medium w-2/3 text-center'>
                Veuillez sélectionner une liste de diffusion.
              </p>
            </div>
          )}

          {listeSelectionnee && (
            <div className='h-full min-h-0 px-6 flex flex-col overflow-y-auto'>
              {!messageSelectionne && (
                <>
                  <div className='items-center px-4 py-6 short:hidden pb-3 flex justify-between'>
                    <div>
                      <h2 className='text-l-bold text-primary text-center my-6 grow layout_s:text-left layout_s:p-0 layout_base:my-3'>
                        {listeSelectionnee.titre}
                      </h2>
                    </div>

                    <div className='hidden layout_s:block w-fit'>
                      <ButtonLink
                        href={
                          '/mes-jeunes/listes-de-diffusion/edition-liste?idListe=' +
                          listeSelectionnee.id
                        }
                        style={ButtonStyle.TERTIARY}
                        className='mr-auto'
                      >
                        <IconComponent
                          name={IconName.Edit}
                          focusable={false}
                          aria-hidden={true}
                          className='w-4 h-4 fill-primary mr-3'
                        />
                        Modifier ma liste
                      </ButtonLink>
                    </div>
                  </div>

                  <div className='flex flex-col justify-center h-full min-h-0'>
                    <MessagesListeDeDiffusion
                      liste={listeSelectionnee}
                      onAfficherDetailMessage={setMessageSelectionne}
                      onBack={() => setListeSelectionnee(undefined)}
                      messagerieFullScreen={true}
                    />
                  </div>
                </>
              )}

              {messageSelectionne && (
                <>
                  <div className='items-center mx-4 py-6 mb-6 short:hidden'>
                    <div className='pb-3 flex items-center justify-between'>
                      <button
                        className='border-none rounded-full mr-2 flex items-center hover:text-primary'
                        aria-label={'Retour sur ma liste de diffusion'}
                        onClick={() => setMessageSelectionne(undefined)}
                      >
                        <IconComponent
                          name={IconName.ArrowBackward}
                          aria-hidden={true}
                          focusable={false}
                          className='w-5 h-5 fill-primary mr-3'
                        />
                        <span className='text-s-regular'>Retour</span>
                      </button>
                    </div>

                    <div className='flex'>
                      <h2 className='w-full text-left text-primary text-l-bold'>
                        Détail du message
                      </h2>
                    </div>
                  </div>

                  <DetailMessageListeDeDiffusion
                    message={messageSelectionne}
                    onBack={() => setMessageSelectionne(undefined)}
                    chats={chats}
                    messagerieFullScreen={true}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default withTransaction(MessageriePage.name, 'page')(MessageriePage)
