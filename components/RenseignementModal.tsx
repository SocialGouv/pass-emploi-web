import React from 'react'

import InfoIcon from '../assets/icons/information.svg'
import { UserStructure } from '../interfaces/conseiller'

import Modal from './Modal'

interface RenseignementModalProps {
  typeStructure: string | undefined
}

export default function RenseignementModal({
  typeStructure,
}: RenseignementModalProps) {
  return (
    <Modal title='Ajoutez votre agence à votre profil' onClose={() => {}}>
      <div className='p-4 bg-primary_lighten rounded-medium  text-primary'>
        <p className='flex text-base-medium  items-center mb-2'>
          <InfoIcon focusable={false} aria-hidden={true} className='mr-2' />
          Afin d’améliorer la qualité du service, nous avons besoin de connaître
          votre {typeStructure} de rattachement.
        </p>
      </div>
    </Modal>
  )
}
