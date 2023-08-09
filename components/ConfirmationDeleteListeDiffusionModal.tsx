import { MouseEvent, useRef } from 'react'

import Modal from './Modal'

import IllustrationDelete from 'assets/images/illustration-delete.svg'
import Button, { ButtonStyle } from 'components/ui/Button/Button'

interface ConfirmationDeleteListeDiffusionModalProps {
  titreListeDeDiffusion: string
  onConfirmation: () => void
  onCancel: () => void
}

export default function ConfirmationDeleteListeDiffusionModal({
  titreListeDeDiffusion,
  onCancel,
  onConfirmation,
}: ConfirmationDeleteListeDiffusionModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal
      title={`Souhaitez-vous supprimer la liste de diffusion : ${titreListeDeDiffusion} ?`}
      onClose={onCancel}
      ref={modalRef}
      illustration={
        <IllustrationDelete
          focusable='false'
          aria-hidden='true'
          className='w-1/3 m-auto fill-primary mb-8'
        />
      }
    >
      <div className='px-20 text-center'>
        <p className='mt-6'>
          L’historique des messages envoyés ne sera plus accessible.
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
          Supprimer la liste
        </Button>
      </div>
    </Modal>
  )
}
