import { MouseEvent, useRef } from 'react'

import WarningIcon from '../assets/icons/warning.svg'

import Modal from './Modal'

import Button, { ButtonStyle } from 'components/ui/Button'

interface ConfirmationUpdateRdvModalProps {
  onConfirmation: () => void
  onCancel: () => void
}

export default function ConfirmationUpdateRdvModal({
  onCancel,
  onConfirmation,
}: ConfirmationUpdateRdvModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal
      title='Modification du rendez-vous'
      onClose={onCancel}
      ref={modalRef}
    >
      <div className='px-20 text-center'>
        <WarningIcon focusable={false} aria-hidden={true} className='m-auto' />
        <p className='mt-6 text-base-medium'>
          Vous avez modifié un rendez-vous dont vous n’êtes pas le créateur
        </p>
        <p className='mt-6'>
          Le créateur recevra un e-mail de modification du rendez-vous.
        </p>
        <p className='mt-6'>
          Les bénéficiaires seront notifiés sur l’application CEJ.
        </p>
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
