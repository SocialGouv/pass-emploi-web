import React from 'react'

import Modal from 'components/Modal'
import RenseignementAgenceForm from 'components/RenseignementAgenceForm'
import {
  FormContainer,
  RenseignementAgenceMissionLocaleForm,
} from 'components/RenseignementAgenceMissionLocaleForm'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'

interface RenseignementAgenceModalProps {
  structureConseiller: string
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onContacterSupport: () => void
  onClose: () => void
}

export default function RenseignementAgenceModal({
  structureConseiller,
  referentielAgences,
  onAgenceChoisie,
  onContacterSupport,
  onClose,
}: RenseignementAgenceModalProps) {
  const labelAgence =
    structureConseiller === StructureConseiller.MILO
      ? 'Mission locale'
      : 'agence'

  return (
    <Modal
      title={`Ajoutez votre ${labelAgence} à votre profil`}
      onClose={onClose}
    >
      {structureConseiller !== StructureConseiller.MILO && (
        <InformationMessage label='La liste des agences a été mise à jour et les accents sont pris en compte.' />
      )}

      <div className='mt-2'>
        <InformationMessage
          label={`Une fois votre ${labelAgence} renseignée, ce message n'apparaitra plus.`}
        />
      </div>

      {structureConseiller === StructureConseiller.MILO && (
        <RenseignementAgenceMissionLocaleForm
          referentielAgences={referentielAgences}
          onAgenceChoisie={onAgenceChoisie}
          onContacterSupport={onContacterSupport}
          onClose={onClose}
          container={FormContainer.MODAL}
        />
      )}

      {structureConseiller !== StructureConseiller.MILO && (
        <RenseignementAgenceForm
          referentielAgences={referentielAgences}
          onAgenceChoisie={onAgenceChoisie}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
