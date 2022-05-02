import React, { MouseEvent, useRef } from 'react'

import InfoIcon from '../assets/icons/information.svg'

import Modal from './Modal'

import { Agence, UserStructure } from 'interfaces/conseiller'
import useMatomo from 'utils/analytics/useMatomo'

interface RenseignementAgenceModalProps {
  structureConseiller: string
  referentielAgences: Agence[]
  onClose: () => void
}

export default function RenseignementAgenceModal({
  structureConseiller,
  referentielAgences,
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
      <label htmlFor='typeRendezVous' className='text-base-medium mb-2'>
        <span aria-hidden={true}>* </span>Type
      </label>
      <select
        id='agence'
        name='agence'
        required={true}
        className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 disabled:bg-grey_100`}
      >
        <option aria-hidden hidden disabled value={''} />
        {referentielAgences.map(({ id, nom }) => (
          // TODO voir comment gerer les annonce sans ids
          <option key={id} value={nom}>
            {nom}
          </option>
        ))}
      </select>
    </Modal>
  )
}
