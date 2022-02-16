import Button, { ButtonStyle } from 'components/ui/Button'
import Modal from 'components/Modal'
import { ActionJeune } from 'interfaces/action'
import { useSession } from 'next-auth/react'
import router from 'next/router'
import React, { useState } from 'react'
import { actionsPredefinies } from 'referentiel/action'
import { ActionsService } from 'services/actions.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useDependance } from 'utils/injectionDependances'

const INPUT_MAX_LENGTH = 250

type ActionModalProps = {
  show: boolean
  onClose: any
  onAdd: any
}

const AddActionModal = ({ show, onClose, onAdd }: ActionModalProps) => {
  const [newContent, setNewContent] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isCommentMode, setIsCommentMode] = useState(false)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [isBackClicked, setIsBackClicked] = useState(false)
  const actionsService = useDependance<ActionsService>('actionsService')
  const { data: session } = useSession({ required: true })

  const noSelectedAction = () => Boolean(newContent === '')

  const handleSelectedAction = (selectedActionContent: string) => {
    setNewContent(selectedActionContent)
    setIsCommentMode(true)
    setIsBackClicked(false)
  }

  const toggleCustomMode = () => {
    setIsCustomMode(!isCustomMode)
    setNewContent('')
    setNewComment('')
  }

  const handleAddClick = (event: any) => {
    event.preventDefault()

    if (noSelectedAction()) {
      return
    }

    const newAction = {
      content: newContent,
      comment: newComment,
    }

    actionsService
      .createAction(
        newAction,
        session!.user.id,
        router.query.jeune_id as string,
        session!.accessToken
      )
      .then(() => {
        setNewContent('')
        onAdd(newContent)
        onClose()
      })
  }

  const handleCloseModal = () => {
    setNewContent('')
    setIsCommentMode(false)
    setNewComment('')
    onClose()
  }
  useMatomo(
    isCustomMode
      ? 'Actions jeune - Modale création action personnalisée'
      : 'Actions jeune - Modale création action prédéfinie'
  )

  useMatomo(
    isCommentMode
      ? 'Actions jeune - Modale création action commentaire'
      : undefined
  )

  useMatomo(
    isBackClicked
      ? 'Actions jeune - Modale création action prédéfinie'
      : undefined
  )

  return (
    <>
      <Modal
        title='Créer une nouvelle action'
        onClose={handleCloseModal}
        show={!isCommentMode && show}
        customHeight='636px'
        customWidth='939px'
      >
        <div className='flex mb-10'>
          <Button
            type='button'
            className='mr-2'
            style={isCustomMode ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY}
            onClick={toggleCustomMode}
          >
            Actions prédéfinies
          </Button>

          <Button
            type='button'
            style={isCustomMode ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY}
            onClick={toggleCustomMode}
          >
            Action personnalisée
          </Button>
        </div>

        {!isCustomMode && (
          <div className='h-[425px] overflow-scroll mb-10'>
            {actionsPredefinies.map((action: ActionJeune) => (
              <button
                key={action.id}
                type='button'
                className='w-full px-6 py-4 mb-2 text-left border border-solid border-bleu_blanc rounded-medium'
                onClick={() => handleSelectedAction(action.content)}
              >
                <p className='text-sm text-bleu_nuit'>{action.content}</p>
              </button>
            ))}
          </div>
        )}

        {isCustomMode && (
          <div className='h-[425px] mb-10'>
            <form onSubmit={handleAddClick}>
              <label
                htmlFor='customContent'
                className='text-sm text-bleu_nuit block mb-5'
              >
                Intitulé de l&apos;action (obligatoire)
              </label>

              <input
                id='customContent'
                name='customContent'
                maxLength={INPUT_MAX_LENGTH}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className='w-full text-sm text-bleu_nuit p-4 mb-7 border border-solid border-bleu_blanc rounded-medium'
                placeholder='Ajouter un contenu...'
              />

              <label
                htmlFor='cutomComment'
                className='text-sm text-bleu_nuit block mb-5'
              >
                Commentaire de l&apos;action
              </label>

              <textarea
                id='cutomComment'
                name='cutomComment'
                maxLength={INPUT_MAX_LENGTH}
                rows={3}
                cols={5}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className='w-full text-sm text-bleu_nuit p-4 mb-14 border border-bleu_blanc rounded-medium'
                placeholder='Ajouter un commentaire...'
              />

              <Button
                type='submit'
                className='px-12 py-2.5 m-auto'
                disabled={noSelectedAction()}
              >
                <span className='px-12'>Envoyer l&apos;action</span>
              </Button>
            </form>
          </div>
        )}
      </Modal>

      <Modal
        title={newContent}
        onClose={handleCloseModal}
        onBack={() => {
          setIsCommentMode(false)
          setIsBackClicked(true)
          setNewComment('')
        }}
        show={isCommentMode && show}
        customHeight='360px'
        customWidth='939px'
      >
        <form onSubmit={handleAddClick}>
          <label
            htmlFor='comment'
            className='text-sm text-bleu_nuit block mb-5'
          >
            Ajouter un commentaire à votre action
          </label>

          <textarea
            id='comment'
            name='comment'
            rows={3}
            cols={5}
            value={newComment}
            maxLength={INPUT_MAX_LENGTH}
            onChange={(e) => setNewComment(e.target.value)}
            className='w-full text-sm text-bleu_nuit p-4 mb-7 border border-bleu_blanc rounded-medium'
            placeholder='Ajouter un commentaire...'
          />

          <Button
            type='submit'
            className='px-12 py-2.5 m-auto'
            disabled={noSelectedAction()}
          >
            <span className='px-12'>Envoyer l&apos;action</span>
          </Button>
        </form>
      </Modal>
    </>
  )
}

export default AddActionModal
