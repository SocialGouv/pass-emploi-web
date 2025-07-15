import { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'

interface ConfirmationDeleteListeModalProps {
  titreListe: string
  onConfirmation: () => void
  onCancel: () => void
}

export default function ConfirmationDeleteListeModal({
  titreListe,
  onCancel,
  onConfirmation,
}: ConfirmationDeleteListeModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  return (
    <Modal
      title={`Souhaitez-vous supprimer la liste : ${titreListe} ?`}
      onClose={onCancel}
      ref={modalRef}
      titleIllustration={IllustrationName.Delete}
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
