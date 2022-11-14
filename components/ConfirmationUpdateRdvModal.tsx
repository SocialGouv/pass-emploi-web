import { MouseEvent, useRef } from 'react'

import Modal from './Modal'
import IconComponent, { IconName } from './ui/IconComponent'

import Button, { ButtonStyle } from 'components/ui/Button/Button'

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
      title='Modification de l’événement'
      onClose={onCancel}
      ref={modalRef}
    >
      <div className='px-20 text-center'>
        <IconComponent
          name={IconName.Warning}
          focusable={false}
          aria-hidden={true}
          className='w-[54px] h-[57px] m-auto fill-primary'
        />
        <p className='mt-6 text-base-bold'>
          Vous avez modifié un événement dont vous n’êtes pas le créateur
        </p>
        <p className='mt-6'>
          Le créateur recevra un e-mail de modification de l’événement.
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
