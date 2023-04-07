import React, { useMemo } from 'react'

import Dot from 'components/ui/Dot'
import IconCheckbox from 'components/ui/Form/IconCheckbox'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import { UserType } from 'interfaces/conseiller'
import { JeuneChat } from 'interfaces/jeune'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'

interface ConversationTileProps {
  id: string
  jeuneChat: JeuneChat
  onClick: () => void
  onToggleFlag: (flagged: boolean) => void
}

export function ConversationTile({
  id,
  jeuneChat,
  onClick,
  onToggleFlag,
}: ConversationTileProps) {
  const lastMessageSentAt: string | undefined = useMemo(
    () =>
      jeuneChat.lastMessageSentAt &&
      toFrenchFormat(jeuneChat.lastMessageSentAt, `'le' ${DATETIME_LONG}`),
    [jeuneChat.lastMessageSentAt]
  )
  const isLastMessageSeenByJeune: boolean | undefined = useMemo(() => {
    if (!jeuneChat.lastMessageSentAt) return
    if (!jeuneChat.lastJeuneReading) return false
    return jeuneChat.lastMessageSentAt < jeuneChat.lastJeuneReading
  }, [jeuneChat.lastJeuneReading, jeuneChat.lastMessageSentAt])

  function toggleFollowMessage() {
    onToggleFlag(!jeuneChat.flaggedByConseiller)
  }

  return (
    <div className='relative'>
      <button
        className='w-full p-3 flex flex-col text-left border-none bg-blanc rounded-base'
        onClick={onClick}
      >
        {!jeuneChat.seenByConseiller && (
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
          {lastMessageSentAt}{' '}
          {jeuneChat.lastMessageSentBy === 'conseiller' && (
            <>
              <Dot color='grey_700' />{' '}
              {isLastMessageSeenByJeune && (
                <span>
                  Lu{' '}
                  <IconComponent
                    name={IconName.CheckCircleFill}
                    focusable={false}
                    aria-hidden={true}
                    className='inline w-3 h-3 fill-primary'
                  />
                </span>
              )}
              {!isLastMessageSeenByJeune && (
                <span>
                  Non lu{' '}
                  <Badge
                    count={jeuneChat.newConseillerMessageCount}
                    textColor='accent_1'
                    bgColor='accent_1_lighten'
                    size={6}
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
        checkedIconName={IconName.BookmarkFill}
        uncheckedIconName={IconName.BookmarkOutline}
        checkedLabel='Ne plus suivre la conversation'
        uncheckedLabel='Suivre la conversation'
        onChange={toggleFollowMessage}
        className='absolute top-3 right-3 w-4 h-4 fill-primary'
      />
    </div>
  )
}
