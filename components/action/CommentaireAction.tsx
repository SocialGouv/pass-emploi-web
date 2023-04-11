import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Commentaire } from 'interfaces/action'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'

interface CommentaireActionProps {
  commentaire: Commentaire
  idConseiller: string | undefined
}

export function CommentaireAction({
  commentaire,
  idConseiller,
}: CommentaireActionProps) {
  const commentaireDateTime: string = useMemo(
    () => toFrenchFormat(DateTime.fromISO(commentaire.date), DATETIME_LONG),
    [commentaire.date]
  )
  return (
    <>
      <dt className='flex items-center pb-2'>
        {commentaire.createur.id !== idConseiller && (
          <IconComponent
            name={IconName.AccountCircleFill}
            aria-hidden={true}
            focusable={false}
            className='w-4 h-4 mr-2 inline'
          />
        )}
        <span className='text-base-bold mr-2 capitalize'>
          {commentaire.createur.id === idConseiller
            ? 'vous'
            : `${commentaire.createur.prenom} ${commentaire.createur.nom}`}
        </span>
        <span className='mr-2'>·</span>
        <span>{commentaireDateTime}</span>
      </dt>
      <dd className='pb-8 block'>{commentaire.message}</dd>
    </>
  )
}
