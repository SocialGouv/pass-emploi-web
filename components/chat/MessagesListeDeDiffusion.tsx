import { DateTime } from 'luxon'
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import DisplayMessageListeDeDiffusion from 'components/chat/DisplayMessageListeDeDiffusion'
import HeaderChat from 'components/chat/HeaderChat'
import { MessagerieCachee } from 'components/chat/MessagerieCachee'
import EmptyState from 'components/EmptyState'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import SpinningLoader from 'components/ui/SpinningLoader'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { ByDay, MessageListeDiffusion, OfDay } from 'interfaces/message'
import { getMessagesListeDeDiffusion } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { dateIsToday, toShortDate } from 'utils/date'

type MessagesListeDeDiffusionProps = {
  liste: ListeDeDiffusion
  onAfficherDetailMessage: (message: MessageListeDiffusion) => void
  onBack: () => void
  messagerieFullScreen?: boolean
}
function MessagesListeDeDiffusion(
  {
    liste,
    onAfficherDetailMessage,
    onBack,
    messagerieFullScreen,
  }: MessagesListeDeDiffusionProps,
  ref: ForwardedRef<{
    focusRetour: () => void
    focusMessage: (id: string) => void
  }>
) {
  useImperativeHandle(ref, () => ({
    focusRetour: () => headerRef.current!.focusRetour(),
    focusMessage: setIdMessageAFocus,
  }))

  const chatCredentials = useChatCredentials()

  const isFirstRender = useRef<boolean>(true)
  const headerRef = useRef<{ focusRetour: () => void }>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ByDay<MessageListeDiffusion>>()
  const [messagerieEstVisible, setMessagerieEstVisible] =
    useState<boolean>(true)
  const [idMessageAFocus, setIdMessageAFocus] = useState<string | undefined>()

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

  useEffect(() => {
    if (messagerieEstVisible && messages && idMessageAFocus) {
      const buttonAFocus = containerRef.current!.querySelector<HTMLDivElement>(
        `#message-${idMessageAFocus} button`
      )
      buttonAFocus?.focus()
      setIdMessageAFocus(undefined)
    }
  }, [messagerieEstVisible, messages, idMessageAFocus])

  useEffect(() => {
    if (isFirstRender.current) return
    if (messagerieEstVisible) {
      containerRef.current!.setAttribute('tabIndex', '-1')
      containerRef.current!.focus()
    }
  }, [messagerieEstVisible])

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  return (
    <>
      <HeaderChat
        ref={headerRef}
        titre={liste.titre}
        labelRetour='Retour à mes listes de diffusion'
        onBack={onBack}
        onPermuterVisibiliteMessagerie={permuterVisibiliteMessagerie}
        messagerieFullScreen={messagerieFullScreen}
        messagerieEstVisible={messagerieEstVisible}
      />

      {messagerieEstVisible && (
        <>
          <div className='hidden layout-s:block w-fit ml-4 mb-8'>
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

          <div ref={containerRef}>
            {!messages && <SpinningLoader />}

            {messages && messages.days.length === 0 && (
              <div className='bg-grey-100 flex flex-col justify-center items-center'>
                <EmptyState
                  illustrationName={IllustrationName.Send}
                  titre='Vous n’avez envoyé aucun message à cette liste de diffusion'
                />
              </div>
            )}

            {messages && messages.days.length > 0 && (
              <>
                <span className='sr-only' id='description-messages'>
                  Messages envoyés à la liste de diffusion
                </span>
                <ul
                  className='h-full min-h-0 p-4 overflow-y-auto'
                  aria-describedby='description-messages'
                >
                  {messages.days.map(
                    (messagesOfADay: OfDay<MessageListeDiffusion>, i) => (
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
                                id={`message-${message.id}`}
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
          </div>
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
export default forwardRef(MessagesListeDeDiffusion)
