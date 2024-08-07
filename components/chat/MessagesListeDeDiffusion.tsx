import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import EmptyStateImage from 'assets/images/illustration-send-grey.svg'
import DisplayMessageListeDeDiffusion from 'components/chat/DisplayMessageListeDeDiffusion'
import HeaderChat from 'components/chat/HeaderChat'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { ByDay, MessageListeDiffusion } from 'interfaces/message'
import { getMessagesListeDeDiffusion } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { dateIsToday, toShortDate } from 'utils/date'

type MessagesListeDeDiffusionProps = {
  liste: ListeDeDiffusion
  onAfficherDetailMessage: (message: MessageListeDiffusion) => void
  onBack: () => void
  messagerieFullScreen?: boolean
}
export default function MessagesListeDeDiffusion({
  liste,
  onAfficherDetailMessage,
  onBack,
  messagerieFullScreen,
}: MessagesListeDeDiffusionProps) {
  const chatCredentials = useChatCredentials()

  const [messages, setMessages] = useState<ByDay<MessageListeDiffusion>[]>()
  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)

  function displayDate(date: DateTime) {
    return dateIsToday(date) ? "Aujourd'hui" : `Le ${toShortDate(date)}`
  }

  function permuterVisibiliteMessagerie() {
    setMessagerieEstVisible(!messagerieEstVisible)
  }

  useEffect(() => {
    if (chatCredentials) {
      getMessagesListeDeDiffusion(
        liste.id,
        chatCredentials.cleChiffrement
      ).then(setMessages)
    }
  }, [chatCredentials, liste.id])

  return (
    <>
      {!messagerieFullScreen && (
        <>
          <HeaderChat
            titre={liste.titre}
            labelRetour={'Retour à mes listes de diffusion'}
            onBack={onBack}
            onPermuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
            messagerieEstVisible={messagerieEstVisible}
          />

          {messagerieEstVisible && (
            <div className='hidden layout_s:block w-fit ml-4 mb-8'>
              <ButtonLink
                href={`/mes-jeunes/listes-de-diffusion/edition-liste?idListe=${liste.id}`}
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
          )}
        </>
      )}

      {messagerieEstVisible && (
        <>
          {!messages && <SpinningLoader />}

          {messages && messages.length === 0 && (
            <div className='flex flex-col justify-center items-center'>
              <EmptyStateImage
                focusable={false}
                aria-hidden={true}
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
                className='h-full min-h-0 p-4 overflow-y-auto'
                aria-describedby='description-messages'
              >
                {messages.map(
                  (messagesOfADay: ByDay<MessageListeDiffusion>, i) => (
                    <li
                      key={messagesOfADay.date.toMillis() + i}
                      className='mb-5'
                    >
                      <div
                        className='text-base-regular text-center mb-3'
                        id={'date-messages-' + messagesOfADay.date.toMillis()}
                      >
                        {displayDate(messagesOfADay.date)}
                      </div>

                      <ul
                        aria-describedby={
                          'date-messages-' + messagesOfADay.date.toMillis()
                        }
                      >
                        {messagesOfADay.messages.map((message, j) => (
                          <li
                            key={message.id + i + j}
                            className={`mb-4 ${messagerieFullScreen ? '' : 'px-4'}`}
                            ref={(e) =>
                              e?.scrollIntoView({
                                block: 'nearest',
                                inline: 'nearest',
                              })
                            }
                          >
                            <DisplayMessageListeDeDiffusion
                              message={message}
                              onAfficherDetailMessage={() =>
                                onAfficherDetailMessage(message)
                              }
                              messagerieFullScreen={messagerieFullScreen}
                            />
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                )}
              </ul>
            </>
          )}
        </>
      )}

      {!messagerieEstVisible && (
        <MessagerieCachee
          permuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        />
      )}
    </>
  )
}
