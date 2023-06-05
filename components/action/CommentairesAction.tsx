import React, { useRef, useState } from 'react'

import { CommentaireAction } from 'components/action/CommentaireAction'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Commentaire } from 'interfaces/action'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface CommentairesActionProps {
  idAction: string
  commentairesInitiaux: Commentaire[]
  lectureSeule: boolean
  onAjout: (estEnSucces: boolean) => void
}

export function CommentairesAction({
  idAction,
  commentairesInitiaux,
  lectureSeule,
  onAjout,
}: CommentairesActionProps) {
  const [commentaires, setCommentaires] =
    useState<Commentaire[]>(commentairesInitiaux)
  const [nouveauCommentaire, setNouveauCommentaire] = useState<string>('')
  const [conseiller] = useConseiller()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function ajouterUnCommentaire() {
    const { ajouterCommentaire } = await import('services/actions.service')
    ajouterCommentaire(idAction, nouveauCommentaire)
      .then((commentaireCree) => {
        const commentairesMisAJour = [...commentaires, commentaireCree]
        setCommentaires(commentairesMisAJour)
        setNouveauCommentaire('')
        inputRef.current!.value = ''
        onAjout(true)
      })
      .catch((error: Error) => {
        onAjout(false)
        console.log("Erreur lors de l'ajout de commentaire", error)
      })
  }

  return (
    <div className='border-t border-solid border-grey_100 pt-5'>
      <h2 className='text-m-bold text-grey_800 pb-6'>Commentaires</h2>
      <div className='flex flex-col w-full'>
        {!commentaires?.length && (
          <span className='mb-4'>
            {"Vous n'avez pas encore de commentaire"}
          </span>
        )}
        {commentaires.length > 0 && (
          <dl>
            {commentaires.map((commentaire) => (
              <CommentaireAction
                key={commentaire.id}
                commentaire={commentaire}
                idConseiller={conseiller.id}
              />
            ))}
          </dl>
        )}

        {!lectureSeule && (
          <>
            <Label htmlFor='commentaire-action' withBulleMessageSensible={true}>
              Commentaire à destination du jeune
            </Label>
            <Textarea
              ref={inputRef}
              id='commentaire-action'
              onChange={setNouveauCommentaire}
            ></Textarea>
            <Button
              className='self-end'
              label='Ajouter un commentaire'
              onClick={ajouterUnCommentaire}
              style={ButtonStyle.SECONDARY}
              disabled={!Boolean(nouveauCommentaire)}
            >
              <IconComponent
                name={IconName.Edit}
                aria-hidden={true}
                focusable={false}
                className='w-4 h-4 mr-4'
              />
              Ajouter un commentaire
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
