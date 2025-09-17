import { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'

interface ConfirmationActivationCompteurModalProps {
  onConfirmation: () => void
  onClose: () => void
}

export default function ConfirmationActivationCompteurModal({
  onClose,
  onConfirmation,
}: ConfirmationActivationCompteurModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  return (
    <Modal
      title='Information sur le comptage des heures'
      onClose={onClose}
      ref={modalRef}
      titleIllustration={IllustrationName.Info}
    >
      <div className='px-11'>
        <p className=''>
          Le compteur s’incrémente automatiquement à partir des événements,
          rendez-vous et actions.
        </p>
        <p className='mt-5'>
          Les situations d’activité (emploi, immersion, alternance etc.),
          solutions structurantes et périodes d’indisponibilité ne sont pas
          prises en compte.
        </p>
        <p className='mt-5 font-bold'>
          En cas d’inactivité autorisée ou de solution structurante, pensez donc
          à désactiver manuellement le compteur depuis la fiche bénéficiaire
        </p>
        <p className='mt-5'>
          i-milo reste l’outil de référence pour le comptage des heures.
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
          Activer le compteur d’heures
        </Button>
      </div>
    </Modal>
  )
}
