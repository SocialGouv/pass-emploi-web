import { MouseEvent, useRef } from 'react'

import Modal from './Modal'
import { IconName } from './ui/IconComponent'

import Button, { ButtonStyle } from 'components/ui/Button/Button'

interface ConfirmationDeleteListeDiffusionModalProps {
  onConfirmation: () => void
  onCancel: () => void
}

export default function ConfirmationDeleteListeDiffusionModal({
  onCancel,
  onConfirmation,
}: ConfirmationDeleteListeDiffusionModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal
      title='Suppression de la liste de diffusion'
      titleIcon={IconName.Warning}
      onClose={onCancel}
      ref={modalRef}
    >
      <div className='px-20 text-center'>
        <p className='mt-6 text-base-bold'>
          Vous allez supprimer cette liste de diffusion
        </p>
        <p className='mt-6'>Veuillez confirmer la suppression.</p>
      </div>

      <div className='mt-14 flex justify-center'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
          className='mr-3'
        >
          Annuler
        </Button>
        <Button type='button' onClick={onConfirmation}>
          Confirmer
        </Button>
      </div>
    </Modal>
  )
}
