import { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { IllustrationName } from 'components/ui/IllustrationComponent'

interface LeavePageConfirmationModalProps {
  destination: string
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
  const modalRef = useRef<ModalHandles>(null)

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
