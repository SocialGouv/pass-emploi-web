import React from 'react'

import { CommentaireAction } from 'components/action/CommentaireAction'
import { Commentaire } from 'interfaces/action'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface CommentairesActionProps {
  commentairesInitiaux: Commentaire[]
}

export function CommentairesAction({
  commentairesInitiaux,
}: CommentairesActionProps) {
  const [conseiller] = useConseiller()

  return (
    <div className='border-t border-solid border-grey_100 pt-5'>
      <h2 className='text-m-bold text-grey_800 pb-6'>Commentaires</h2>
      <div className='flex flex-col w-full'>
        <dl>
          {commentairesInitiaux.map((commentaire) => (
            <CommentaireAction
              key={commentaire.id}
              commentaire={commentaire}
              idConseiller={conseiller.id}
            />
          ))}
        </dl>
      </div>
    </div>
  )
}
