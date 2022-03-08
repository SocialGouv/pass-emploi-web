import React from 'react'
import Exclamation from '../../assets/icons/exclamation.svg'

interface OldErrorMessageProps {
  children: React.ReactNode
  className?: string
}

export const OldErrorMessage = ({
  children,
  className,
}: OldErrorMessageProps) => (
  <div className={(className || '') + ' flex items-center mb-8'}>
    <Exclamation
      className='mr-1 h-4 w-4'
      focusable='false'
      aria-hidden='true'
    />
    <p className='text-sm-medium text-deprecated_warning'>{children}</p>
  </div>
)
