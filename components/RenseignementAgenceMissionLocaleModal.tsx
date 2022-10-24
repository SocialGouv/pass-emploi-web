import React from 'react'

import Modal from 'components/Modal'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'
import {
  FormContainer,
  RenseignementAgenceMissionLocaleForm,
} from 'components/RenseignementAgenceMissionLocaleForm'

interface RenseignementAgenceMissionLocaleModalProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose: () => void
}

export default function RenseignementAgenceMissionLocaleModal({
  referentielAgences,
  onAgenceChoisie,
  onClose,
}: RenseignementAgenceMissionLocaleModalProps) {
  return (
    <Modal
      title={`Ajoutez votre Mission Locale à votre profil`}
      onClose={onClose}
    >
      <div className='mt-2'>
        <InformationMessage
          content={`Une fois votre Mission Locale renseignée, ce message n'apparaitra plus.`}
        />
      </div>

      <RenseignementAgenceMissionLocaleForm
        referentielAgences={referentielAgences}
        onAgenceChoisie={onAgenceChoisie}
        onClose={onClose}
        container={FormContainer.MODAL}
      />
    </Modal>
  )
}
