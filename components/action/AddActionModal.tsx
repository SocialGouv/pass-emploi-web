import Button, { ButtonColorStyle } from 'components/Button'

import Modal from 'components/Modal'

import { ActionJeune } from 'interfaces/action'
import router from 'next/router'
import React, { useEffect, useState } from 'react'
import { actionsPredefinies } from 'referentiel/action'
import fetchJson from 'utils/fetchJson'

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
  const [conseillerId, setConseillerId] = useState('')

  useEffect(() => {
    //TODO: get from session

    setConseillerId('1')
  }, [])

  const noSelectedAction = () => Boolean(newContent === '')

  const handleSelectedAction = (selectedActionContent: string) => {
    setNewContent(selectedActionContent)
    setIsCommentMode(true)
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

    fetch(
      `${process.env.API_ENDPOINT}/conseillers/${conseillerId}/jeunes/${router.query.jeune_id}/action`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newAction),
      }
    ).then(() => {
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

  return (
    <>
      <Modal
        title='Créer une nouvelle action'
        onClose={handleCloseModal}
        show={!isCommentMode && show}
        customHeight='636px'
        customWidth='939px'
      >
        <div className='flex mb-[40px]'>
          <Button
            type='button'
            className='mr-[8px]'
            style={
              isCustomMode ? ButtonColorStyle.WHITE : ButtonColorStyle.BLUE
            }
            onClick={toggleCustomMode}
          >
            Actions prédéfinies
          </Button>

          <Button
            type='button'
            style={
              isCustomMode ? ButtonColorStyle.BLUE : ButtonColorStyle.WHITE
            }
            onClick={toggleCustomMode}
          >
            Action personnalisée
          </Button>
        </div>

        {!isCustomMode && (
          <div className='h-[425px] overflow-scroll mb-[40px]'>
            {actionsPredefinies.map((action: ActionJeune) => (
              <button
                key={action.id}
                type='button'
                className='w-full px-[24px] py-[16px] mb-[8px] text-left border border-bleu_blanc rounded-medium'
                onClick={() => handleSelectedAction(action.content)}
              >
                <p className='text-sm text-bleu_nuit'>{action.content}</p>
              </button>
            ))}
          </div>
        )}

        {isCustomMode && (
          <div className='h-[425px] mb-[40px]'>
            <form onSubmit={handleAddClick}>
              <label
                htmlFor='customContent'
                className='text-sm text-bleu_nuit block mb-[20px]'
              >
                Intitulé de l&apos;action (obligatoire)
              </label>

              <input
                id='customContent'
                name='customContent'
                maxLength={INPUT_MAX_LENGTH}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className='w-full text-sm text-bleu_nuit p-[16px] mb-[30px] border border-bleu_blanc rounded-medium'
                placeholder='Ajouter un contenu...'
              />

              <label
                htmlFor='cutomComment'
                className='text-sm text-bleu_nuit block mb-[20px]'
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
                className='w-full text-sm text-bleu_nuit p-[16px] mb-[60px] border border-bleu_blanc rounded-medium'
                placeholder='Ajouter un commentaire...'
              />

              <Button
                type='submit'
                className='px-[48px] py-[11px] m-auto'
                disabled={noSelectedAction()}
              >
                <span className='px-[51px]'>Envoyer l&apos;action</span>
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
          setNewComment('')
        }}
        show={isCommentMode && show}
        customHeight='360px'
        customWidth='939px'
      >
        <form onSubmit={handleAddClick}>
          <label
            htmlFor='comment'
            className='text-sm text-bleu_nuit block mb-[20px]'
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
            className='w-full text-sm text-bleu_nuit p-[16px] mb-[30px] border border-bleu_blanc rounded-medium'
            placeholder='Ajouter un commentaire...'
          />

          <Button
            type='submit'
            className='px-[48px] py-[11px] m-auto'
            disabled={noSelectedAction()}
          >
            <span className='px-[51px]'>Envoyer l&apos;action</span>
          </Button>
        </form>
      </Modal>
    </>
  )
}

export default AddActionModal
