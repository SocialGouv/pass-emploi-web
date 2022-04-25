import React from 'react'

import Exclamation from '../../assets/icons/exclamation.svg'

interface IntegrationPoleEmploiProps {
  label: string
}

export const IntegrationPoleEmploi = ({
  label,
}: IntegrationPoleEmploiProps) => (
  <div className='bg-primary_lighten rounded-medium flex items-center p-4'>
    <Exclamation
      className='mr-4 fill-primary h-8 w-8'
      focusable='false'
      aria-hidden='true'
    />
    <div>
      <p className='text-sm-medium'>
        Cette fonctionnalité n&apos;est pas encore disponible.
      </p>
      <p className='text-sm-regular'>
        Gérez les {label} de ce jeune depuis vos outils Pôle emploi.
      </p>
    </div>
  </div>
)
