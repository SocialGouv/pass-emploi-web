import React from 'react'

import Dot from 'components/ui/Dot'
import IconCheckbox from 'components/ui/IconCheckbox'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { UserType } from 'interfaces/conseiller'
import { JeuneChat } from 'interfaces/jeune'
import { formatDayAndHourDate } from 'utils/date'

interface ChatRoomTileProps {
  id: string
  jeuneChat: JeuneChat
  onClick: () => void
  onToggleFlag: (flagged: boolean) => void
}

function isLastMessageSeenByJeune(jeuneChat: JeuneChat): boolean {
  if (!jeuneChat.lastJeuneReading) return false
  return jeuneChat.lastMessageSentAt! < jeuneChat.lastJeuneReading
}

export function ChatRoomTile({
  id,
  jeuneChat,
  onClick,
  onToggleFlag,
}: ChatRoomTileProps) {
  function toggleFollowMessage() {
    onToggleFlag(!jeuneChat.flaggedByConseiller)
  }

  return (
    <div className='relative'>
      <button
        className='w-full p-3 flex flex-col text-left border-none bg-blanc rounded-[6px]'
        onClick={onClick}
      >
        {jeuneChat.lastMessageSentBy === 'jeune' &&
          !jeuneChat.seenByConseiller && (
            <p className='text-accent_1 text-s-regular mb-2'>
              <Dot color='accent_1' className='ml-1 mr-2' />
              Nouveau(x) message(s)
            </p>
          )}
        <span className='text-base-medium text-primary_darken mb-2 w-full flex justify-between'>
          {jeuneChat.prenom} {jeuneChat.nom}
        </span>
        <span className='text-s-regular text-grey_800 mb-[8px]'>
          {' '}
          {jeuneChat.lastMessageSentBy === UserType.CONSEILLER.toLowerCase()
            ? 'Vous'
            : jeuneChat.prenom}{' '}
          : {jeuneChat.lastMessageContent}
        </span>
        <span className='text-xs-regular text-content_color self-end'>
          {jeuneChat.lastMessageContent &&
            formatDayAndHourDate(jeuneChat.lastMessageSentAt!)}{' '}
          {jeuneChat.lastMessageSentBy === 'conseiller' && (
            <>
              <Dot color='grey_700' />{' '}
              {isLastMessageSeenByJeune(jeuneChat) && (
                <span>
                  Lu{' '}
                  <IconComponent
                    name={IconName.RoundedCheckFilled}
                    focusable={false}
                    aria-hidden={true}
                    className='inline w-3 h-3 fill-primary'
                  />
                </span>
              )}
              {!isLastMessageSeenByJeune(jeuneChat) && (
                <span>
                  Non lu{' '}
                  <IconComponent
                    name={IconName.RoundedCheck}
                    focusable={false}
                    aria-hidden={true}
                    className='inline w-3 h-3 fill-primary'
                  />
                </span>
              )}
            </>
          )}
        </span>
      </button>
      <IconCheckbox
        id={`${id}--flag`}
        checked={jeuneChat.flaggedByConseiller}
        checkedIconName={IconName.FlagFilled}
        uncheckedIconName={IconName.Flag}
        checkedLabel='Ne plus suivre la conversation'
        uncheckedLabel='Suivre la conversation'
        onChange={toggleFollowMessage}
        className='absolute top-3 right-3 w-4 h-4 fill-primary'
      />
    </div>
  )
}
