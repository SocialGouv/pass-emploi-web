import { UrlObject } from 'url'

import { MouseEvent, useRef } from 'react'

import Modal from './Modal'
import ButtonLink from './ui/Button/ButtonLink'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'

interface LeavePageConfirmationModalProps {
  destination: string | UrlObject
  onCancel: () => void
  titre: string
  commentaire: string
}

export default function LeavePageConfirmationModal({
  titre,
  commentaire,
  onCancel,
  destination,
}: LeavePageConfirmationModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal
      title={titre}
      onClose={onCancel}
      ref={modalRef}
      titleIllustration={IllustrationName.Error}
    >
      <div className='px-20 text-center'>
        <p className='mt-6'>{commentaire}</p>
      </div>

      <div className='mt-4 flex justify-center'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
          className='mr-3'
        >
          Annuler
        </Button>
        <ButtonLink href={destination}>Quitter la page</ButtonLink>
      </div>
    </Modal>
  )
}
