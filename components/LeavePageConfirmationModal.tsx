import { UrlObject } from 'url'

import { MouseEvent, useRef } from 'react'

import Modal from './Modal'
import ButtonLink from './ui/Button/ButtonLink'
import IconComponent, { IconName } from './ui/IconComponent'

import Button, { ButtonStyle } from 'components/ui/Button/Button'

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
        <IconComponent
          name={IconName.Warning}
          focusable={false}
          aria-hidden={true}
          className='w-[54px] h-[57px] m-auto fill-primary'
        />
        <p className='mt-6 text-base-bold'>{message}</p>
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
