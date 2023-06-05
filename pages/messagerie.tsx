import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useEffect, useRef, useState } from 'react'

import ConversationImage from 'assets/images/conversation.svg'
import Conversation from 'components/chat/Conversation'
import { DetailMessageListeDeDiffusion } from 'components/chat/DetailMessageListeDeDiffusion'
import MessagesListeDeDiffusion from 'components/chat/MessagesListeDeDiffusion'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  compareJeuneChat,
  ConseillerHistorique,
  JeuneChat,
} from 'interfaces/jeune'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'
import { PageProps } from 'interfaces/pageProps'
import { getConseillersDuJeuneClientSide } from 'services/jeunes.service'
import { getListesDeDiffusionClientSide } from 'services/listes-de-diffusion.service'
import { observeConseillerChats } from 'services/messages.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useListeDeDiffusionSelectionnee } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { useShowRubriqueListeDeDiffusion } from 'utils/chat/showRubriqueListeDeDiffusionContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

function Messagerie(_: PageProps) {
  const trackingTitle = 'Messagerie'
  const [idCurrentJeune, setIdCurrentJeune] = useCurrentJeune()
  const [currentChat, setCurrentChat] = useState<JeuneChat | undefined>(
    undefined
  )

  const [portefeuille] = usePortefeuille()
  const [chatCredentials] = useChatCredentials()
  const [showRubriqueListesDeDiffusion] = useShowRubriqueListeDeDiffusion()
  const [listeSelectionnee, setListeSelectionnee] =
    useListeDeDiffusionSelectionnee()
  const destructorRef = useRef<() => void>(() => undefined)

  const [chats, setChats] = useState<JeuneChat[]>()
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])
  const [listesDeDiffusion, setListesDeDiffusion] =
    useState<ListeDeDiffusion[]>()
  const [messageSelectionne, setMessageSelectionne] = useState<
    MessageListeDiffusion | undefined
  >()

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  useEffect(() => {
    if (showRubriqueListesDeDiffusion && !listesDeDiffusion) {
      getListesDeDiffusionClientSide().then(setListesDeDiffusion)
    }
  }, [listesDeDiffusion, showRubriqueListesDeDiffusion])

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

  useEffect(() => {
    if (!chatCredentials || !portefeuille) return

    observeConseillerChats(
      chatCredentials.cleChiffrement,
      portefeuille,
      updateChats
    ).then((destructor) => (destructorRef.current = destructor))

    return () => destructorRef.current()

    function updateChats(updatedChats: JeuneChat[]) {
      setChats([...updatedChats].sort(compareJeuneChat))
    }
  }, [portefeuille, chatCredentials])

  useMatomo(trackingTitle, aDesBeneficiaires)

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
            <div className='px-6 bg-grey_100 h-full'>
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
            <>
              <div className='flex flex-col justify-center items-center h-full'>
                <ConversationImage focusable={false} aria-hidden={true} />
                <p className='mt-4 text-base-medium w-2/3 text-center'>
                  Veuillez sélectionner une liste de diffusion.
                </p>
              </div>
            </>
          )}
          {listeSelectionnee && (
            <>
              <div className='h-full px-6'>
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

                    <div className='flex flex-col justify-center overflow-y-auto'>
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
                    <div className=' items-center mx-4 py-6 mb-6 short:hidden'>
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
            </>
          )}
        </>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const {
    session: { user },
  } = sessionOrRedirect

  if (user.structure === StructureConseiller.MILO) {
    return { notFound: true }
  }

  const props: PageProps = {
    pageTitle: 'Messagerie',
  }

  return { props }
}

export default withTransaction(Messagerie.name, 'page')(Messagerie)
