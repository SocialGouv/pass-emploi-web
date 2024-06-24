import React from 'react'

import Dot from 'components/ui/Dot'
import IconCheckbox from 'components/ui/Form/IconCheckbox'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import { UserType } from 'interfaces/conseiller'
import { BeneficiaireChat } from 'interfaces/beneficiaire'
import { toRelativeDateTime } from 'utils/date'

interface ConversationTileProps {
  id: string
  jeuneChat: BeneficiaireChat
  onClick: () => void
  onToggleFlag: (flagged: boolean) => void
}

export function ConversationTile({
  id,
  jeuneChat,
  onClick,
  onToggleFlag,
}: ConversationTileProps) {
  const lastMessageSentAt: string | undefined =
    jeuneChat.lastMessageSentAt &&
    toRelativeDateTime(jeuneChat.lastMessageSentAt)

  const isLastMessageSeenByJeune = checkIfLastMessageSeenByJeune()

  function checkIfLastMessageSeenByJeune(): boolean | undefined {
    if (!jeuneChat.lastMessageSentAt) return
    if (!jeuneChat.lastJeuneReading) return false
    return jeuneChat.lastMessageSentAt < jeuneChat.lastJeuneReading
  }

  function toggleFollowMessage() {
    onToggleFlag(!jeuneChat.flaggedByConseiller)
  }

  return (
    <div className='relative'>
      <button
        className='w-full p-3 flex flex-col text-left border-none bg-white rounded-base'
        aria-label={`Consulter vos messages avec ${jeuneChat.prenom} ${jeuneChat.nom}`}
        onClick={onClick}
        type='button'
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
                <>
                  <span>Non lu </span>
                  <Badge
                    count={jeuneChat.newConseillerMessageCount}
                    textColor='accent_1'
                    bgColor='accent_1_lighten'
                    size={6}
                  />
                </>
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
        className='absolute top-3 right-3 w-5 h-5 fill-primary'
      />
    </div>
  )
}
