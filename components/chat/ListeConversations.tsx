import React from 'react'

import MessageGroupeIcon from 'assets/icons/actions/outgoing_mail.svg'
import EmptyStateImage from 'assets/images/illustration-messagerie.svg'
import { ConversationTile } from 'components/chat/ConversationTile'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { JeuneChat } from 'interfaces/jeune'

interface ListeConversationsProps {
  conversations: JeuneChat[] | undefined
  onToggleFlag: (idChat: string, flagged: boolean) => void
  onSelectConversation: (idChat: string) => void
}

export default function ListeConversations({
  conversations,
  onSelectConversation,
  onToggleFlag,
}: ListeConversationsProps) {
  return (
    <>
      <div
        aria-live='polite'
        aria-busy={!conversations}
        className='relative h-full overflow-y-auto'
      >
        {!conversations && <SpinningLoader />}

        {conversations && conversations.length === 0 && (
          <div className='bg-grey_100 flex flex-col justify-center items-center'>
            <EmptyStateImage
              focusable='false'
              aria-hidden='true'
              className='w-[360px] h-[200px]'
            />
            <p className='mt-4 text-base-medium w-2/3 text-center'>
              Vous devriez avoir des bénéficiaires inscrits pour discuter avec
              eux
            </p>
          </div>
        )}

        {conversations && conversations.length > 0 && (
          <>
            <ul className='px-4 pb-24'>
              {conversations.map((jeuneChat: JeuneChat) => (
                <li key={`chat-${jeuneChat.id}`} className='mb-2'>
                  <ConversationTile
                    jeuneChat={jeuneChat}
                    id={`chat-${jeuneChat.id}`}
                    onClick={() => onSelectConversation(jeuneChat.id)}
                    onToggleFlag={(flagged) =>
                      onToggleFlag(jeuneChat.chatId, flagged)
                    }
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {conversations && conversations.length > 0 && (
        <ButtonLink
          // FIXME : dirty fix, problème de rafraichissement des listes de diffusion
          href={'/mes-jeunes/envoi-message-groupe?misc=' + Math.random()}
          style={ButtonStyle.PRIMARY}
          className='absolute bottom-8 self-center'
        >
          <MessageGroupeIcon
            aria-hidden='true'
            focusable='false'
            className='w-4 shrink-0 mr-2'
          />
          Message multi-destinataires
        </ButtonLink>
      )}
    </>
  )
}
