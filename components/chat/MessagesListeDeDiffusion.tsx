import React, { useEffect, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import DisplayMessageListeDeDiffusion from 'components/chat/DisplayMessageListeDeDiffusion'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { MessageListeDiffusion } from 'interfaces/message'
import { MessagesService } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useDependance } from 'utils/injectionDependances'

type MessagesListeDeDiffusionProps = {
  liste: ListeDeDiffusion
}
export default function MessagesListeDeDiffusion({
  liste,
}: MessagesListeDeDiffusionProps) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const [chatCredentials] = useChatCredentials()

  const [messages, setMessages] = useState<MessageListeDiffusion[]>()

  useEffect(() => {
    if (chatCredentials) {
      messagesService
        .getMessagesListeDeDiffusion(chatCredentials?.cleChiffrement, liste.id)
        .then(setMessages)
    }
  }, [chatCredentials, liste.id])

  return (
    <>
      {!messages && <SpinningLoader />}

      {messages && messages.length === 0 && (
        <div className='bg-grey_100 flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Vous n’avez envoyé aucun message à cette liste de diffusion
          </p>
        </div>
      )}

      {messages && messages.length > 0 && (
        <ul className='overflow-y-auto'>
          {messages.map((message) => (
            <DisplayMessageListeDeDiffusion
              key={message.id}
              message={message}
            ></DisplayMessageListeDeDiffusion>
          ))}
        </ul>
      )}
    </>
  )
}
