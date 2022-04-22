<<<<<<< Updated upstream
import Button, { ButtonStyle } from 'components/ui/Button'
import { MouseEvent, useRef } from 'react'
=======
>>>>>>> Stashed changes
import { UrlObject } from 'url'

import WarningIcon from '../assets/icons/warning.svg'

import Modal from './Modal'
import ButtonLink from './ui/ButtonLink'

import Button, { ButtonStyle } from 'components/ui/Button'

interface ExitPageConfirmationModalProps {
  destination: string | UrlObject
  onCancel: () => void
  source?: 'creation' | 'edition'
  message?: string
}

export default function ExitPageConfirmationModal({
  message,
  onCancel,
  source = 'creation',
  destination,
}: ExitPageConfirmationModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal title='Quitter la page ?' onClose={onCancel} ref={modalRef}>
      <div className='px-20 text-center'>
        <WarningIcon focusable={false} aria-hidden={true} className='m-auto' />
        <p className='mt-6 text-base-medium'>{message}</p>
        <p className='mt-6'>
          Toutes les informations{' '}
          {source === 'edition' ? 'modifiées' : 'saisies'} seront perdues
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
        <ButtonLink href={destination}>Continuer</ButtonLink>
      </div>
    </Modal>
  )
}
