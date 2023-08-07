import { UrlObject } from 'url'

import dynamic from 'next/dynamic'
import { MouseEvent, useRef } from 'react'

import Modal from './Modal'
import ButtonLink from './ui/Button/ButtonLink'

import Button, { ButtonStyle } from 'components/ui/Button/Button'

const IllustrationError = dynamic(
  import('../assets/images/illustration-error.svg'),
  { ssr: false }
)

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
      illustration={
        <IllustrationError
          focusable='false'
          aria-hidden='true'
          className='w-1/3 m-auto fill-primary mb-8'
        />
      }
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
