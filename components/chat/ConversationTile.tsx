import React from 'react'

import Dot from 'components/ui/Dot'
import IconToggle from 'components/ui/Form/IconToggle'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { UserType } from 'interfaces/conseiller'
import { toRelativeDateTime } from 'utils/date'

interface ConversationTileProps {
  id: string
  beneficiaireChat: BeneficiaireEtChat
  onClick: () => void
  onToggleFlag: (flagged: boolean) => void
}

export function ConversationTile({
  id,
  beneficiaireChat,
  onClick,
  onToggleFlag,
}: ConversationTileProps) {
  const lastMessageSentAt: string | undefined =
    beneficiaireChat.lastMessageSentAt &&
    toRelativeDateTime(beneficiaireChat.lastMessageSentAt)
  const beneficiaireFullname = `${beneficiaireChat.prenom} ${beneficiaireChat.nom}`

  const isLastMessageSeenByBeneficiaire = checkIfLastMessageSeenByBeneficiaire()

  function checkIfLastMessageSeenByBeneficiaire(): boolean | undefined {
    if (!beneficiaireChat.lastMessageSentAt) return
    if (!beneficiaireChat.lastJeuneReading) return false
    return (
      beneficiaireChat.lastMessageSentAt < beneficiaireChat.lastJeuneReading
    )
  }

  function toggleFollowMessage() {
    onToggleFlag(!beneficiaireChat.flaggedByConseiller)
  }

  return (
    <div className='relative'>
      <button
        id={id}
        className='w-full p-3 flex flex-col text-left border-none bg-white rounded-base'
        aria-label={`Consulter vos messages avec ${beneficiaireFullname}`}
        onClick={onClick}
        type='button'
      >
        {!beneficiaireChat.seenByConseiller && (
          <span className='text-accent_1 text-s-regular mb-2'>
            <Dot color='accent_1' className='ml-1 mr-2' />
            Nouveau(x) message(s)
          </span>
        )}
        <span className='text-base-medium text-primary_darken mb-2 w-full flex justify-between'>
          {beneficiaireFullname}
        </span>
        <span className='text-s-regular text-grey_800 mb-[8px]'>
          {' '}
          {beneficiaireChat.lastMessageSentBy ===
          UserType.CONSEILLER.toLowerCase()
            ? 'Vous'
            : beneficiaireChat.prenom}{' '}
          : {beneficiaireChat.lastMessageContent}
        </span>
        <span className='text-xs-regular text-content_color self-end'>
          {lastMessageSentAt}{' '}
          {beneficiaireChat.lastMessageSentBy === 'conseiller' && (
            <>
              <Dot color='grey_700' />{' '}
              {isLastMessageSeenByBeneficiaire && (
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
              {!isLastMessageSeenByBeneficiaire && (
                <>
                  <span>Non lu </span>
                  <Badge
                    count={beneficiaireChat.newConseillerMessageCount}
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

      <IconToggle
        id={`${id}--flag`}
        label={'Suivi de la conversation avec ' + beneficiaireFullname}
        checked={beneficiaireChat.flaggedByConseiller}
        checkedState={{
          iconName: IconName.BookmarkFill,
          actionTitle: 'Ne plus suivre la conversation',
        }}
        uncheckedState={{
          iconName: IconName.BookmarkOutline,
          actionTitle: 'Suivre la conversation',
        }}
        onToggle={toggleFollowMessage}
        className='absolute top-3 right-3 w-5 h-5 fill-primary hover:fill-primary_darken'
      />
    </div>
  )
}
