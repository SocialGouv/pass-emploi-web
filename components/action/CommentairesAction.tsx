import React, { useEffect, useState } from 'react'

import { UnCommentaireAction } from 'components/action/UnCommentaireAction'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Commentaire } from 'interfaces/action'
import { ActionsService } from 'services/actions.service'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

interface CommentairesActionProps {
  idAction: string
  commentairesInitiaux: Commentaire[]
  onAjout: (estEnSucces: boolean) => void
}

export function CommentairesAction({
  idAction,
  commentairesInitiaux,
  onAjout,
}: CommentairesActionProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const [commentaires, setCommentaires] = useState<Commentaire[]>([])
  const [nouveauCommentaire, setNouveauCommentaire] = useState<string>('')
  const [conseiller] = useConseiller()

  useEffect(() => {
    setCommentaires(commentairesInitiaux)
  }, [commentairesInitiaux])

  function ajouterUnCommentaire() {
    actionsService
      .ajouterCommentaire(idAction, nouveauCommentaire)
      .then((commentaireCree) => {
        const commentairesMisAJour = [...commentaires, commentaireCree]
        setCommentaires(commentairesMisAJour)
        setNouveauCommentaire('')
        onAjout(true)
      })
      .catch((error: Error) => {
        onAjout(false)
        console.log("Erreur lors de l'ajout de commentaire", error)
      })
  }

  return (
    <div className='border-t border-solid border-grey_100 pt-5'>
      <h2 className='text-m-bold pb-6'>Commentaires</h2>
      <div className='flex flex-col w-full'>
        {!commentaires?.length && (
          <span className='mb-4'>
            {"Vous n'avez pas encore de commentaire"}
          </span>
        )}
        {commentaires.length > 0 && (
          <dl>
            {commentaires.map((commentaire) => (
              <UnCommentaireAction
                key={commentaire.id}
                commentaire={commentaire}
                idConseiller={conseiller?.id}
              />
            ))}
          </dl>
        )}

        <Label htmlFor='commentaire-action' withBulleMessageSensible={true}>
          Commentaire à destination du jeune
        </Label>
        <Textarea
          id='commentaire-action'
          onChange={(event) => {
            setNouveauCommentaire(event.target.value)
          }}
          rows={3}
        ></Textarea>
        <Button
          className='self-end'
          label='Ajouter un commentaire'
          onClick={ajouterUnCommentaire}
          style={ButtonStyle.SECONDARY}
          disabled={!Boolean(nouveauCommentaire)}
        >
          <IconComponent
            name={IconName.Pen}
            aria-hidden={true}
            focusable={false}
            className='w-4 h-4 mr-4'
          />
          Ajouter un commentaire
        </Button>
      </div>
    </div>
  )
}
