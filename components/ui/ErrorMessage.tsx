import React from 'react'
import ErrorIcon from '../../assets/icons/error_outline.svg'

interface ErrorMessageProps {
  children: string
  id?: string
  className?: string
}

export const ErrorMessage = ({
  id,
  children,
  className,
}: ErrorMessageProps) => (
  <div id={id} className={`${className ?? ''} flex items-center`}>
    <ErrorIcon focusable={false} aria-hidden={true} className='mr-1' />
    <p className='text-warning text-sm-semi'>{children}</p>
  </div>
)
