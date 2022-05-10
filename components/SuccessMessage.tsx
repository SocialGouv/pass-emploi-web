import { ReactElement } from 'react'

import CloseIcon from '../assets/icons/close.svg'
import SuccessIcon from '../assets/icons/done.svg'

interface SuccessMessageProps {
  label: string
  children?: ReactElement
  onAcknowledge?: () => void
}

export default function SuccessMessage({
  label,
  onAcknowledge,
  children,
}: SuccessMessageProps) {
  return (
    <div className='flex-col items-center text-success bg-success_lighten p-6 rounded-medium mb-8'>
      <div className='flex justify-between mb-2'>
        <div className='flex items-center'>
          <SuccessIcon
            aria-hidden={true}
            focusable={false}
            className='w-6 h-6 mr-2'
          />
          <p className='text-base-medium'>{label}</p>
        </div>
        {onAcknowledge && (
          <button
            aria-label="J'ai compris"
            onClick={onAcknowledge}
            className='border-none'
          >
            <CloseIcon
              focusable='false'
              aria-hidden='true'
              className='fill-success'
            />
          </button>
        )}
      </div>
      // FIXME ajoute espace si children
      {children}
    </div>
  )
}
