import React, { ForwardedRef, forwardRef } from 'react'

import MessageGroupeIcon from 'assets/icons/actions/outgoing_mail.svg'
import { ConversationTile } from 'components/chat/ConversationTile'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import SpinningLoader from 'components/ui/SpinningLoader'
import { BeneficiaireChat } from 'interfaces/beneficiaire'

interface ListeConversationsProps {
  conversations: BeneficiaireChat[] | undefined
  onToggleFlag: (idChat: string, flagged: boolean) => void
  onSelectConversation: (idChat: string) => void
}

function ListeConversations(
  {
    conversations,
    onSelectConversation,
    onToggleFlag,
  }: ListeConversationsProps,
  ref: ForwardedRef<HTMLUListElement>
) {
  return (
    <>
      <div
        aria-live='polite'
        aria-busy={!conversations}
        className='relative h-full overflow-y-auto'
      >
        {!conversations && <SpinningLoader />}

        {conversations?.length === 0 && (
          <>
            <div className='flex flex-col justify-center items-center'>
              <IllustrationComponent
                name={IllustrationName.Messagerie}
                focusable={false}
                aria-hidden={true}
                className='w-[360px] h-[200px] fill-primary [--secondary-fill:theme(colors.white)]'
              />
              <div className='mx-4'>
                <p className='text-base-bold'>Vous pouvez échanger :</p>
                <ul className='list-disc mt-2 mx-4'>
                  <li>directement avec un bénéficiaire</li>
                  <li>
                    en envoyant un message à plusieurs bénéficiaires
                    simultanément
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {conversations && conversations.length > 0 && (
          <ul tabIndex={-1} ref={ref} className='px-4 pb-24'>
            {conversations.map((beneficiaireChat: BeneficiaireChat) => (
              <li key={`chat-${beneficiaireChat.id}`} className='mb-2'>
                <ConversationTile
                  beneficiaireChat={beneficiaireChat}
                  id={`chat-${beneficiaireChat.id}`}
                  onClick={() => onSelectConversation(beneficiaireChat.id)}
                  onToggleFlag={(flagged) =>
                    onToggleFlag(beneficiaireChat.chatId, flagged)
                  }
                />
              </li>
            ))}
          </ul>
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
            aria-hidden={true}
            focusable={false}
            className='w-4 shrink-0 mr-2'
          />
          Message multi-destinataires
        </ButtonLink>
      )}
    </>
  )
}

export default forwardRef(ListeConversations)
