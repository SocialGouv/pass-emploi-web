import React from 'react'
import ErrorIcon from '../../assets/icons/error_outline.svg'

interface ErrorMessageProps {
  children: string
  className?: string
}

export const ErrorMessage = ({ children, className }: ErrorMessageProps) => (
  <div role='alert' className={`${className ?? ''} flex items-center mt-2`}>
    <ErrorIcon focusable={false} aria-hidden={true} className='mr-1' />
    <p className='text-warning text-sm-semi'>{children}</p>
  </div>
)
