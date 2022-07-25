import Link from 'next/link'
import React from 'react'

import MessageGroupeIcon from 'assets/icons/forward_to_inbox.svg'
import EmptyStateImage from 'assets/images/empty_state.svg'
import { ChatRoomTile } from 'components/chat/ChatRoomTile'
import { JeuneChat } from 'interfaces/jeune'
import linkStyle from 'styles/components/Link.module.css'

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
          <p className='mt-4 text-md-semi w-2/3 text-center'>
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
          {/*FIXME : use <ButtonLink/> but causes problem with tailwind and style order*/}

          <Link href={'/mes-jeunes/envoi-message-groupe'}>
            <a
              className={`absolute bottom-8 self-center ${linkStyle.linkButtonBlue}`}
            >
              <MessageGroupeIcon
                aria-hidden='true'
                focusable='false'
                className='mr-2'
              />
              Message multi-destinataires
            </a>
          </Link>
        </>
      )}
    </>
  )
}
