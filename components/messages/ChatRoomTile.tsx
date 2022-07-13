import React, { MouseEvent } from 'react'

import FbCheckIcon from '../../assets/icons/fb_check.svg'
import FbCheckFillIcon from '../../assets/icons/fb_check_fill.svg'
import { UserType } from '../../interfaces/conseiller'
import { JeuneChat } from '../../interfaces/jeune'
import { MessagesService } from '../../services/messages.service'
import { useCurrentJeune } from '../../utils/chat/currentJeuneContext'
import { formatDayAndHourDate } from '../../utils/date'
import { useDependance } from '../../utils/injectionDependances'
import IconComponent, { IconName } from '../ui/IconComponent'

interface ChatRoomTileProps {
  jeuneChat: JeuneChat
}

export function ChatRoomTile(props: ChatRoomTileProps) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const [, setIdCurrentJeune] = useCurrentJeune()

  return (
    <button
      className='w-full p-3 flex flex-col text-left border-none bg-blanc rounded-[6px]'
      onClick={() => setIdCurrentJeune(props.jeuneChat.id)}
    >
      <div className='w-full flex flex-row justify-between items-start'>
        <div>
          {!props.jeuneChat.seenByConseiller &&
            props.jeuneChat.lastMessageContent && (
              <p className='flex items-center text-accent_1 text-s-regular mb-2'>
                <span className='text-[48px] mr-1'>·</span>
                Nouveau message
              </p>
            )}
          <span className='text-md-semi text-primary_darken mb-2 w-full flex justify-between'>
            {props.jeuneChat.prenom} {props.jeuneChat.nom}
          </span>
        </div>
        <button
          type='button'
          aria-label={
            props.jeuneChat.flaggedByConseiller
              ? 'Ne plus suivre la conversation'
              : 'Suivre la conversation'
          }
          title={
            props.jeuneChat.flaggedByConseiller
              ? 'Ne plus suivre la conversation'
              : 'Suivre la conversation'
          }
          onClick={clickOnFlag}
        >
          <IconComponent
            name={
              props.jeuneChat.flaggedByConseiller
                ? IconName.FlagFilled
                : IconName.Flag
            }
            className='w-4 h-4 fill-primary'
          />
        </button>
      </div>
      <span className='text-sm text-grey_800 mb-[8px]'>
        {' '}
        {props.jeuneChat.lastMessageSentBy === UserType.CONSEILLER.toLowerCase()
          ? 'Vous'
          : props.jeuneChat.prenom}{' '}
        : {props.jeuneChat.lastMessageContent}
      </span>
      <span className='text-xxs-italic text-content_color self-end flex'>
        {props.jeuneChat.lastMessageContent && (
          <span className='mr-[7px]'>
            {formatDayAndHourDate(props.jeuneChat.lastMessageSentAt!)}{' '}
          </span>
        )}
        {(props.jeuneChat.seenByConseiller &&
          props.jeuneChat.lastMessageContent) ||
        !props.jeuneChat.isActivated ? (
          <FbCheckIcon focusable='false' aria-hidden='true' />
        ) : (
          <FbCheckFillIcon focusable='false' aria-hidden='true' />
        )}
      </span>
    </button>
  )

  function clickOnFlag(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    messagesService.toggleFlag(
      props.jeuneChat.chatId,
      !props.jeuneChat.flaggedByConseiller
    )
  }
}
