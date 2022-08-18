import React from 'react'

import Exclamation from 'assets/icons/exclamation.svg'

interface DeprecatedErrorMessageProps {
  children: React.ReactNode
  className?: string
}

export const DeprecatedErrorMessage = ({
  children,
  className,
}: DeprecatedErrorMessageProps) => (
  <div className={(className || '') + ' flex items-center mb-8'}>
    <Exclamation
      className='mr-1 h-4 w-4'
      focusable='false'
      aria-hidden='true'
    />
    <p className='text-s-bold text-warning'>{children}</p>
  </div>
)
