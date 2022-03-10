import React from 'react'
import ErrorIcon from '../../assets/icons/error_outline.svg'

interface InputErrorProps {
  children: string
  id?: string
  className?: string
}

export const InputError = ({ id, children, className }: InputErrorProps) => (
  <div id={id} className={`${className ?? ''} flex items-center`}>
    <ErrorIcon focusable={false} aria-hidden={true} className='mr-1 shrink-0' />
    <p className='text-warning text-sm-semi'>{children}</p>
  </div>
)
