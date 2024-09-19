import React, { forwardRef } from 'react'

import ErrorIcon from 'assets/icons/informations/error.svg'

interface InputErrorProps {
  children: string
  id: string
  className?: string
}

export const InputError = forwardRef<HTMLDivElement, InputErrorProps>(
  ({ id, children, className }: InputErrorProps, ref) => (
    <div
      id={id}
      className={`${className ?? ''} flex items-center`}
      ref={ref}
      tabIndex={ref ? -1 : undefined}
    >
      <ErrorIcon
        focusable={false}
        aria-hidden={true}
        className='w-4 h-4 mr-1 shrink-0 fill-warning'
      />
      <p className='text-warning text-s-regular'>{children}</p>
    </div>
  )
)
InputError.displayName = 'InputError'
