import React from 'react'

import Modal from 'components/Modal'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'
import {
  FormContainer,
  RenseignementAgenceMissionLocaleForm,
} from 'components/RenseignementAgenceMissionLocaleForm'
import { StructureConseiller } from 'interfaces/conseiller'
import RenseignementAgencePoleEmploiForm from 'components/RenseignementAgencePoleEmploiForm'

interface RenseignementAgenceModalProps {
  structureConseiller: string
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose: () => void
}

export default function RenseignementAgenceModal({
  structureConseiller,
  referentielAgences,
  onAgenceChoisie,
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
        <InformationMessage
          content={`La liste des agences a été mise à jour et les accents sont pris en compte.`}
        />
      )}

      <div className='mt-2'>
        <InformationMessage
          content={`Une fois votre ${labelAgence} renseignée, ce message n'apparaitra plus.`}
        />
      </div>

      {structureConseiller === StructureConseiller.MILO && (
        <RenseignementAgenceMissionLocaleForm
          referentielAgences={referentielAgences}
          onAgenceChoisie={onAgenceChoisie}
          onClose={onClose}
          container={FormContainer.MODAL}
        />
      )}

      {structureConseiller !== StructureConseiller.MILO && (
        <RenseignementAgencePoleEmploiForm
          referentielAgences={referentielAgences}
          onAgenceChoisie={onAgenceChoisie}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
