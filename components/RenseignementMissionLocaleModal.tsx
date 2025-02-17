import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import { RenseignementMissionLocaleForm } from 'components/RenseignementMissionLocaleForm'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence, MissionLocale } from 'interfaces/referentiel'

interface RenseignementMissionLocaleModalProps {
  referentielMissionsLocales: Agence[]
  onMissionLocaleChoisie: (missionLocale: MissionLocale) => void
  onContacterSupport: () => void
  onClose: () => void
}

export default function RenseignementMissionLocaleModal({
  referentielMissionsLocales,
  onMissionLocaleChoisie,
  onContacterSupport,
  onClose,
}: RenseignementMissionLocaleModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  return (
    <Modal
      ref={modalRef}
      title='Ajoutez votre Mission Locale à votre profil'
      onClose={onClose}
    >
      <div className='mt-2'>
        <InformationMessage label='Une fois votre Mission Locale renseignée, ce message n’apparaîtra plus.' />
      </div>

      <RenseignementMissionLocaleForm
        referentielMissionsLocales={referentielMissionsLocales}
        onMissionLocaleChoisie={onMissionLocaleChoisie}
        onContacterSupport={onContacterSupport}
        onClose={(e) => modalRef.current!.closeModal(e)}
        isInModal={true}
      />
    </Modal>
  )
}
