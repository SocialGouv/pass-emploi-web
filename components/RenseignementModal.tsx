import React, { MouseEvent, useRef } from 'react'

import InfoIcon from '../assets/icons/information.svg'
import { UserStructure } from '../interfaces/conseiller'

import Modal from './Modal'

interface RenseignementModalProps {
  structureConseiller: string
  onClose: () => void
}

export default function RenseignementModal({
  structureConseiller,
  onClose,
}: RenseignementModalProps) {
  const type =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  return (
    <Modal
      title={`Ajoutez votre ${type} à votre profil`}
      onClose={onClose}
      ref={modalRef}
    >
      <div className='p-4 bg-primary_lighten rounded-medium  text-primary'>
        <p className='flex text-base-medium  items-center mb-2'>
          <InfoIcon focusable={false} aria-hidden={true} className='mr-2' />
          Afin d’améliorer la qualité du service, nous avons besoin de connaître
          votre {type} de rattachement.
        </p>
      </div>
    </Modal>
  )
}
