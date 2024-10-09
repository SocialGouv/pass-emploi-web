import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'

interface CreationBeneficiaireErreurModalProps {
  adresseMailBeneficiaire: string
  onClose: () => void
  onSubmit: () => void
}
export default function CreationBeneficiaireErreurModal({
  adresseMailBeneficiaire,
  onClose,
  onSubmit,
}: CreationBeneficiaireErreurModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  return (
    <Modal
      ref={modalRef}
      title={`Un compte bénéficiaire avec l’adresse ${adresseMailBeneficiaire} existe déjà dans i-milo`}
      titleIllustration={IllustrationName.Error}
      onClose={onClose}
    >
      <p className='mb-12 text-base-regular text-content_color text-center'>
        Souhaitez-vous bien lier le compte ?
      </p>
      <div className='flex gap-2 justify-center'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
        >
          Annuler
        </Button>
        <Button type='button' style={ButtonStyle.PRIMARY} onClick={onSubmit}>
          Confirmer la création de compte
        </Button>
      </div>
    </Modal>
  )
}
