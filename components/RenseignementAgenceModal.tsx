import React from 'react'

import Modal from 'components/Modal'
import RenseignementAgenceForm from 'components/RenseignementAgenceForm'
import {
  FormContainer,
  RenseignementAgenceMissionLocaleForm,
} from 'components/RenseignementAgenceMissionLocaleForm'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Conseiller, estMilo } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'

interface RenseignementAgenceModalProps {
  conseiller: Conseiller
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onContacterSupport: () => void
  onClose: () => void
}

export default function RenseignementAgenceModal({
  conseiller,
  referentielAgences,
  onAgenceChoisie,
  onContacterSupport,
  onClose,
}: RenseignementAgenceModalProps) {
  const conseillerEstMilo = estMilo(conseiller)
  const labelAgence = conseillerEstMilo ? 'Mission Locale' : 'agence'

  return (
    <Modal
      title={`Ajoutez votre ${labelAgence} à votre profil`}
      onClose={onClose}
    >
      {!conseillerEstMilo && (
        <InformationMessage label='La liste des agences a été mise à jour et les accents sont pris en compte.' />
      )}

      <div className='mt-2'>
        <InformationMessage
          label={`Une fois votre ${labelAgence} renseignée, ce message n'apparaîtra plus.`}
        />
      </div>

      {conseillerEstMilo && (
        <RenseignementAgenceMissionLocaleForm
          referentielAgences={referentielAgences}
          onAgenceChoisie={onAgenceChoisie}
          onContacterSupport={onContacterSupport}
          onClose={onClose}
          container={FormContainer.MODAL}
        />
      )}

      {!conseillerEstMilo && (
        <RenseignementAgenceForm
          referentielAgences={referentielAgences}
          onAgenceChoisie={onAgenceChoisie}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
