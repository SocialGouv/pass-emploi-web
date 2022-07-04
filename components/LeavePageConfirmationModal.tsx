import { UrlObject } from 'url'

import { MouseEvent, useRef } from 'react'

import WarningIcon from '../assets/icons/warning.svg'

import Modal from './Modal'
import ButtonLink from './ui/ButtonLink'

import Button, { ButtonStyle } from 'components/ui/Button'

interface LeavePageConfirmationModalProps {
  destination: string | UrlObject
  onCancel: () => void
  message: string
  commentaire: string
}

export default function LeavePageConfirmationModal({
  message,
  commentaire,
  onCancel,
  destination,
}: LeavePageConfirmationModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal title='Quitter la page ?' onClose={onCancel} ref={modalRef}>
      <div className='px-20 text-center'>
        <WarningIcon
          focusable={false}
          aria-hidden={true}
          className='w-[54px] h-[57px] m-auto'
        />
        <p className='mt-6 text-base-medium'>{message}</p>
        <p className='mt-6'>{commentaire}</p>
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
        <ButtonLink href={destination}>Continuer</ButtonLink>
      </div>
    </Modal>
  )
}
