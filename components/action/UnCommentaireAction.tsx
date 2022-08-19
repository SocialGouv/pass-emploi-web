import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Commentaire } from 'interfaces/action'
import { formatDayHourDate } from 'utils/date'

interface UnCommentaireActionProps {
  commentaire: Commentaire
  idConseiller: string | undefined
}

export function UnCommentaireAction({
  commentaire,
  idConseiller,
}: UnCommentaireActionProps) {
  return (
    <>
      <div className='flex items-center pb-2'>
        {commentaire.createur.id !== idConseiller && (
          <IconComponent
            name={IconName.People}
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
        <span>{formatDayHourDate(commentaire.date)}</span>
      </div>
      <p role='term' className='pb-8'>
        {commentaire.message}
      </p>
    </>
  )
}
