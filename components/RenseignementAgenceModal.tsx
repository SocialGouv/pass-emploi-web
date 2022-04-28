import React, { MouseEvent, useRef } from 'react'

import InfoIcon from '../assets/icons/information.svg'

import Modal from './Modal'

import { UserStructure } from 'interfaces/conseiller'
import useMatomo from 'utils/analytics/useMatomo'

interface RenseignementAgenceModalProps {
  structureConseiller: string
  onClose: () => void
}

export default function RenseignementAgenceModal({
  structureConseiller,
  onClose,
}: RenseignementAgenceModalProps) {
  const labelAgence =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  useMatomo('Pop-in sélection agence')

  return (
    <Modal
      title={`Ajoutez votre ${labelAgence} à votre profil`}
      onClose={onClose}
      ref={modalRef}
    >
      <div className='p-4 bg-primary_lighten rounded-medium  text-primary'>
        <p className='flex text-base-medium  items-center mb-2'>
          <InfoIcon focusable={false} aria-hidden={true} className='mr-2' />
          Afin d’améliorer la qualité du service, nous avons besoin de connaître
          votre {labelAgence} de rattachement.
        </p>
      </div>
    </Modal>
  )
}
