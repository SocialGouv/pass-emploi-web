import React from 'react'

import ErrorIcon from 'assets/icons/informations/error.svg'

interface InputErrorProps {
  children: string
  id: string
  className?: string
}

export const InputError = ({ id, children, className }: InputErrorProps) => (
  <div id={id} className={`${className ?? ''} flex items-center`}>
    <ErrorIcon
      focusable={false}
      aria-hidden={true}
      className='w-4 h-4 mr-1 shrink-0 fill-warning'
    />
    <p className='text-warning text-s-regular'>{children}</p>
  </div>
)
