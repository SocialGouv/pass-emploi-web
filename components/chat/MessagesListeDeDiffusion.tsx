import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import DisplayMessageListeDeDiffusion from 'components/chat/DisplayMessageListeDeDiffusion'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { ByDay, MessageListeDiffusion } from 'interfaces/message'
import { MessagesService } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { dateIsToday, toShortDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

type MessagesListeDeDiffusionProps = {
  liste: ListeDeDiffusion
  onAfficherDetailMessage: (message: MessageListeDiffusion) => void
}
export default function MessagesListeDeDiffusion({
  liste,
  onAfficherDetailMessage,
}: MessagesListeDeDiffusionProps) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const [chatCredentials] = useChatCredentials()

  const [messages, setMessages] = useState<ByDay<MessageListeDiffusion>[]>()

  function displayDate(date: DateTime) {
    return dateIsToday(date) ? "Aujourd'hui" : `Le ${toShortDate(date)}`
  }

  useEffect(() => {
    if (chatCredentials) {
      messagesService
        .getMessagesListeDeDiffusion(liste.id, chatCredentials.cleChiffrement)
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
        <>
          <span className='sr-only' id='description-messages'>
            Messages envoyés à la liste de diffusion
          </span>
          <ul
            className='overflow-y-auto'
            aria-describedby='description-messages'
          >
            {messages.map((messagesOfADay: ByDay<MessageListeDiffusion>) => (
              <li key={messagesOfADay.date.toMillis()} className='mb-5'>
                <div
                  className='text-base-regular text-center mb-3'
                  id={'date-messages-' + messagesOfADay.date.toMillis()}
                >
                  <span>{displayDate(messagesOfADay.date)}</span>
                </div>

                <ul
                  aria-describedby={
                    'date-messages-' + messagesOfADay.date.toMillis()
                  }
                >
                  {messagesOfADay.messages.map((message) => (
                    <DisplayMessageListeDeDiffusion
                      key={message.id}
                      message={message}
                      onAfficherDetailMessage={() =>
                        onAfficherDetailMessage(message)
                      }
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
