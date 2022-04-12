import React from 'react'
import ChevronUpIcon from '../../assets/icons/chevron_up.svg'
import ChevronDownIcon from '../../assets/icons/chevron_down.svg'

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
        <span className='flex'>
          Réduire la liste{' '}
          <ChevronUpIcon focusable='false' aria-hidden='true' />
        </span>
      )}
      {!isOpen && (
        <span className='flex'>
          Voir l’historique complet{' '}
          <ChevronDownIcon focusable='false' aria-hidden='true' />
        </span>
      )}
    </button>
  )
}
