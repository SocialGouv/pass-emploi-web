import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useEffect, useRef, useState } from 'react'

import ConversationImage from 'assets/images/conversation.svg'
import Conversation from 'components/chat/Conversation'
import { estMilo, estUserPoleEmploi } from 'interfaces/conseiller'
import {
  compareJeuneChat,
  ConseillerHistorique,
  JeuneChat,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import { usePortefeuille } from 'utils/portefeuilleContext'

function Messagerie(_: PageProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const messagesService = useDependance<MessagesService>('messagesService')

  const trackingTitle = 'Messagerie'
  const [idCurrentJeune, setIdCurrentJeune] = useCurrentJeune()
  const [currentChat, setCurrentChat] = useState<JeuneChat | undefined>(
    undefined
  )

  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [chatCredentials, setChatCredentials] = useChatCredentials()
  const destructorRef = useRef<() => void>(() => undefined)

  const [chats, setChats] = useState<JeuneChat[]>()
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])

  function hasMessageNonLu(updatedChats: JeuneChat[]): boolean {
    return updatedChats.some(
      (chat) => !chat.seenByConseiller && chat.lastMessageContent
    )
  }

  function aUnNouveauMessage(previousChat: JeuneChat, updatedChat: JeuneChat) {
    return (
      previousChat.lastMessageContent !== updatedChat.lastMessageContent &&
      updatedChat.lastMessageSentBy === 'jeune'
    )
  }

  useEffect(() => {
    if (idCurrentJeune) {
      jeunesService
        .getConseillersDuJeuneClientSide(idCurrentJeune)
        .then((conseillersJeunes) => setConseillers(conseillersJeunes))

      if (chats) {
        setCurrentChat(chats.find((chat) => chat.id === idCurrentJeune))
      }
    } else {
      setCurrentChat(undefined)
    }
  }, [jeunesService, idCurrentJeune, chats])

  useEffect(() => {
    if (!chatCredentials) {
      messagesService
        .getChatCredentials()
        .then((credentials) =>
          messagesService.signIn(credentials.token).then(() => credentials)
        )
        .then(setChatCredentials)
    }
  }, [chatCredentials])

  useEffect(() => {
    if (!chatCredentials || !portefeuille) return

    messagesService
      .observeConseillerChats(
        chatCredentials.cleChiffrement,
        portefeuille,
        updateChats
      )
      .then((destructor) => (destructorRef.current = destructor))

    return () => destructorRef.current()

    function updateChats(updatedChats: JeuneChat[]) {
      setChats([...updatedChats].sort(compareJeuneChat))
    }
  }, [portefeuille, chatCredentials])

  useMatomo(trackingTitle)

  return (
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
        <Conversation
          onBack={() => setIdCurrentJeune(undefined)}
          jeuneChat={currentChat}
          conseillers={conseillers}
          pageEstMessagerie={true}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const {
    session: { user },
  } = sessionOrRedirect
  if (estMilo(user)) {
    return { notFound: true }
  }

  const props: PageProps = {
    pageTitle: 'Messagerie',
    pageHeader: 'Messagerie',
  }

  return { props }
}

export default withTransaction(Messagerie.name, 'page')(Messagerie)
