import React from 'react'

import IconComponent, { IconName } from '../ui/IconComponent'

interface CollapseButtonProps {
  controlledId: string
  isOpen: boolean
  onClick: () => void
}

export function CollapseButton({
  controlledId,
  isOpen,
  onClick,
}: CollapseButtonProps) {
  return (
    <button
      type='button'
      aria-expanded={isOpen}
      aria-controls={controlledId}
      onClick={onClick}
    >
      {isOpen && (
        <span className='flex text-s-regular'>
          Réduire la liste{' '}
          <IconComponent
            name={IconName.ChevronUp}
            focusable='false'
            aria-hidden='true'
            className='h-6 w-6'
          />
        </span>
      )}
      {!isOpen && (
        <span className='flex text-s-regular'>
          Voir l’historique complet{' '}
          <IconComponent
            name={IconName.ChevronDown}
            focusable='false'
            aria-hidden='true'
            className='h-6 w-6 fill-primary'
          />
        </span>
      )}
    </button>
  )
}
