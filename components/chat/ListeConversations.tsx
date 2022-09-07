import React from 'react'

import MessageGroupeIcon from 'assets/icons/forward_to_inbox.svg'
import EmptyStateImage from 'assets/images/empty_state.svg'
import { ChatRoomTile } from 'components/chat/ChatRoomTile'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { JeuneChat } from 'interfaces/jeune'

interface ListeConversationsProps {
  conversations: JeuneChat[]
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
      {!conversations.length && (
        <div className='h-full overflow-y-auto bg-grey_100 flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Vous devriez avoir des jeunes inscrits pour discuter avec eux
          </p>
        </div>
      )}

      {conversations.length > 0 && (
        <>
          <ul className='h-full overflow-y-auto px-4 pb-24'>
            {conversations.map((jeuneChat: JeuneChat) => (
              <li key={`chat-${jeuneChat.id}`} className='mb-2'>
                <ChatRoomTile
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

          <ButtonLink
            href='/mes-jeunes/envoi-message-groupe'
            style={ButtonStyle.PRIMARY}
            className='absolute bottom-8 self-center'
          >
            <MessageGroupeIcon
              aria-hidden='true'
              focusable='false'
              className='shrink-0 mr-2'
            />
            Message multi-destinataires
          </ButtonLink>
        </>
      )}
    </>
  )
}
