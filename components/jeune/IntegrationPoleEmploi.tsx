import React from 'react'

import Exclamation from '../../assets/icons/informations/error.svg'

interface IntegrationPoleEmploiProps {
  label: string
}

export const IntegrationPoleEmploi = ({
  label,
}: IntegrationPoleEmploiProps) => (
  <div className='bg-primary_lighten rounded-base flex items-center p-4'>
    <Exclamation
      className='mr-4 fill-primary h-8 w-8'
      focusable={false}
      aria-hidden={true}
    />
    <div>
      <p className='text-s-bold'>
        Cette fonctionnalité n&apos;est pas encore disponible.
      </p>
      <p className='text-s-regular'>
        Gérez les {label} de ce bénéficiaire depuis vos outils France Travail.
      </p>
    </div>
  </div>
)
