import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import RenseignementAgenceForm from 'components/RenseignementAgenceForm'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'

interface RenseignementAgenceModalProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose: () => void
}

export default function RenseignementAgenceModal({
  referentielAgences,
  onAgenceChoisie,
  onClose,
}: RenseignementAgenceModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  return (
    <Modal
      ref={modalRef}
      title='Ajoutez votre agence à votre profil'
      onClose={onClose}
    >
      <InformationMessage label='La liste des agences a été mise à jour et les accents sont pris en compte.' />

      <div className='mt-2'>
        <InformationMessage label='Une fois votre agence renseignée, ce message n’apparaîtra plus.' />
      </div>

      <RenseignementAgenceForm
        referentielAgences={referentielAgences}
        onAgenceChoisie={onAgenceChoisie}
        onClose={(e) => modalRef.current!.closeModal(e)}
      />
    </Modal>
  )
}
